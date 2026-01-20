import api, { fetch, type Response, route } from "@forge/api";
import { z } from "zod";
import type { PersonalSettings } from "../../../shared/schemas";
import logger from "../logger";

const PageBodySchema = z.object({
    representation: z.literal("storage"),
    value: z.string(),
});

const CreatePageDataSchema = z.object({
    spaceId: z.string(),
    status: z.literal("current"),
    title: z.string(),
    parentId: z.string().optional(),
    body: PageBodySchema,
});

type CreatePageData = z.infer<typeof CreatePageDataSchema>;

export const CreatePage200ResponseSchema = z.object({
    id: z.string(),
    title: z.string().optional(),
    spaceId: z.string().optional(),
    _links: z
        .object({
            base: z.string().optional(),
            webui: z.string().optional(),
        })
        .optional(),
});

export type CreatePage200Response = z.infer<typeof CreatePage200ResponseSchema>;

const CreatePage400ResponseSchema = z.object({
    errors: z.array(
        z.object({
            status: z.number(),
            code: z.string(),
            title: z.string(),
            detail: z.string().nullish(),
        }),
    ),
});

export const createPage = async (
    pageData: CreatePageData,
    pageCreator: PageCreator,
) => {
    logger.debug(`Creating page`);

    const response = await pageCreator.createPage(pageData);

    if (response.ok) {
        const data = CreatePage200ResponseSchema.parse(await response.json());
        logger.debug(`Successfully created page: `, data);
        return data;
    } else {
        logger.error(
            `Failed to create page: ${JSON.stringify(pageData)}`,
            response,
        );

        const errorResponse = await response.json();
        const parse = CreatePage400ResponseSchema.safeParse(errorResponse);

        if (parse.success) {
            const errMessage = humanFriendlyError(parse.data);
            logger.error(`Failed to create page: `, errMessage);
            throw new Error(errMessage);
        } else {
            logger.error(`Failed to validate error response: `, parse.error);
            throw new Error(
                `Failed to create page with status: ${response.status} ${response.statusText}`,
            );
        }
    }
};

const humanFriendlyError = (
    error: z.infer<typeof CreatePage400ResponseSchema>,
) => {
    if (error.errors.some((e) => e.title.includes("already exist"))) {
        return "Page already exists with the same title in this space";
    } else {
        return error.errors.map((e) => e.title).join(", ");
    }
};

abstract class PageCreator {
    abstract createPage(pageData: CreatePageData): Promise<Response>;

    /**
     * Builds a page title using the file name and issue key (preferred) or attachment ID (fallback).
     * The issue key is more human-readable than the attachment ID (e.g., "PROJ-123" vs "12345").
     *
     * @param fileName - The name of the attachment file
     * @param issueKey - Optional issue key (e.g., "PROJ-123"). Used when available for better readability.
     * @param attachmentId - Optional attachment ID. Used as fallback if issue key is not provided.
     * @returns A formatted page title string
     */
    buildPageTitle(
        fileName: string | undefined,
        issueKey?: string,
        attachmentId?: string,
    ) {
        const identifier = issueKey ?? attachmentId;
        const timestamp = Date.now();

        if (fileName && identifier) {
            return `${fileName} - ${identifier} - ${timestamp}`;
        } else if (fileName) {
            return `${fileName} - ${timestamp}`;
        } else {
            return `Exported page - ${timestamp}`;
        }
    }
}

class CurrentInstancePageCreator extends PageCreator {
    async createPage(pageData: CreatePageData) {
        return await api.asApp().requestConfluence(route`/wiki/api/v2/pages`, {
            method: "POST",
            body: JSON.stringify(pageData),
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
    }
}

export const pageCreator = new CurrentInstancePageCreator();

export class RemotePageCreator extends PageCreator {
    private readonly authorizationHeader: string;

    constructor(private readonly settings: PersonalSettings) {
        super();
        this.settings = settings;

        const { email, token } = settings.authentication;

        const encoded = Buffer.from(`${email}:${token}`).toString("base64");
        this.authorizationHeader = `Basic ${encoded}`;
    }

    async createPage(pageData: CreatePageData) {
        if (!this.settings) {
            throw new Error("No personal settings found for user");
        }

        const replacedPageData = this.applyReplacements(pageData);

        return await fetch(
            `${this.settings.targetInstance}/wiki/api/v2/pages`,
            {
                method: "POST",
                body: JSON.stringify(replacedPageData),
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: this.authorizationHeader,
                },
            },
        );
    }

    /**
     * Allows us to modify the macro app id and environment id to apply to different contexts
     */
    applyReplacements(pageData: CreatePageData) {
        if (!this.settings.replacements) {
            return pageData;
        }

        let value = pageData.body.value;

        for (const replacement of this.settings.replacements) {
            logger.debug(
                `Replacing ${replacement.from} with ${replacement.to}`,
            );
            value = value.replaceAll(replacement.from, replacement.to);
        }

        return {
            ...pageData,
            body: { value, representation: pageData.body.representation },
        };
    }
}

export const deletePage = async (pageId: string | number) => {
    logger.debug(`Deleting page: ${pageId}`);
    const response = await api
        .asApp()
        .requestConfluence(route`/wiki/api/v2/pages/${pageId}`, {
            method: "DELETE",
        });

    if (response.ok) {
        logger.debug("Successfully deleted page: ", pageId);
    } else {
        logger.error(
            `Failed to delete page: ${pageId}`,
            response,
            await response.json(),
        );
        throw new Error(
            `Failed to delete page: ${pageId} with status: ${response.status} ${response.statusText}`,
        );
    }
};
