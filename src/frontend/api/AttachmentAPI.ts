import { queryOptions } from "@tanstack/react-query";
import { requestJira } from "@forge/bridge";
import logger from "../../lib/logger";
import z from "zod";

export function getAttachmentsForIssue(issueId: string | number | undefined) {
    return queryOptions({
        queryKey: ["GetAttachments", issueId],
        queryFn: async () => {
            if (!issueId) {
                throw new Error("Issue ID is required to fetch attachments");
            }

            const resp = await requestJira(`/rest/api/3/issue/${issueId}`, {
                headers: {
                    Accept: "application/json",
                },
            });

            if (resp.ok) {
                try {
                    const attachments = IssueDetailsSchema.parse(
                        await resp.json(),
                    ).fields.attachment;
                    console.debug("attachments :>> ", attachments);

                    return attachments.filter((a) =>
                        ALLOWED_MIME_TYPES.includes(
                            a.mimeType as (typeof ALLOWED_MIME_TYPES)[number],
                        ),
                    );
                } catch (e: unknown) {
                    logger.error("Unable to parse attachments response", e);
                    throw new Error("Unable to parse attachments response");
                }
            } else {
                logger.error("Unable to retrieve issue attachments", resp);
                throw new Error("Unable to retrieve issue attachments");
            }
        },
        enabled: issueId != null,
    });
}

const ALLOWED_MIME_TYPES = ["binary/octet-stream", "text/plain"] as const;

const IssueAttachmentSchema = z.object({
    id: z.string(),
    filename: z.string(),
    mimeType: z.string(),
    content: z.string(),
});

export type IssueAttachment = z.infer<typeof IssueAttachmentSchema>;

const IssueDetailsSchema = z.object({
    id: z.string(),
    key: z.string(),
    fields: z.object({
        attachment: z.array(IssueAttachmentSchema),
    }),
});
