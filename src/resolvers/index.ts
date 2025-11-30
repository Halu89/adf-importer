import {makeResolver} from "@forge/resolver";
import {ResolverDefs} from "../shared/types";
import {pageAttachmentLinkRepository} from "../lib/storage";

export const handler = makeResolver<ResolverDefs>({
    getText: async (req) => {
        console.log(req);
        const pages = await pageAttachmentLinkRepository.getPages(14762);
        return JSON.stringify(pages);
    },
    saveGlobalSpaceSetting: async (req) => {
        console.info(req);
        console.debug("req.payload :>> ", JSON.stringify(req.payload));
    }
});
