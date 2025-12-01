import z from "zod";
import logger from "../lib/logger";
import { IssueSchema, UserSchema } from "../../shared/schemas";
import { cleanupAll } from "../lib/CleanupService";

const IssueDeletedEventSchema = z.object({
    eventType: z.literal("avi:jira:deleted:issue"),
    issue: IssueSchema,
    atlassianId: z.string().optional(),
    associatedUsers: z.array(UserSchema).optional(),
});

export async function handleIssueDeleted(event: unknown, _context: unknown) {
    try {
        logger.debug("Parsing issue deleted event");
        const parsed = IssueDeletedEventSchema.parse(event);

        await cleanupAll(parsed.issue.id).catch((e: unknown) =>
            logger.error("Error cleaning up issue", e),
        );
    } catch (e: unknown) {
        logger.error("Error parsing event", e);
    }
}
