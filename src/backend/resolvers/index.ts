import { makeResolver } from "@forge/resolver";
import type { ResolverDefs } from "../../shared/types";
import { settingsRepository } from "../lib/storage";
import z from "zod";
import logger from "../lib/logger";
import {
    getAttachment,
    getAttachmentMetadata,
} from "../lib/jira-api/AttachmentApi";
import { createPage, RemotePageCreator } from "../lib/confluence-api/PageAPI";

export const handler = makeResolver<ResolverDefs>({
    /**
     * Saves the global space setting.
     */
    saveGlobalSpaceSetting: async (req) => {
        logger.debug("Saving global space setting");

        await settingsRepository.saveGlobalSetting(req.payload.space);

        logger.debug("Global space setting saved successfully");
    },

    /**
     * Retrieves the global space setting.
     */
    getGlobalSpaceSetting: async () => {
        logger.debug("Getting global space setting");

        const result = await settingsRepository.getGlobalSetting();

        logger.debug("Global space setting retrieved successfully");
        return result;
    },

    /**
     * Saves the personal space setting for a specific user.
     */
    savePersonalSpaceSetting: async (req) => {
        logger.debug(
            "Saving personal space setting: ",
            req.payload.settings,
            " for account: ",
            req.context.accountId,
        );

        const context = ResolverContextSchema.parse(req.context);
        await settingsRepository.savePersonalSpaceSetting(
            context.accountId,
            req.payload.settings,
        );
        logger.debug("Personal space setting saved successfully");
    },

    /**
     * Checks if personal space settings exist for the user.
     */
    getPersonalSpaceSetting: async (req) => {
        logger.debug(
            "Getting personal space setting for account: ",
            req.context.accountId,
        );

        const context = ResolverContextSchema.parse(req.context);
        const result = await settingsRepository.getPersonalSpaceSetting(
            context.accountId,
        );

        logger.debug("Personal space setting retrieved successfully");
        return !!result;
    },

    /**
     * Exports a page to the user's personal Confluence space.
     */
    exportPageToSpace: async (req) => {
        logger.debug("Exporting page to personal space");
        const context = ResolverContextSchema.parse(req.context);
        const attachmentId = z.string().parse(req.payload.attachmentId);

        const personalSettings =
            await settingsRepository.getPersonalSpaceSetting(context.accountId);

        if (!personalSettings) {
            throw new Error("No personal space settings found for user");
        }

        const attachmentMeta = await getAttachmentMetadata(attachmentId);
        const page = await getAttachment(attachmentId);
        if (!page) {
            throw new Error("Attachment not found");
        }

        await createPage(
            {
                spaceId: personalSettings.space.id,
                body: {
                    representation: "storage",
                    value: page,
                },
                status: "current",
                title: attachmentMeta
                    ? `${attachmentMeta.filename} - ${attachmentMeta.id} - ${attachmentMeta.created}`
                    : `Exported page - ${Date.now()}`,
            },
            new RemotePageCreator(personalSettings),
        );
    },
});

const ResolverContextSchema = z.object({
    accountId: z.string(),
    installContext: z.string(),
    cloudId: z.string(),
    environmentId: z.string(),
    environmentType: z.string(),
    siteUrl: z.string(),
});
