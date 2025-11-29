import {XMLParser, XMLValidator} from "fast-xml-parser";
import logger from "./logger";

interface PageValidator {
    validatePage(page: unknown): boolean
}

export class StorageFormatValidator implements PageValidator {
    #validator: typeof XMLValidator["validate"];
    #logger: Console;

    public static instance = new StorageFormatValidator();

    private constructor() {
        this.#validator = (...args) => XMLValidator.validate(...args);
        this.#logger = logger;
    }

    /**
     * Validate the page is in storage format by trying to parse the XML
     */
    validatePage(page: unknown): page is string {
        if (typeof page !== "string") {
            this.#logger.error("Invalid document format, expected string");
            return false;
        }

        try {
            const result = this.#validator(page, {allowBooleanAttributes: true});
            if (result !== true) {
                throw result
            }
            return true;
        } catch (e: unknown) {
            this.#logger.error("Invalid document format, unable to parse XML", e);
            return false;
        }
    }
}
