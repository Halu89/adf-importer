import { queryOptions } from "@tanstack/react-query";
import { requestConfluence } from "@forge/bridge";
import { MultiSpaceResultSchema } from "../../shared/schemas";

export function searchSpacesByTitle(debouncedKey: string) {
    return queryOptions({
        queryKey: ["GetSpaces", debouncedKey],
        queryFn: async () => {
            const titleSearchResults = await requestConfluence(
                `/wiki/rest/api/search?limit=20&expand=space.homepage&cql=type=space+AND+title~"${encodeURIComponent(debouncedKey)}*"`,
                {
                    headers: {
                        Accept: "application/json",
                    },
                },
            );

            if (titleSearchResults.ok) {
                try {
                    return MultiSpaceResultSchema.parse(
                        await titleSearchResults.json(),
                    );
                } catch (e: unknown) {
                    console.error("Unable to parse spaces response", e);
                    throw new Error("Unable to parse spaces response");
                }
            }
        },
    });
}
