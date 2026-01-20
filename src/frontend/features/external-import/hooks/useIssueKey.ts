import { useProductContext } from "@forge/react";
import { useMemo } from "react";
import z from "zod";

/**
 * Hook to extract the Jira issue key from the product context.
 * The issue key is a human-readable identifier like "PROJ-123" that is much
 * more useful than the numeric issue ID for display purposes.
 *
 * @returns The issue key string if available, undefined otherwise
 */
export default function useIssueKey() {
    const context = useProductContext();

    return useMemo(() => {
        if (!context) {
            return;
        }

        try {
            return IssueModuleContextSchema.parse(context).extension.issue.key;
        } catch (e: unknown) {
            console.error("Unable to parse issue key from context", e);
        }
    }, [context]);
}

const IssueModuleContextSchema = z.object({
    extension: z.object({
        issue: z.object({
            key: z.string(),
        }),
    }),
});
