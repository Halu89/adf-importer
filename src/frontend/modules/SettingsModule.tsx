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
import GlobalSettingsEdit from "../features/settings/GlobalSettingsEdit";
import { getGlobalSettings } from "../api/InternalAPI";
import PersonalSettingsEdit from "../features/settings/PersonalSettingsEdit";
import PersonalSettingsIndication from "../features/settings/PersonalSettingsIndication";

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

ForgeReconciler.render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </React.StrictMode>,
);
