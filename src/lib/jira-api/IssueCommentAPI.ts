import api, { route } from "@forge/api";
import logger from "../logger";

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
