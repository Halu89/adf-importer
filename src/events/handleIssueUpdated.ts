import z from "zod";
import logger from "../lib/logger";
import {
    ChangelogSchema,
    IssueSchema,
    StatusSchema,
    UserSchema,
} from "../lib/schemas";

const IssueUpdatedEventSchema = z.object({
    eventType: z.literal("avi:jira:updated:issue"),
    issue: IssueSchema,
    /**
     * The id of the user that has caused the event
     */
    atlassianId: z.string().optional(),
    changelog: ChangelogSchema,
    associatedUsers: z.array(UserSchema).optional(),
    associatedStatuses: z.array(StatusSchema).optional(),
});

export function handleIssueUpdated(event: unknown, _context: unknown) {
    try {
        const parsed = IssueUpdatedEventSchema.parse(event);

        logger.log(
            `Event received: ${parsed.eventType}\n${JSON.stringify(event, null, 2)}`,
        );

        parsed?.changelog?.items?.forEach((item) => {
            logger.log(item);
        });
    } catch (e: unknown) {
        logger.error("Error parsing event", e);
    }
}
