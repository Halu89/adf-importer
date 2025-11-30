import React from "react";
import ForgeReconciler from "@forge/react";
import {QueryClientProvider} from "@tanstack/react-query";
import {queryClient} from "../providers/QueryClientProvider";
import GlobalSettingsEdit from "../features/settings/GlobalSettingsEdit";

const App = () => {
        return (
            <GlobalSettingsEdit/>
        );
    }
;

ForgeReconciler.render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <App/>
        </QueryClientProvider>
    </React.StrictMode>,
);
