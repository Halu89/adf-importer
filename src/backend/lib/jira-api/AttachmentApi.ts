import api, { route } from "@forge/api";
import z from "zod";
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

export const getAttachmentMetadata = async (id: string) => {
    logger.debug(`Fetching attachment metadata: `, id);

    const response = await api
        .asApp()
        .requestJira(route`/rest/api/3/attachment/${id}`);

    if (response.ok) {
        try {
            return AttachmentAPISchema.parse(await response.json());
        } catch (e: unknown) {
            logger.error("Error parsing attachment metadata", e);
        }
    } else {
        logger.error(`Failed to fetch attachment metadata: ${id}`, response);
        throw new Error(`Failed to fetch attachment metadata: ${id}`);
    }
};

const AttachmentAPISchema = z.object({
    id: z.number(),
    filename: z.string(),
    mimeType: z.string(),
    created: z.string().optional(),
});
