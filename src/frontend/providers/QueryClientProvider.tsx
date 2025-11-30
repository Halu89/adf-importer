import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error: Error) => {
                if (error instanceof RequestError) {
                    if (
                        error.status &&
                        400 <= error.status &&
                        error.status < 500
                    ) {
                        return false; // Do not retry on 4XX errors
                    }
                }
                return failureCount < 3; // Retry up to 3 times
            },
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60, // Cache results for 1 minute
        },
    },
});

export class RequestError extends Error {
    constructor(
        public status: number,
        message: string,
    ) {
        super(message);
    }
}
