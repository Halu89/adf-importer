import api, { route } from "@forge/api";
import logger from "../logger";

var bodyData = {
    body: {
        content: [
            {
                content: [
                    {
                        text: "ADF imported",
                        type: "text",
                    },
                ],
                type: "paragraph",
            },
        ],
        type: "doc",
        version: 1,
    },
    visibility: null,

    // Create an internal comment
    properties: [
        {
            key: "sd.public.comment",
            value: { internal: true },
        },
    ],
};

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

    logger.log(`Response: ${response.status} ${response.statusText}`);
    logger.log(await response.json());
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
