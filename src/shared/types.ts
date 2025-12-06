import type { CreatePage200Response } from "../backend/lib/confluence-api/PageAPI";
import type { PersonalSettings, Space } from "./schemas";

export type ResolverDefs = {
    /**
     * Space settings
     */
    saveGlobalSpaceSetting: (args: { space: Space }) => void;
    getGlobalSpaceSetting: () => Space | undefined;

    savePersonalSpaceSetting: (args: { settings: PersonalSettings }) => void;
    getPersonalSpaceSetting: (args: never) => PersonalSettings | undefined;

    exportPageToSpace: (args: {
        attachmentId: string;
    }) => CreatePage200Response | undefined;

    exportPageToDefaultSpace: (args: {
        attachmentId: string;
    }) => CreatePage200Response | undefined;
};
