import z from "zod";
import kvs, { WhereConditions } from "@forge/kvs";
import logger from "../logger";
import { stringOrNumber } from "../../../shared/schemas";

const PageAttachmentLinkSchema = z.object({
    pageId: z.string(),
    attachmentId: z.string(),
    issueId: z.string(),
});

type PageAttachmentLink = z.infer<typeof PageAttachmentLinkSchema>;

class PageAttachmentLinkRepository {
    private readonly keyPrefix: string = "pageStorage";

    async savePage(params: PageAttachmentLink) {
        try {
            PageAttachmentLinkSchema.parse(params);
            const key = this.getKey(params.issueId, params.attachmentId);

            await kvs.set(key, JSON.stringify(params));

            logger.log(`Page stored: ${params.pageId}`);
        } catch (e) {
            logger.error("Unable to store page", e);
        }
    }

    async getPage(issueId: string | number, attachmentId: string | number) {
        const value = z
            .string()
            .optional()
            .parse(await kvs.get(this.getKey(issueId, attachmentId)));

        return value
            ? PageAttachmentLinkSchema.parse(JSON.parse(value))
            : undefined;
    }

    async deletePage(issueId: string | number, pageId: string | number) {
        const cacheKey = this.getKey(issueId, pageId);
        logger.debug(`Deleting kvs entry: ${cacheKey}`);

        return kvs.delete(cacheKey).catch((e: unknown) => {
            logger.error(`Unable to delete kvs entry ${cacheKey}`, e);
            throw e;
        });
    }

    async getPages(issueId: string | number) {
        const queryKey = this.getKey(issueId);
        logger.debug(`Querying for pages with key: ${queryKey}`);

        const value = await kvs
            .query()
            .where("key", WhereConditions.beginsWith(queryKey))
            .limit(50)
            .getMany();

        if (!value) return [];

        const validatedResults = z
            .array(
                z.object({
                    key: z.string(),
                    value: z.string(),
                }),
            )
            .parse(value.results);

        return validatedResults.map((json) =>
            PageAttachmentLinkSchema.parse(JSON.parse(json.value)),
        );
    }

    private getKey(...args: (string | number)[]): string {
        const parsedArgs = z.array(stringOrNumber).safeParse(args);
        if (!parsedArgs.success)
            throw new InvalidStorageKeyError("Invalid storage key");
        for (const arg of args) {
            if (!arg) throw new InvalidStorageKeyError("Arg cannot be empty");
            if (typeof arg === "string" && arg.includes("-"))
                throw new InvalidStorageKeyError("Arg cannot contain -");
        }

        try {
            return [this.keyPrefix, ...args].join("-");
        } catch (e) {
            logger.error("Unable to generate storage key", e);
            throw new InvalidStorageKeyError("Unknown reason");
        }
    }
}

class InvalidStorageKeyError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InvalidStorageKeyError";
    }
}

export const pageAttachmentLinkRepository = new PageAttachmentLinkRepository();
