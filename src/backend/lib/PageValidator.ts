import { XMLValidator } from "fast-xml-parser";
import logger from "./logger";

interface PageValidator {
    validatePage(page: unknown): boolean;
}

export class StorageFormatValidator implements PageValidator {
    readonly #validator: (typeof XMLValidator)["validate"];
    readonly #logger: Console;

    public static instance = new StorageFormatValidator();

    private constructor() {
        this.#validator = (...args) => XMLValidator.validate(...args);
        this.#logger = logger;
    }

    /**
     * Validate the page is in storage format by trying to parse the XML
     */
    validatePage(page: unknown): page is string {
        this.#logger.debug("Validating page format");

        if (typeof page !== "string") {
            this.#logger.error("Invalid document format, expected string");
            return false;
        }

        const result = this.#validator(page, {
            allowBooleanAttributes: true,
        });

        if (result === true) {
            this.#logger.debug("Page format valid");
            return true;
        } else {
            this.#logger.error(
                "Invalid document format, XML validation failed",
                result,
            );
            return false;
        }
    }
}
