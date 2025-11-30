import z from "zod";
import logger from "../lib/logger";
import {
    ChangelogSchema,
    IssueSchema,
    StatusSchema,
    UserSchema,
} from "../lib/schemas";
import { cleanupAll } from "../lib/CleanupService";

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

export async function handleIssueUpdated(event: unknown, _context: unknown) {
    try {
        logger.debug("Parsing issue updated event");

        const parsed = IssueUpdatedEventSchema.parse(event);

        if (
            parsed.issue.fields.status.name.toLowerCase().includes("resolved")
        ) {
            logger.debug("Issue resolved");
            await cleanupAll(parsed.issue.id).catch((e: unknown) =>
                logger.error(`Error cleaning up issue ${parsed.issue.id}`, e),
            );
        } else {
            logger.debug("Ignoring issue update as deemed irrelevant");
        }
    } catch (e: unknown) {
        logger.error("Error parsing event", e);
    }
}
