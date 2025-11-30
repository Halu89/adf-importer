import z from "zod";
import logger from "../lib/logger";
import { AttachmentSchema } from "../lib/schemas";

const AttachmentDeletedEventSchema = z.object({
    eventType: z.literal("avi:jira:deleted:Attachment"),
    attachment: AttachmentSchema,
});

export function handleAttachmentDeleted(event: unknown, _context: unknown) {
    try {
        const parsed = AttachmentDeletedEventSchema.parse(event);
        logger.log(`Event received: ${parsed.eventType}`);
        logger.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
        logger.error("Error parsing event", e);
    }
}
