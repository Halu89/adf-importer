import api, { route } from "@forge/api";
import logger from "../logger";

interface PageBody {
    representation: "storage";
    value: string;
}

interface CreatePageData {
    spaceId: string;
    status: "current";
    title: string;
    parentId: string;
    body: PageBody;
}

export interface CreatePage200Response {
    /**
     * ID of the page.
     */
    id?: string;
    /**
     * Title of the page.
     */
    title?: string;
    /**
     * ID of the space the page is in.
     */
    spaceId?: string;
    _links?: { base: string; webui: string };
}

export const createPage = async (pageData: CreatePageData) => {
    logger.debug(`Creating page`);

    const response = await api
        .asApp()
        .requestConfluence(route`/wiki/api/v2/pages`, {
            method: "POST",
            body: JSON.stringify(pageData),
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });

    const data = (await response.json()) as CreatePage200Response;
    if (!response.ok) {
        logger.error(
            `Failed to create page: ${JSON.stringify(data)}`,
            response,
        );
        throw new Error(`Failed to create page`);
    } else {
        logger.debug(`Successfully created page: `, data);
        return data;
    }
};

export const deletePage = async (pageId: string | number) => {
    logger.debug(`Deleting page: ${pageId}`);
    const response = await api
        .asApp()
        .requestConfluence(route`/wiki/api/v2/pages/${pageId}`, {
            method: "DELETE",
        });

    if (!response.ok) {
        logger.error(`Failed to delete page: ${pageId}`, response);
        throw new Error(`Failed to delete page: ${pageId}`);
    } else {
        logger.debug("Successfully deleted page: ", pageId);
    }
};
