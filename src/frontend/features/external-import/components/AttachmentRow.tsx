import { Inline, LoadingButton, Text } from "@forge/react";
import { useMutation } from "@tanstack/react-query";
import type { IssueAttachment } from "../../../api/AttachmentAPI";
import {
    exportPageToDefaultSpace,
    exportPageToPersonalSpace,
} from "../../../api/InternalAPI";

const AttachmentRow = ({ attachment }: { attachment: IssueAttachment }) => {
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
                        exportAttachmentToDefault(attachment.id);
                    }}
                    isLoading={isPendingDefault}
                >
                    Reimport
                </LoadingButton>

                <LoadingButton
                    onClick={() => {
                        exportAttachmentToPersonal(attachment.id);
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
