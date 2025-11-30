import React, {useEffect, useMemo, useRef} from "react";
import ForgeReconciler, {Spinner, Text, useProductContext} from "@forge/react";
import {QueryClientProvider, useQuery} from "@tanstack/react-query";
import {queryClient} from "../providers/QueryClientProvider";
import {getPersonalSettings} from "../api/InternalAPI";
import {getAttachmentsForIssue} from "../api/AttachmentAPI";
import z from "zod";

const IssueActivityModule = () => {
    const issueId = useIssueId()

    console.debug("issueId :>> ", issueId)

    const {data: personalSettings, isLoading} = useQuery(getPersonalSettings());
    
    const {data: attachments} = useQuery(getAttachmentsForIssue("CSM-2"))

    console.debug("attachments :>> ", attachments)

    if (isLoading) {
        return <Spinner label={"Loading personal settings..."}/>;
    }

    if (personalSettings) {
        return (
            <>
                <Text>Hello world!</Text>
            </>
        );
    } else {
        return <Text>No personal settings found</Text>;
    }

};

ForgeReconciler.render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <IssueActivityModule/>
        </QueryClientProvider>
    </React.StrictMode>,
);

function useIssueId() {
    const context = useProductContext();

    console.debug("context :>> ", context)

    return useMemo(() => {
        if (!context) {
            return;
        }

        const issue = IssueModuleContextSchema.parse(context).extension.issue;
        return issue.id;
    }, [context] )
}

const IssueModuleContextSchema = z.object({
    extension: z.object({
        type: z.literal("jira:issueActivity"),
        issue: z.object({
            key: z.string(),
            id: z.string()
        }),
        project: z.object({
            id: z.string(),
            key: z.string()
        }),
    }),
    accountId: z.string(),
})