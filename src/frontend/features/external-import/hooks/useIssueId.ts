import { useProductContext } from "@forge/react";
import { useMemo } from "react";
import z from "zod";

export default function useIssueId() {
    const context = useProductContext();

    return useMemo(() => {
        if (!context) {
            return;
        }

        try {
            return IssueModuleContextSchema.parse(context).extension.issue.id;
        } catch (e: unknown) {
            console.error("Unable to parse issue id from context", e);
        }
    }, [context]);
}

const IssueModuleContextSchema = z.object({
    extension: z.object({
        type: z.literal("jira:issueActivity"),
        issue: z.object({
            key: z.string(),
            id: z.string(),
        }),
        project: z.object({
            id: z.string(),
            key: z.string(),
        }),
    }),
    accountId: z.string(),
});
