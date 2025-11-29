import { LicenseDetails } from "@forge/bridge/out/types";
import { getAttachment } from "../lib/jira-api/AttachmentApi";
import { createPage } from "../lib/confluence-api/PageAPI";
import logger from "../lib/logger";

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
    logger.log(`Event received:\n${(JSON.stringify(event), null, 2)}`);
    logger.log(`Context:\n${JSON.stringify(context, null, 2)}`);

    if (event.attachment.mimeType === "text/plain") {
        const resp = await getAttachment(event.attachment.id);
        logger.debug("resp :>> ", resp);
        if (!resp) {
            logger.error("No body from text");
            return;
        } else {
            const page = createPageFromAttachment(event.attachment, TEST_PAGE);
            logger.debug("page :>> ", page);
        }
    }
}

const TEST_PAGE = `
<table data-table-width="760" data-layout="default" ac:local-id="d1c1e2c3-7b9d-4c23-a195-7582e98605d5"><colgroup><col style="width: 226.67px;" /><col style="width: 226.67px;" /><col style="width: 226.67px;" /></colgroup>
<tbody>
<tr>
<th>
<p><strong>REq</strong></p></th>
<th>
<p><strong>qerogih</strong></p></th>
<th>
<p><strong>hiuh</strong></p></th></tr>
<tr>
<td>
<p><ac:adf-extension><ac:adf-node type="inline-extension"><ac:adf-attribute key="extension-key">2237ccc1-3339-4360-9e41-d8b594746224/126ed95b-265f-4505-988f-39c68147fb29/static/requirement-yogi</ac:adf-attribute><ac:adf-attribute key="extension-type">com.atlassian.ecosystem</ac:adf-attribute><ac:adf-attribute key="parameters"><ac:adf-parameter key="macro-params"><ac:adf-parameter key="req-key"><ac:adf-parameter key="value">NP-001</ac:adf-parameter></ac:adf-parameter></ac:adf-parameter><ac:adf-parameter key="guest-params"><ac:adf-parameter key="req-key">NP-001</ac:adf-parameter></ac:adf-parameter><ac:adf-parameter key="macro-metadata"><ac:adf-parameter key="macro-id"><ac:adf-parameter key="value">298b5514-b048-4cf5-bafe-0eb189cd6faf</ac:adf-parameter></ac:adf-parameter><ac:adf-parameter key="schema-version"><ac:adf-parameter key="value">1</ac:adf-parameter></ac:adf-parameter><ac:adf-parameter key="title">requirement-yogi</ac:adf-parameter></ac:adf-parameter><ac:adf-parameter key="local-id">298b5514-b048-4cf5-bafe-0eb189cd6faf</ac:adf-parameter><ac:adf-parameter key="extension-id">ari:cloud:ecosystem::extension/2237ccc1-3339-4360-9e41-d8b594746224/126ed95b-265f-4505-988f-39c68147fb29/static/requirement-yogi</ac:adf-parameter><ac:adf-parameter key="extension-title">Requirement Yogi definition</ac:adf-parameter><ac:adf-parameter key="layout">inlineExtension</ac:adf-parameter><ac:adf-parameter key="forge-environment">PRODUCTION</ac:adf-parameter><ac:adf-parameter key="render">native</ac:adf-parameter></ac:adf-attribute><ac:adf-attribute key="text">Requirement Yogi definition</ac:adf-attribute><ac:adf-attribute key="local-id">5c2ef91d-8c76-4ef1-9c2c-52bf65da0d9d</ac:adf-attribute></ac:adf-node><ac:adf-fallback><ac:adf-node type="inline-extension"><ac:adf-attribute key="extension-key">2237ccc1-3339-4360-9e41-d8b594746224/126ed95b-265f-4505-988f-39c68147fb29/static/requirement-yogi</ac:adf-attribute><ac:adf-attribute key="extension-type">com.atlassian.ecosystem</ac:adf-attribute><ac:adf-attribute key="parameters"><ac:adf-parameter key="macro-params"><ac:adf-parameter key="req-key"><ac:adf-parameter key="value">NP-001</ac:adf-parameter></ac:adf-parameter></ac:adf-parameter><ac:adf-parameter key="guest-params"><ac:adf-parameter key="req-key">NP-001</ac:adf-parameter></ac:adf-parameter><ac:adf-parameter key="macro-metadata"><ac:adf-parameter key="macro-id"><ac:adf-parameter key="value">298b5514-b048-4cf5-bafe-0eb189cd6faf</ac:adf-parameter></ac:adf-parameter><ac:adf-parameter key="schema-version"><ac:adf-parameter key="value">1</ac:adf-parameter></ac:adf-parameter><ac:adf-parameter key="title">requirement-yogi</ac:adf-parameter></ac:adf-parameter><ac:adf-parameter key="local-id">298b5514-b048-4cf5-bafe-0eb189cd6faf</ac:adf-parameter><ac:adf-parameter key="extension-id">ari:cloud:ecosystem::extension/2237ccc1-3339-4360-9e41-d8b594746224/126ed95b-265f-4505-988f-39c68147fb29/static/requirement-yogi</ac:adf-parameter><ac:adf-parameter key="extension-title">Requirement Yogi definition</ac:adf-parameter><ac:adf-parameter key="layout">inlineExtension</ac:adf-parameter><ac:adf-parameter key="forge-environment">PRODUCTION</ac:adf-parameter><ac:adf-parameter key="render">native</ac:adf-parameter></ac:adf-attribute><ac:adf-attribute key="text">Requirement Yogi definition</ac:adf-attribute><ac:adf-attribute key="local-id">5c2ef91d-8c76-4ef1-9c2c-52bf65da0d9d</ac:adf-attribute></ac:adf-node></ac:adf-fallback></ac:adf-extension></p></td>
<td>
<p /></td>
<td>
<p /></td></tr>
<tr>
<td>
<p><ac:structured-macro ac:name="requirement-yogi" ac:schema-version="1" ac:local-id="e64b730b-6a79-4e96-a1e8-1123b60e6a8c" ac:macro-id="8e096b29-8cda-4112-937e-4f57b1bf2cd3"><ac:parameter ac:name="reqKey">NP-002</ac:parameter></ac:structured-macro></p></td>
<td>
<p /></td>
<td>
<p /></td></tr>
<tr>
<td>
<p /></td>
<td>
<p /></td>
<td>
<p /></td></tr>
<tr>
<td>
<p /></td>
<td>
<p /></td>
<td>
<p /></td></tr></tbody></table>
<p />
`;

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
