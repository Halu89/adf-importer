import type { PersonalSettings, Space } from "../lib/schemas";

export type ResolverDefs = {
    /**
     * Space settings
     */
    saveGlobalSpaceSetting: (args: { space: Space }) => void;
    getGlobalSpaceSetting: () => Space | undefined;

    savePersonalSpaceSetting: (args: { settings: PersonalSettings }) => void;
    getPersonalSpaceSetting: (args: never) => boolean;

    exportPageToSpace: (args: { attachmentId: string }) => void;
};
