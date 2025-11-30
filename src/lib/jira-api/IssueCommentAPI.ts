import api, {route} from "@forge/api";
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

    if (response.ok) {
        logger.debug(`Successfully created comment on issue ${issueIdOrKey}:`);
    } else {
        logger.error(`Failed to create comment: `, response, bodyData);
        throw new Error(`Failed to create comment: ${response.status} ${response.statusText}`);
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
                value: {internal: true},
            },
        ],
    };

    return createIssueComment(issueId, JSON.stringify(bodyData));
};
