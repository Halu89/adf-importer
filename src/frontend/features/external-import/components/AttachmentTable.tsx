import { useMutation, useQuery } from "@tanstack/react-query";
import {
    getAttachmentsForIssue,
    type IssueAttachment,
} from "../../../api/AttachmentAPI";
import useIssueId from "../hooks/useIssueId";
import { Inline, LoadingButton, Stack, Text } from "@forge/react";
import { exportPageToPersonalSpace } from "../../../api/InternalAPI";

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
    const { mutate: exportAttachment, isPending } = useMutation(
        exportPageToPersonalSpace(),
    );

    return (
        <Inline spread={"space-between"} alignBlock={"center"}>
            <Text>{attachment.filename}</Text>
            <LoadingButton
                onClick={() => {
                    console.debug("Importing", attachment.id);
                    exportAttachment(attachment.id);
                }}
                isLoading={isPending}
            >
                Import to my personal instance
            </LoadingButton>
        </Inline>
    );
};

export default AttachmentTable;
