import { pageStorage } from "./storage";
import { deletePage } from "./confluence-api/PageAPI";
import logger from "./logger";

export async function cleanup(
    issueId: string | number,
    attachmentId: string | number,
) {
    logger.debug(
        `Starting cleanup for issue ${issueId} and attachment ${attachmentId}`,
    );

    const details = await pageStorage.getPage(issueId, attachmentId);
    logger.debug(`Details for cleanup: `, details);
    if (details) {
        await deletePage(details.pageId);
        await pageStorage.deletePage(issueId, details.pageId);
    } else {
        logger.debug("No cleanup required for attachment:", attachmentId);
    }
}

export async function cleanupAll(issueId: string | number) {
    logger.debug(`Starting cleanup for issue ${issueId}`);

    const pages = await pageStorage.getPages(issueId);

    const cleanupResults = await Promise.allSettled(
        pages.map((page) => cleanup(issueId, page.attachmentId)),
    );

    const tally = cleanupResults.reduce(tallyResult, {
        successful: 0,
        failed: 0,
    });

    if (tally.failed > 0) {
        logger.error(
            `Failed to cleanup ${tally.failed} pages for issue ${issueId}, successfully cleaned up ${tally.successful} pages.`,
        );
    } else {
        logger.debug(
            `Finished cleanup for issue ${issueId}, successfully cleaned up ${tally.successful} pages.`,
        );
    }
}

const tallyResult = (
    acc: { successful: number; failed: number },
    curr: PromiseSettledResult<unknown>,
) => {
    if (curr.status === "fulfilled") {
        return {
            successful: acc.successful + 1,
            failed: acc.failed,
        };
    } else {
        return {
            successful: acc.successful,
            failed: acc.failed + 1,
        };
    }
};
