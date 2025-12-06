import ForgeReconciler, { Spinner, Text } from "@forge/react";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import React from "react";
import { getPersonalSettings } from "../api/InternalAPI";
import SettingsLink from "../components/SettingsLink";
import AttachmentTable from "../features/external-import/components/AttachmentTable";
import { queryClient } from "../providers/QueryClientProvider";

const IssueActivityModule = () => {
    const { data: personalSettings, isLoading } = useQuery(
        getPersonalSettings(),
    );

    if (isLoading) {
        return <Spinner label={"Loading personal settings..."} />;
    }

    if (personalSettings) {
        return <AttachmentTable />;
    } else {
        return (
            <>
                <Text>No personal settings found</Text>
                <SettingsLink openNewTab>
                    Configure my personal settings
                </SettingsLink>
            </>
        );
    }
};

ForgeReconciler.render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <IssueActivityModule />
        </QueryClientProvider>
    </React.StrictMode>,
);
