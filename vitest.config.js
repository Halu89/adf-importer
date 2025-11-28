import path from "node:path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

/**
 * Vitest config for a Node app.
 * @param sourceDir the source directory
 */
export default ({ sourceDir = "src" }) => {
    return defineConfig({
        plugins: [
            // Adds support for TypeScript path aliases
            tsconfigPaths(),
        ],
        test: {
            environment: "node",
            include: [path.resolve(sourceDir, "**/*.test.ts")],
            silent: "passed-only"
        },
    });
};
