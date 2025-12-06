import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { makeInvoke, router, showFlag } from "@forge/bridge";
import type { ResolverDefs } from "../../shared/types";
import type { PersonalSettings, Space } from "../../shared/schemas";
import { queryClient } from "../providers/QueryClientProvider";
import { pageUrl } from "../../shared/utils";

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

export function exportPageToDefaultSpace() {
    return mutationOptions({
        mutationFn: async (attachmentId: string) => {
            return invoke("exportPageToDefaultSpace", { attachmentId });
        },
        onSuccess: (data) => {
            const contentId: string = data ? data.id : undefined;
            showPageCreatedFlag(contentId);
        },
        onError: (error) => {
            showFlag({
                type: "error",
                appearance: "error",
                title: "Error importing page",
                description: error.message,
                id: "page-exported-error",
                isAutoDismiss: true,
            });
        },
    });
}

export function exportPageToPersonalSpace() {
    return mutationOptions({
        mutationFn: async (attachmentId: string) => {
            return invoke("exportPageToSpace", { attachmentId });
        },
        onSuccess: (data) => {
            const url = pageUrl(data);

            showFlag({
                type: "success",
                title: "Page created successfully",
                id: `page-created ${url}`,
                isAutoDismiss: true,
                actions: url
                    ? [
                          {
                              text: "View page",
                              onClick: () => {
                                  void router.open(url);
                              },
                          },
                      ]
                    : undefined,
            });
        },
        onError: (error) => {
            console.debug("error :>> ", error);
            showFlag({
                type: "error",
                appearance: "error",
                title: "Error importing page",
                description: error.message,
                id: "page-exported-error",
                isAutoDismiss: true,
            });
        },
    });
}

const showPageCreatedFlag = (pageId: string | undefined) => {
    showFlag({
        type: "success",
        title: "Page created successfully",
        id: `page-created-${pageId}`,
        isAutoDismiss: true,
        actions: pageId
            ? [
                  {
                      text: "View page",
                      onClick: () => {
                          void router.open({
                              target: "contentView",
                              contentId: pageId,
                          });
                      },
                  },
              ]
            : undefined,
    });
};
