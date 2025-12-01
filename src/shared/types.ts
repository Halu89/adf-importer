import { Attachment, PersonalSettings, Space } from "../lib/schemas";

export type ResolverDefs = {
    /**
     * Space settings
     */
    saveGlobalSpaceSetting: (args: { space: Space }) => void;
    getGlobalSpaceSetting: () => Space | undefined;

    savePersonalSpaceSetting: (args: { settings: PersonalSettings }) => void;
    getPersonalSpaceSetting: (args: never) => boolean;

    getAttachmentsForIssue: (issueId: string | number) => Attachment[];

    exportPageToSpace: (args: { attachmentId: string }) => void;
};
