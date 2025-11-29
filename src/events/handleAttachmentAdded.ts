import {LicenseDetails} from "@forge/bridge/out/types";
import {getAttachment} from "../lib/jira-api/AttachmentApi";
import {createPage} from "../lib/confluence-api/PageAPI";
import logger from "../lib/logger";
import {StorageFormatValidator} from "../lib/PageValidator";

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

    if (event.attachment.mimeType === "text/plain") {
        const resp = await getAttachment(event.attachment.id);

        if (StorageFormatValidator.instance.validatePage(resp)) {
            await createPageFromAttachment(event.attachment, resp);
            logger.log(`Successfully created page for attachment: ${event.attachment.id}`);
        } else {
            logger.log("Ignoring attachment: Invalid document format");
        }
    } else {
        logger.log(`Ignoring attachment: ${event.attachment.id} as it is not a text file`);
    }
}


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
