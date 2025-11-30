import React, { useState } from "react";
import ForgeReconciler, {
    Box,
    Button,
    ModalTransition,
    Stack,
    Text,
} from "@forge/react";
import {
    QueryClientProvider,
    queryOptions,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { queryClient } from "../providers/QueryClientProvider";
import { makeInvoke, showFlag } from "@forge/bridge";
import { ResolverDefs } from "../../shared/types";
import GlobalSettingsEdit from "../features/settings/GlobalSettingsEdit";

const App = () => {
    const { data: spaceSetting, isLoading } = useQuery(getGlobalSettings());
    const queryClient = useQueryClient();

    const [edit, setEdit] = useState(false);

    const closeModal = () => setEdit(false);

    const handleSubmit = () => {
        setEdit(false);
        showFlag({
            type: "success",
            title: "setting saved successfully",
            id: "settings-saved",
            isAutoDismiss: true,
        });
        void queryClient.invalidateQueries(getGlobalSettings());
    };

    return (
        <Stack space={"space.100"}>
            {isLoading ? (
                <Text>Loading...</Text>
            ) : (
                <Text>
                    Currently saving pages to space &apos;{spaceSetting?.name}
                    &apos;
                </Text>
            )}

            <Box>
                <Button onClick={() => setEdit(!edit)} iconAfter={"edit"}>
                    Edit
                </Button>
            </Box>

            <ModalTransition>
                {edit && (
                    <GlobalSettingsEdit
                        onSubmit={handleSubmit}
                        closeModal={closeModal}
                    />
                )}
            </ModalTransition>
        </Stack>
    );
};

const invoke = makeInvoke<ResolverDefs>();

function getGlobalSettings() {
    return queryOptions({
        queryKey: ["GetGlobalSettings"],
        queryFn: async () => await invoke("getGlobalSpaceSetting"),
    });
}

ForgeReconciler.render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </React.StrictMode>,
);
