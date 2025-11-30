import z from "zod";
import logger from "../lib/logger";
import { IssueSchema, UserSchema } from "../lib/schemas";

const IssueDeletedEventSchema = z.object({
    eventType: z.literal("avi:jira:deleted:issue"),
    issue: IssueSchema,
    atlassianId: z.string().optional(),
    associatedUsers: z.array(UserSchema).optional(),
});

export function handleIssueDeleted(event: unknown, _context: unknown) {
    try {
        const parsed = IssueDeletedEventSchema.parse(event);

        logger.log(
            `Event received: ${parsed.eventType}\n${JSON.stringify(parsed, null, 2)}`,
        );
    } catch (e: unknown) {
        logger.error("Error parsing event", e);
    }
}
