import Resolver from "@forge/resolver";
import { pageStorage } from "../lib/storage";

const resolver = new Resolver();

resolver.define("getText", async (req) => {
    console.log(req);

    const pages = await pageStorage.getPages(14762);

    return JSON.stringify(pages);
});

export const handler = resolver.getDefinitions();
