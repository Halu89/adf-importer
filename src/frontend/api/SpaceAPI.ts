import z from "zod";
import {queryOptions} from "@tanstack/react-query";
import {requestConfluence} from "@forge/bridge";
import logger from "../../lib/logger";

const stringOrNumber = z.union([z.string(), z.number()]);

export const SpaceSchema = z.object({
    id: stringOrNumber,
    key: z.string(),
    name: z.string(),
    status: z.string(),
    icon: z.object({
        path: z.string(),
    }).optional().nullable(),
    homepage: z.object({
        id: stringOrNumber
    }).optional(),
});

export type Space = z.infer<typeof SpaceSchema>;

const MultiSpaceResultSchema = z.object({
    results: z.array(z.object({space: SpaceSchema})),
})

export function searchSpacesByTitle(debouncedKey: string) {
    return queryOptions({
        queryKey: ["GetSpaces", debouncedKey],
        queryFn: async () => {
            const titleSearchResults = await requestConfluence(`/wiki/rest/api/search?limit=20&expand=space.homepage&cql=type=space+AND+title~"${encodeURIComponent(debouncedKey)}*"`, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (titleSearchResults.ok) {
                try {
                    return MultiSpaceResultSchema.parse(await titleSearchResults.json());
                } catch (e: unknown) {
                    logger.error("Unable to parse spaces response", e)
                    throw new Error("Unable to parse spaces response")
                }
            }
        },
    });
}

