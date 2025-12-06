import type { CreatePage200Response } from "../backend/lib/confluence-api/PageAPI";

export const pageUrl = (page: CreatePage200Response | undefined) => {
    if (!page?._links?.base || !page?._links?.webui) return;

    return `${page?._links?.base}${page?._links?.webui}`;
};
