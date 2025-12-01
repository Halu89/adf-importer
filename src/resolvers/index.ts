import { makeResolver } from "@forge/resolver";
import { ResolverDefs } from "../shared/types";
import {
    pageAttachmentLinkRepository,
    settingsRepository,
} from "../lib/storage";
import z from "zod";
import logger from "../lib/logger";
import {
    getAttachment,
    getAttachmentMetadata,
} from "../lib/jira-api/AttachmentApi";
import { Attachment } from "../lib/schemas";
import { createPage, RemotePageCreator } from "../lib/confluence-api/PageAPI";

export const handler = makeResolver<ResolverDefs>({
    saveGlobalSpaceSetting: async (req) => {
        logger.debug("Saving global space setting");

        await settingsRepository.saveGlobalSetting(req.payload.space);

        logger.debug("Global space setting saved successfully");
    },

    getGlobalSpaceSetting: async (req) => {
        logger.debug("Getting global space setting");

        const result = await settingsRepository.getGlobalSetting();

        logger.debug("Global space setting retrieved successfully");
        return result;
    },

    savePersonalSpaceSetting: async (req) => {
        console.debug("req :>> ", req);

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
     * Only returns a boolean indicating whether personal settings exist for the user
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

        logger.debug(result);

        logger.debug("Personal space setting retrieved successfully");
        return !!result;
    },

    getAttachmentsForIssue: async (req) => {
        logger.debug("Getting attachments for issue", req.payload);
        const attachmentLinks = await pageAttachmentLinkRepository.getPages(
            req.payload,
        );

        const attachmentPromises = await Promise.allSettled(
            attachmentLinks.map((link) =>
                getAttachmentMetadata(link.attachmentId),
            ),
        );

        let result: Attachment[] = [];

        for (const a of attachmentPromises) {
            if (a.status === "fulfilled") {
                result.push(a.value as Attachment);
            }
        }
        return result;
    },

    exportPageToSpace: async (req) => {
        logger.debug("Exporting page to personal space");
        const context = ResolverContextSchema.parse(req.context);
        const attachment = z.string().parse(req.payload.attachmentId);

        const personalSettings =
            await settingsRepository.getPersonalSpaceSetting(context.accountId);

        if (!personalSettings) {
            throw new Error("No personal space settings found for user");
        }

        const page = await getAttachment(attachment);
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
                title: "Exported page",
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
