import { Space } from "../lib/schemas";

export type ResolverDefs = {
    getText: (args: never) => string;
    /**
     * Space settings
     */
    saveGlobalSpaceSetting: (args: { space: Space }) => void;
    getGlobalSpaceSetting: () => Space | undefined;

    savePersonalSpaceSetting: (args: { space: Space }) => void;
    getPersonalSpaceSetting: () => Space | undefined;
};
