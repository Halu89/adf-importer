import { useQuery } from "@tanstack/react-query";
import {
    getAttachmentsForIssue,
    IssueAttachment,
} from "../../../api/AttachmentAPI";
import useIssueId from "../hooks/useIssueId";
import { Button, Inline, Stack, Text } from "@forge/react";

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

const AttachmentRow = ({ attachment }: { attachment: IssueAttachment }) => {
    return (
        <Inline spread={"space-between"} alignBlock={"center"}>
            <Text>{attachment.filename}</Text>
            <Button
                onClick={() => {
                    console.debug("Importing", attachment.id);
                }}
            >
                Import to my personal instance
            </Button>
        </Inline>
    );
};

export default AttachmentTable;
