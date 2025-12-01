import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { makeInvoke, showFlag } from "@forge/bridge";
import { ResolverDefs } from "../../shared/types";
import { PersonalSettings, Space } from "../../lib/schemas";
import { queryClient } from "../providers/QueryClientProvider";

const invoke = makeInvoke<ResolverDefs>();

export const savePersonalSettings = mutationOptions({
    mutationFn: (settings: PersonalSettings) => {
        console.debug("settings :>> ", settings);

        return invoke("savePersonalSpaceSetting", { settings });
    },
    onSuccess: () => {
        showFlag({
            type: "success",
            title: "Personal settings saved successfully",
            id: "personal-settings-saved",
            isAutoDismiss: true,
        });
        void queryClient.invalidateQueries(getPersonalSettings());
    },
    onError: (error) => {
        showFlag({
            type: "error",
            title: "Error saving personal settings",
            description: error.message,
            id: "personal-settings-error",
        });
    },
} as const);

export const saveGlobalSpaceSettings = mutationOptions({
    mutationFn: (space: Space) => {
        return invoke("saveGlobalSpaceSetting", { space });
    },
    onSuccess: async () => {
        showFlag({
            type: "success",
            title: "Global settings saved successfully",
            id: "global-settings-saved",
            isAutoDismiss: true,
        });
        void queryClient.invalidateQueries(getGlobalSettings());
    },
    onError: (error) => {
        showFlag({
            type: "error",
            title: "Error saving global settings",
            description: error.message,
            id: "global-settings-error",
        });
    },
});

export function getGlobalSettings() {
    return queryOptions({
        queryKey: ["GetGlobalSettings"],
        queryFn: async () => {
            return await invoke("getGlobalSpaceSetting");
        },
    });
}

export function getPersonalSettings() {
    return queryOptions({
        queryKey: ["GetPersonalSettings"],
        queryFn: () => {
            return invoke("getPersonalSpaceSetting");
        },
    });
}

export function getAttachmentsForIssue(issueId: string | number | undefined) {
    return queryOptions({
        queryKey: ["GetAttachmentsForIssue", issueId],
        queryFn: async () => {
            if (!issueId) {
                throw new Error("Issue ID is required to fetch attachments");
            }
            return await invoke("getAttachmentsForIssue", issueId);
        },
        enabled: issueId != undefined,
    });
}

export function exportPageToPersonalSpace() {
    return mutationOptions({
        mutationFn: async (attachmentId: string) => {
            return invoke("exportPageToSpace", { attachmentId });
        },
    });
}
