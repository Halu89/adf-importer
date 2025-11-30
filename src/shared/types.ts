import {Space} from "../frontend/api/SpaceAPI";

export type ResolverDefs = {
    getText: (args: never) => string;
    saveGlobalSpaceSetting: (args: { space: Space }) => void;
};
