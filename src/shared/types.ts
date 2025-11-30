import { PersonalSettings, Space } from "../lib/schemas";

export type ResolverDefs = {
    getText: (args: never) => string;
    /**
     * Space settings
     */
    saveGlobalSpaceSetting: (args: { space: Space }) => void;
    getGlobalSpaceSetting: () => Space | undefined;

    savePersonalSpaceSetting: (args: { settings: PersonalSettings }) => void;
    getPersonalSpaceSetting: (args: never) => boolean;
};
