import { Inline, LoadingButton, Text } from "@forge/react";
import { useMutation } from "@tanstack/react-query";
import type { IssueAttachment } from "../../../api/AttachmentAPI";
import {
    exportPageToDefaultSpace,
    exportPageToPersonalSpace,
} from "../../../api/InternalAPI";
import useIssueKey from "../hooks/useIssueKey";

const AttachmentRow = ({ attachment }: { attachment: IssueAttachment }) => {
    const issueKey = useIssueKey();
    const { mutate: exportAttachmentToPersonal, isPending: isPendingPersonal } =
        useMutation(exportPageToPersonalSpace());
    const { mutate: exportAttachmentToDefault, isPending: isPendingDefault } =
        useMutation(exportPageToDefaultSpace());

    return (
        <Inline spread={"space-between"} alignBlock={"center"}>
            <Text>{attachment.filename}</Text>
            <Inline space={"space.150"}>
                <LoadingButton
                    onClick={() => {
                        exportAttachmentToDefault({
                            attachmentId: attachment.id,
                            issueKey,
                        });
                    }}
                    isLoading={isPendingDefault}
                >
                    Reimport
                </LoadingButton>

                <LoadingButton
                    onClick={() => {
                        exportAttachmentToPersonal({
                            attachmentId: attachment.id,
                            issueKey,
                        });
                    }}
                    isLoading={isPendingPersonal}
                >
                    Import to my personal instance
                </LoadingButton>
            </Inline>
        </Inline>
    );
};

export default AttachmentRow;
