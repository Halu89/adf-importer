import api, { route } from "@forge/api";
import z from "zod";
import logger from "../logger";

/**
 * Fetches the issue key from a Jira issue using the issue ID.
 * This is useful when you have an issue ID but need the human-readable issue key (e.g., "PROJ-123").
 *
 * @param issueId - The Jira issue ID (string or number)
 * @returns A promise that resolves to the issue key string
 * @throws Error if the issue cannot be fetched or parsed
 */
export const getIssueKey = async (
    issueId: string | number,
): Promise<string> => {
    try {
        logger.debug(`Fetching issue key for issue ID: `, issueId);

        const response = await api
            .asApp()
            .requestJira(
                route`/rest/api/3/issue/${encodeURIComponent(issueId)}`,
            );

        if (!response.ok) {
            logger.error(
                `Failed to fetch issue: ${issueId}`,
                response,
                await response.text(),
            );
            throw new Error(`Failed to fetch issue: ${issueId}`);
        }

        try {
            const issueData = IssueAPISchema.parse(await response.json());
            logger.debug(
                `Successfully retrieved issue key: ${issueData.key} for issue ID: ${issueId}`,
            );
            return issueData.key;
        } catch (e: unknown) {
            logger.error("Error parsing issue response", e);
            throw new Error(
                `Failed to parse issue response for issue: ${issueId}`,
            );
        }
    } catch (e: unknown) {
        logger.error(`Error fetching issue key for issue ID: ${issueId}`, e);
        throw e;
    }
};

/**
 * Schema for validating the Jira API issue response.
 * Only includes the fields we need (id and key) to minimize dependencies.
 */
const IssueAPISchema = z.object({
    id: z.string(),
    key: z.string(),
});
