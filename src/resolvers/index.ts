import { makeResolver } from "@forge/resolver";
import { ResolverDefs } from "../shared/types";
import {
    pageAttachmentLinkRepository,
    settingsRepository,
} from "../lib/storage";
import z from "zod";
import logger from "../lib/logger";

export const handler = makeResolver<ResolverDefs>({
    getText: async (req) => {
        console.log(req);
        const pages = await pageAttachmentLinkRepository.getPages(14762);
        return JSON.stringify(pages);
    },

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

        logger.debug("Personal space setting retrieved successfully");
        return !!result;
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
