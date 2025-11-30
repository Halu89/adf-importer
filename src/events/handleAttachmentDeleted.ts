import z from "zod";
import logger from "../lib/logger";
import { AttachmentSchema } from "../lib/schemas";
import { cleanup } from "../lib/CleanupService";

const AttachmentDeletedEventSchema = z.object({
    eventType: z.literal("avi:jira:deleted:attachment"),
    attachment: AttachmentSchema,
});

export async function handleAttachmentDeleted(
    event: unknown,
    _context: unknown,
) {
    try {
        logger.debug("Parsing attachment deleted event");
        const parsed = AttachmentDeletedEventSchema.parse(event);
        logger.log(`Event received: ${parsed.eventType}`);

        await cleanup(parsed.attachment.issueId, parsed.attachment.id).catch(
            (e: unknown) => logger.error("Error cleaning up attachment", e),
        );
    } catch (e) {
        logger.error("Error parsing event", e);
    }
}
