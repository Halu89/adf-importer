import { LicenseDetails } from "@forge/bridge/out/types";
import { getAttachment } from "../lib/jira-api/AttachmentApi";
import {
    createPage,
    CreatePage200Response,
} from "../lib/confluence-api/PageAPI";
import logger from "../lib/logger";
import { StorageFormatValidator } from "../lib/PageValidator";
import { createInternalComment } from "../lib/jira-api/IssueCommentAPI";

interface Attachment {
    id: string;
    issueId: string;
    fileName: string;
    createDate: string;
    size: string;
    mimeType: string;
    author?: User;
}

interface User {
    accountId: string;
}

interface AttachmentEvent {
    eventType: "avi:jira:created:attachment";
    /**
     * The Jira account ID of the user who created the attachment.
     */
    atlassianId: string;
    attachment: Attachment;
}

interface RemoteContext {
    license: LicenseDetails;
    installContext: string;
    installation: {
        ari: {
            installationId: string;
        };
        contexts: [
            {
                cloudId: string;
                workspaceId: string;
            },
        ];
    };
}

export async function handleAttachmentAdded(
    event: AttachmentEvent,
    context: RemoteContext,
) {
    logger.log(`Event received: ${event.eventType}\n`, event);

    if (
        event.attachment.mimeType === "text/plain" ||
        event.attachment.mimeType === "binary/octet-stream"
    ) {
        const resp = await getAttachment(event.attachment.id);

        if (StorageFormatValidator.instance.validatePage(resp)) {
            const page = await createPageFromAttachment(event.attachment, resp);
            logger.log(
                `Successfully created page for attachment: ${event.attachment.id}\n${JSON.stringify(page, null, 2)}`,
            );

            await createInternalComment(
                event.attachment.issueId,
                createLinkToPage(pageUrl(page)),
            );
            logger.log(
                `Successfully created comment for attachment: ${event.attachment.id}`,
            );
        } else {
            logger.log("Ignoring attachment: Invalid document format");
        }
    } else {
        logger.log(
            `Ignoring attachment: ${event.attachment.id} as it is not a text file`,
        );
    }
}

const pageUrl = (page: CreatePage200Response | undefined) => {
    if (!page?._links?.base || !page?._links?.webui) return;

    return `${page?._links?.base}${page?._links?.webui}`;
};

function createPageFromAttachment(attachment: Attachment, text: string) {
    /**
     * The ID of the Confluence space where the page will be created. Will have to be configurable
     */
    const SPACE_ID = "635502596";
    const HOMEPAGE_ID = "635503984";

    return createPage({
        spaceId: SPACE_ID,
        body: {
            representation: "storage",
            value: text,
        },
        status: "current",
        title: `${attachment.fileName} - ${attachment.issueId} - ${attachment.createDate}`,
        parentId: HOMEPAGE_ID,
    });
}

function createLinkToPage(pageUrl?: string) {
    if (!pageUrl) {
        return {
            type: "doc",
            content: [
                {
                    type: "paragraph",
                    attrs: {
                        localId: "2b7a5e7a-d3a1-43ba-9069-9b20fdf52f91",
                    },
                    content: [
                        {
                            text: "ADF imported",
                            type: "text",
                        },
                    ],
                },
            ],
            version: 1,
        };
    } else {
        return {
            type: "doc",
            content: [
                {
                    type: "paragraph",
                    attrs: {
                        localId: "2b7a5e7a-d3a1-43ba-9069-9b20fdf52f91",
                    },
                    content: [
                        {
                            text: "ADF imported:",
                            type: "text",
                        },
                        {
                            type: "inlineCard",
                            attrs: {
                                url: pageUrl,
                            },
                        },
                    ],
                },
            ],
            version: 1,
        };
    }
}
