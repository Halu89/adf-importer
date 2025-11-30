import {makeResolver} from "@forge/resolver";
import {ResolverDefs} from "../shared/types";
import {pageAttachmentLinkRepository} from "../lib/storage";
import {settingsRepository} from "../lib/storage/SettingsRepository";

export const handler = makeResolver<ResolverDefs>({
    getText: async (req) => {
        console.log(req);
        const pages = await pageAttachmentLinkRepository.getPages(14762);
        return JSON.stringify(pages);
    },

    saveGlobalSpaceSetting: async (req) => {
        console.info(req);
        console.debug("req.payload :>> ", JSON.stringify(req.payload));

        await settingsRepository.saveGlobalSetting(req.payload.space)
    },
    getGlobalSpaceSetting: async (req) => {

        return await settingsRepository.getGlobalSetting()
    },

    savePersonalSpaceSetting: async (req) => {

        await settingsRepository.saveGlobalSetting(req.payload.space)
    },

    getPersonalSpaceSetting: async (req) => {
        return await settingsRepository.getGlobalSetting()
    }

});
