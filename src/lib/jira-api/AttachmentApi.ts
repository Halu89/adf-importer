import api, { route } from "@forge/api";
import logger from "../logger";

export const getAttachment = async (id: string | number) => {
    try {
        logger.debug(`Fetching attachment: `, id);

        const response = await api
            .asApp()
            .requestJira(
                route`/rest/api/3/attachment/content/${encodeURIComponent(id)}`,
            );

        if (!response.ok) {
            logger.error(`Failed to fetch attachment: ${id}`, response);
            throw new Error(`Failed to fetch attachment: ${id}`);
        }

        logger.debug(`Successfully retrieved attachment: `, id);

        return response.text();
    } catch (e: unknown) {
        logger.error("Error fetching attachment", e);
    }
};
