import { deletePage } from "./confluence-api/PageAPI";
import { deleteComment, getComments } from "./jira-api/IssueCommentAPI";
import logger from "./logger";
import { pageAttachmentLinkRepository } from "./storage";

export async function cleanup(
    issueId: string | number,
    attachmentId: string | number,
) {
    logger.debug(
        `Starting cleanup for issue ${issueId} and attachment ${attachmentId}`,
    );

    const details = await pageAttachmentLinkRepository.getPage(
        issueId,
        attachmentId,
    );
    logger.debug(`Details for cleanup: `, details);
    if (details) {
        await deletePage(details.pageId);
        await pageAttachmentLinkRepository.deletePage(issueId, details.pageId);
    } else {
        logger.debug("No cleanup required for attachment:", attachmentId);
    }
}

export async function cleanupAll(issueId: string | number) {
    logger.debug(`Starting cleanup for issue ${issueId}`);

    const pages = await pageAttachmentLinkRepository.getPages(issueId);

    const cleanupResults = await Promise.allSettled(
        pages.map((page) => cleanup(issueId, page.attachmentId)),
    );

    await removeComments(issueId);

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

const removeComments = async (issueId: string | number) => {
    logger.debug(`Removing comments for issue ${issueId}`);
    const resp = await getComments(issueId);
    logger.debug(`Retrieved ${resp.comments.length} comments`);

    const appComments = resp.comments.filter(
        (comment) =>
            comment.author.accountType === "app" &&
            comment.author.displayName === "adf-importer",
    );
    logger.debug(`Found ${appComments.length} comments to delete`);

    const cleanupResults = await Promise.allSettled(
        appComments.map((comment) => deleteComment(issueId, comment.id)),
    );

    const tally = cleanupResults.reduce(tallyResult, {
        successful: 0,
        failed: 0,
    });

    if (tally.failed > 0) {
        logger.error(
            `Failed to cleanup ${tally.failed} comments for issue ${issueId}, successfully cleaned up ${tally.successful} comments.`,
        );
    } else {
        logger.debug(
            `Finished cleanup for issue ${issueId}, successfully cleaned up ${tally.successful} comments.`,
        );
    }
};
