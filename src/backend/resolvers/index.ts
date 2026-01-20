import { getAppContext } from "@forge/api";
import { makeResolver } from "@forge/resolver";
import z from "zod";
import type { ResolverDefs } from "../../shared/types";
import {
    createPage,
    pageCreator,
    RemotePageCreator,
} from "../lib/confluence-api/PageAPI";
import {
    getAttachment,
    getAttachmentMetadata,
} from "../lib/jira-api/AttachmentApi";
import logger from "../lib/logger";
import { NoopValidator } from "../lib/PageValidator";
import { settingsRepository } from "../lib/storage";

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
        const settings = await settingsRepository.getPersonalSpaceSetting(
            context.accountId,
        );

        if (settings === undefined) {
            logger.debug("No personal space settings found for user");
            return undefined;
        } else {
            logger.debug("Personal space setting retrieved successfully");
            const sanitizedSettings = stripAuthentication(settings);
            logger.debug("Settings", sanitizedSettings);
            return sanitizedSettings;
        }
    },

    exportPageToDefaultSpace: async (req) => {
        logger.debug("Exporting page to default space");
        const attachmentId = z.string().parse(req.payload.attachmentId);
        const issueKey = z.string().optional().parse(req.payload.issueKey);

        const spaceSetting = await settingsRepository.getGlobalSetting();

        if (!spaceSetting) {
            logger.error("No global space setting found");
            return;
        }

        const context = getAppContext();

        console.debug("context :>> ", context);

        const attachmentMeta = await getAttachmentMetadata(attachmentId);
        const page = await getAttachment(attachmentId);

        if (!page) {
            throw new Error("Attachment not found");
        }

        if (!NoopValidator.instance.validatePage(page)) {
            logger.log("Ignoring attachment: Invalid document format");
            throw new Error("Invalid document format");
        }

        return createPage(
            {
                spaceId: String(spaceSetting.id),
                body: {
                    representation: "storage",
                    value: page,
                },
                status: "current",
                title: pageCreator.buildPageTitle(
                    attachmentMeta?.filename,
                    issueKey,
                    attachmentId,
                ),
            },
            pageCreator,
        );
    },

    /**
     * Exports a page to the user's personal Confluence space.
     */
    exportPageToSpace: async (req) => {
        logger.debug("Exporting page to personal space");
        const context = ResolverContextSchema.parse(req.context);
        const attachmentId = z.string().parse(req.payload.attachmentId);
        const issueKey = z.string().optional().parse(req.payload.issueKey);

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

        if (!NoopValidator.instance.validatePage(page)) {
            logger.log("Ignoring attachment: Invalid document format");
            throw new Error("Invalid document format");
        }

        const pageCreator = new RemotePageCreator(personalSettings);

        return createPage(
            {
                spaceId: personalSettings.space.id,
                body: {
                    representation: "storage",
                    value: page,
                },
                status: "current",
                title: pageCreator.buildPageTitle(
                    attachmentMeta?.filename,
                    issueKey,
                    attachmentId,
                ),
            },
            pageCreator,
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

const stripAuthentication = (settings: {
    authentication: { email: string };
}) => ({
    ...settings,
    authentication: { email: settings.authentication.email, token: "" },
});
