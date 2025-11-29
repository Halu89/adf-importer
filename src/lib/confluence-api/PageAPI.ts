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

/**
 *
 * @export
 * @interface CreatePage200Response
 */
export interface CreatePage200Response {
    /**
     * ID of the page.
     * @type {string}
     * @memberof CreatePage200Response
     */
    id?: string;
    /**
     * Title of the page.
     * @type {string}
     * @memberof CreatePage200Response
     */
    title?: string;
    /**
     * ID of the space the page is in.
     * @type {string}
     * @memberof CreatePage200Response
     */
    spaceId?: string;
    /**
     *
     * @type {GetAttachmentById200ResponseAllOfLinks}
     * @memberof CreatePage200Response
     */
    _links?: { base: string; webui: string };
}

export const createPage = async (pageData: CreatePageData) => {
    try {
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
            throw new Error(`Failed to create page: ${JSON.stringify(data)}`);
        } else {
            logger.debug(`Successfully created page: `, data);
            return data;
        }
    } catch (e: unknown) {
        logger.error("Error creating page", e);
    }
};
