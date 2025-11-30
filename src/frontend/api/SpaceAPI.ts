import z from "zod";
import {queryOptions} from "@tanstack/react-query";
import {requestConfluence} from "@forge/bridge";
import logger from "../../lib/logger";
import {MultiSpaceResultSchema} from "../../lib/schemas";

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

