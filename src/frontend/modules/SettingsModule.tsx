import React, { useState } from "react";
import ForgeReconciler, {
    Box,
    Button,
    ModalTransition,
    Stack,
    Text,
    xcss,
} from "@forge/react";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { queryClient } from "../providers/QueryClientProvider";
import { makeInvoke } from "@forge/bridge";
import { ResolverDefs } from "../../shared/types";
import GlobalSettingsEdit from "../features/settings/GlobalSettingsEdit";
import { getGlobalSettings, getPersonalSettings } from "../api/InternalAPI";
import PersonalSettingsEdit from "../features/settings/PersonalSettingsEdit";

const App = () => {
    const { data: spaceSetting, isLoading } = useQuery(getGlobalSettings());

    const [edit, setEdit] = useState(false);

    const closeModal = () => setEdit(false);

    return (
        <>
            <Stack space={"space.100"}>
                {isLoading ? (
                    <Text>Loading...</Text>
                ) : (
                    <Text>
                        Currently saving pages to space &apos;
                        {spaceSetting?.name}
                        &apos;
                    </Text>
                )}

                <Box>
                    <Button onClick={() => setEdit(!edit)} iconAfter={"edit"}>
                        Edit
                    </Button>
                </Box>

                <ModalTransition>
                    {edit && <GlobalSettingsEdit closeModal={closeModal} />}
                </ModalTransition>
            </Stack>

            <PersonalSettingsIndication />

            <Box xcss={xcss({ marginBlock: "space.300" })}>
                <PersonalSettingsEdit />
            </Box>
        </>
    );
};

const PersonalSettingsIndication = () => {
    const { data, isLoading } = useQuery(getPersonalSettings());

    if (isLoading) {
        return <Text>Loading personal settings</Text>;
    }

    if (!data) {
        return <Text>No personal settings found</Text>;
    }

    return <Text>Personal settings saved successfully</Text>;
};

ForgeReconciler.render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </React.StrictMode>,
);
