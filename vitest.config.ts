import path from "node:path";
import {defineConfig} from "vitest/config";

/**
 * Vitest config for a Node app.
 * @param sourceDir the source directory
 */
function vitestConfig({sourceDir = "src"}) {
    return defineConfig({
        plugins: [],
        test: {
            environment: "node",
            include: [path.resolve(sourceDir, "**/*.test.ts")],
            silent: "passed-only"
        },
    });
}

export default vitestConfig;
