import { useQuery } from "@tanstack/react-query";
import { getAttachmentsForIssue } from "../../../api/AttachmentAPI";
import useIssueId from "../hooks/useIssueId";
import { Stack } from "@forge/react";
import AttachmentRow from "./AttachmentRow";

const AttachmentTable = () => {
    const issueId = useIssueId();
    const { data: attachments } = useQuery(getAttachmentsForIssue(issueId));

    return (
        <Stack space={"space.150"}>
            {attachments?.map((attachment) => (
                <AttachmentRow attachment={attachment} key={attachment.id} />
            ))}
        </Stack>
    );
};

export default AttachmentTable;
