import api, { route } from "@forge/api";
import { z } from "zod";
import logger from "../logger";

const PageBodySchema = z.object({
    representation: z.literal("storage"),
    value: z.string(),
});

const CreatePageDataSchema = z.object({
    spaceId: z.string(),
    status: z.literal("current"),
    title: z.string(),
    parentId: z.string(),
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

export const createPage = async (pageData: CreatePageData) => {
    logger.debug(`Creating page`);

    const response = await api
        .asApp()
        .requestConfluence(route`/wiki/api/v2/pages`, {
            method: "POST",
            body: JSON.stringify(pageData),
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });

    const data = CreatePage200ResponseSchema.parse(await response.json());

    if (response.ok) {
        logger.debug(`Successfully created page: `, data);
        return data;
    } else {
        logger.error(
            `Failed to create page: ${JSON.stringify(data)}`,
            response,
        );
        throw new Error(
            `Failed to create page with status: ${response.status} ${response.statusText}`,
        );
    }
};

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
        logger.error(`Failed to delete page: ${pageId}`, response);
        throw new Error(
            `Failed to delete page: ${pageId} with status: ${response.status} ${response.statusText}`,
        );
    }
};
