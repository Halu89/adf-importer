import api, { route } from "@forge/api";
import logger from "../logger";
import z from "zod";

const createIssueComment = async (
    issueIdOrKey: string | number,
    bodyData: string,
) => {
    const response = await api
        .asApp()
        .requestJira(route`/rest/api/3/issue/${issueIdOrKey}/comment`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: bodyData,
        });

    if (response.ok) {
        logger.debug(`Successfully created comment on issue ${issueIdOrKey}:`);
    } else {
        logger.error(`Failed to create comment: `, response, bodyData);
        throw new Error(
            `Failed to create comment: ${response.status} ${response.statusText}`,
        );
    }
};

export const createInternalComment = async (
    issueId: string | number,
    bodyContent: unknown,
) => {
    const bodyData = {
        body: bodyContent,
        // Mark the comment internal
        properties: [
            {
                key: "sd.public.comment",
                value: { internal: true },
            },
        ],
    };

    return createIssueComment(issueId, JSON.stringify(bodyData));
};

const CommentSchema = z.object({
    id: z.string(),
    author: z.object({
        accountId: z.string(),
        displayName: z.string(),
        accountType: z.string(),
    }),
    body: z.object({}),
});

const MultiResultCommentSchema = z.object({
    startAt: z.number(),
    maxResults: z.number(),
    total: z.number(),
    comments: z.array(CommentSchema),
});

export async function getComments(issueIdOrKey: string | number) {
    logger.debug(`Fetching comments for issue ${issueIdOrKey}`);
    const resp = await api
        .asApp()
        .requestJira(route`/rest/api/3/issue/${issueIdOrKey}/comment`);

    if (resp.ok) {
        const result = MultiResultCommentSchema.parse(await resp.json());
        logger.debug(`Successfully fetched comments: `, result);
        return result;
    } else {
        logger.error(`Failed to fetch comments: `, resp);
        throw new Error(
            `Failed to fetch comments: ${resp.status} ${resp.statusText}`,
        );
    }
}

export async function deleteComment(
    issueIdOrKey: string | number,
    commentId: string | number,
) {
    logger.debug(`Deleting comment ${commentId} on issue ${issueIdOrKey}`);

    const resp = await api
        .asApp()
        .requestJira(
            route`/rest/api/3/issue/${issueIdOrKey}/comment/${commentId}`,
            { method: "DELETE" },
        );

    if (resp.ok) {
        logger.debug(
            `Successfully deleted comment ${commentId} on issue ${issueIdOrKey}`,
        );
    } else {
        logger.error(
            `Failed to delete comment ${commentId} on issue ${issueIdOrKey}: `,
            resp,
        );
        throw new Error(
            `Failed to delete comment ${commentId} on issue ${issueIdOrKey}: ${resp.status} ${resp.statusText}`,
        );
    }
}
