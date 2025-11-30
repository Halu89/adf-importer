import Resolver from "@forge/resolver";
import { pageAttachmentLinkRepository } from "../lib/storage";

const resolver = new Resolver();

resolver.define("getText", async (req) => {
    console.log(req);

    const pages = await pageAttachmentLinkRepository.getPages(14762);

    return JSON.stringify(pages);
});

export const handler = resolver.getDefinitions();
