import {queryOptions} from "@tanstack/react-query";
import {requestJira} from "@forge/bridge";
import logger from "../../lib/logger";
import z from "zod";

/**
 * No_release: It returns a 401 for some reason ?
 */
export function getAttachmentsForIssue(issueId: string | number | undefined) {
    return queryOptions({
        queryKey: ["GetAttachments", issueId],
        queryFn: async () => {
            if (!issueId) {
                throw new Error("Issue ID is required to fetch attachments")
            }

            const resp = await requestJira(`/rest/api/3/issue/${issueId}`, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (resp.ok) {
                const attachments = IssueDetailsSchema.parse(resp.json()).fields.attachments
                return attachments.filter(a => ALLOWED_MIME_TYPES.includes(a.mimeType as any))
            } else {
                logger.error("Unable to retrieve issue attachments", resp);
                throw new Error("Unable to retrieve issue attachments");
            }
        },
        enabled: issueId != undefined
    })
}

const ALLOWED_MIME_TYPES = ["binary/octet-stream", "text/plain" ] as const;

const IssueDetailsSchema = z.object({
    id: z.string(),
    key: z.string(),
    fields: z.object({
        attachments: z.array(z.object({
            id: z.string(),
            filename: z.string(),
            mimeType: z.string(),
            content: z.string(),
        }))
    })

})
