import kvs, { WhereConditions } from "@forge/kvs";
import logger from "./logger";
import z from "zod";

const PageAttachmentLinkSchema = z.object({
    pageId: z.string(),
    attachmentId: z.string(),
    issueId: z.string(),
});

type PageAttachmentLink = z.infer<typeof PageAttachmentLinkSchema>;

class PageStorage {
    private readonly keyPrefix: string = "pageStorage";

    async savePage(params: PageAttachmentLink) {
        try {
            PageAttachmentLinkSchema.parse(params);
            let key = this.getKey(params.issueId, params.attachmentId);

            await kvs.set(key, JSON.stringify(params));

            logger.log(`Page stored: ${key}\n${JSON.stringify(params)}`);
        } catch (e) {
            logger.error("Unable to store page", e);
        }
    }

    async getPage(issueId: string | number, pageId: string | number) {
        const value = await kvs.get(this.getKey(issueId, pageId));

        return value ? PageAttachmentLinkSchema.parse(value) : undefined;
    }

    async getPages(issueId: string | number) {
        const queryKey = this.getKey(issueId);
        logger.debug(`Querying for pages with key: ${queryKey}`);

        const value = await kvs
            .query()
            .where("key", WhereConditions.beginsWith(queryKey))
            .limit(10)
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

        const pages = validatedResults.map((json) =>
            PageAttachmentLinkSchema.parse(JSON.parse(json.value)),
        );
        return pages;
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

const stringOrNumber = z.union([z.string(), z.number()]);

export const pageStorage = new PageStorage();
