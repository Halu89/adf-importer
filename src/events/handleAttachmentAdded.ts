import { getAttachment } from "../lib/jira-api/AttachmentApi";
import z from "zod";
import {
    createPage,
    type CreatePage200Response,
    pageCreator,
} from "../lib/confluence-api/PageAPI";
import logger from "../lib/logger";
import { StorageFormatValidator } from "../lib/PageValidator";
import { createInternalComment } from "../lib/jira-api/IssueCommentAPI";
import {
    pageAttachmentLinkRepository,
    settingsRepository,
} from "../lib/storage";
import { AttachmentSchema } from "../lib/schemas";

const AttachmentEventSchema = z.object({
    eventType: z.literal("avi:jira:created:attachment"),
    attachment: AttachmentSchema,
});

type Attachment = z.infer<typeof AttachmentSchema>;

export async function handleAttachmentAdded(event: unknown, _context: unknown) {
    let parsed: z.infer<typeof AttachmentEventSchema>;
    try {
        logger.debug("Parsing attachment added event");
        parsed = AttachmentEventSchema.parse(event);
    } catch (e: unknown) {
        logger.error("Error parsing event", e);
        throw e;
    }

    if (
        parsed.attachment.mimeType === "text/plain" ||
        parsed.attachment.mimeType === "binary/octet-stream"
    ) {
        logger.debug("Attachment is a text file, proceeding to process it");
        const resp = await getAttachment(parsed.attachment.id);

        if (StorageFormatValidator.instance.validatePage(resp)) {
            const page = await createPageFromAttachment(
                parsed.attachment,
                resp,
            );
            logger.log(
                `Successfully created page for attachment: ${parsed.attachment.id}\n${JSON.stringify(page, null, 2)}`,
            );

            if (page?.id) {
                await pageAttachmentLinkRepository.savePage({
                    attachmentId: parsed.attachment.id,
                    issueId: parsed.attachment.issueId,
                    pageId: page?.id,
                });
                await createInternalComment(
                    parsed.attachment.issueId,
                    createLinkToPage(pageUrl(page)),
                );
            }

            logger.log(
                `Successfully created comment for attachment: ${parsed.attachment.id}`,
            );
        } else {
            logger.log("Ignoring attachment: Invalid document format");
        }
    } else {
        logger.log(
            `Ignoring attachment: ${parsed.attachment.id} as it is not a text file`,
        );
    }
}

const pageUrl = (page: CreatePage200Response | undefined) => {
    if (!page?._links?.base || !page?._links?.webui) return;

    return `${page?._links?.base}${page?._links?.webui}`;
};

async function createPageFromAttachment(attachment: Attachment, text: string) {
    /**
     * The ID of the Confluence space where the page will be created. Will have to be configurable
     */
    const spaceSetting = await settingsRepository.getGlobalSetting();
    if (!spaceSetting) {
        logger.error("No global space setting found");
        return;
    }

    return createPage(
        {
            spaceId: String(spaceSetting.id),
            body: {
                representation: "storage",
                value: text,
            },
            status: "current",
            title: `${attachment.issueId} - ${attachment.fileName} - ${attachment.createDate}`,
        },
        pageCreator,
    );
}

function createLinkToPage(pageUrl?: string) {
    if (pageUrl) {
        return {
            type: "doc",
            content: [
                {
                    type: "paragraph",
                    attrs: {
                        localId: "2b7a5e7a-d3a1-43ba-9069-9b20fdf52f91",
                    },
                    content: [
                        {
                            text: "ADF imported:",
                            type: "text",
                        },
                        {
                            type: "inlineCard",
                            attrs: {
                                url: pageUrl,
                            },
                        },
                    ],
                },
            ],
            version: 1,
        };
    } else {
        return {
            type: "doc",
            content: [
                {
                    type: "paragraph",
                    attrs: {
                        localId: "2b7a5e7a-d3a1-43ba-9069-9b20fdf52f91",
                    },
                    content: [
                        {
                            text: "ADF imported",
                            type: "text",
                        },
                    ],
                },
            ],
            version: 1,
        };
    }
}
