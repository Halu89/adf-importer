import { XMLValidator } from "fast-xml-parser";
import logger from "./logger";

abstract class PageValidator {
    protected readonly logger: Console;

    protected constructor() {
        this.logger = logger;
    }

    abstract validatePage(page: unknown): boolean;
}

export class StorageFormatValidator extends PageValidator {
    readonly #validator: (typeof XMLValidator)["validate"];

    public static readonly instance = new StorageFormatValidator();

    private constructor() {
        super();
        this.#validator = (...args) => XMLValidator.validate(...args);
    }

    /**
     * Validate the page is in storage format by trying to parse the XML
     */
    validatePage(page: unknown): page is string {
        this.logger.debug("Validating page format");

        if (typeof page !== "string") {
            this.logger.error("Invalid document format, expected string");
            return false;
        }

        const result = this.#validator(this.wrapPageContent(page), {
            allowBooleanAttributes: true,
        });

        if (result === true) {
            this.logger.debug("Page format valid");
            return true;
        } else {
            this.logger.error(
                "Invalid document format, XML validation failed",
                result,
            );
            return false;
        }
    }

    /**
     * The XML validator fails for multiple root nodes
     */
    private wrapPageContent(page: string): string {
        return `<storageFormat>${page}</storageFormat>`;
    }
}

export class NoopValidator extends PageValidator {
    public static readonly instance = new NoopValidator();

    validatePage(_page: unknown): boolean {
        this.logger.debug("Skipping validation");
        return true;
    }
}
