import React, { useMemo } from "react";
import {
    Box,
    Button,
    Form,
    FormFooter,
    Inline,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    ModalTitle,
    Select,
    useForm,
    xcss,
} from "@forge/react";
import useDebounce from "../../hooks/useDebounce";
import { useMutation, useQuery } from "@tanstack/react-query";
import z from "zod";
import { searchSpacesByTitle } from "../../api/SpaceAPI";
import { type Space, SpaceSchema } from "../../../lib/schemas";
import { saveGlobalSpaceSettings } from "../../api/InternalAPI";

interface GlobalSettingsEditProps {
    closeModal: () => void;
}

const GlobalSettingsEdit = ({ closeModal }: GlobalSettingsEditProps) => {
    const [key, setKey] = React.useState("");

    const { handleSubmit, register, getFieldId } = useForm();

    const debouncedKey = useDebounce(key, 300);

    const { data: spaces } = useQuery(searchSpacesByTitle(debouncedKey));

    const { mutate: saveGlobalSpace } = useMutation({
        ...saveGlobalSpaceSettings,
        onSuccess: (...args) => {
            saveGlobalSpaceSettings.onSuccess?.(...args);
            closeModal();
        },
    });

    const options = useMemo(
        () =>
            createOptions(
                spaces?.results.map((searchItem) => searchItem.space) || [],
            ),
        [spaces],
    );

    return (
        <Box
            xcss={xcss({ marginBlock: "space.300", marginInline: "space.500" })}
        >
            <Modal onClose={closeModal}>
                <Form
                    onSubmit={handleSubmit((data) => {
                        saveGlobalSpace(SpaceSchema.parse(data));
                    })}
                >
                    <ModalHeader>
                        <ModalTitle>Configure default space</ModalTitle>
                        <Button appearance="subtle" onClick={closeModal}>
                            X
                        </Button>
                    </ModalHeader>

                    <ModalBody>
                        <Box xcss={xcss({ maxWidth: "30rem" })}>
                            <Label labelFor={getFieldId("space")}>Space</Label>
                            <Select
                                {...register("space", { required: true })}
                                appearance="subtle"
                                onInputChange={(value) => setKey(value)}
                                options={options}
                            />
                        </Box>
                    </ModalBody>

                    <ModalFooter>
                        <FormFooter>
                            <Inline space="space.200">
                                <Button
                                    appearance="subtle"
                                    onClick={closeModal}
                                >
                                    Cancel
                                </Button>
                                <Button appearance="primary" type="submit">
                                    Submit
                                </Button>
                            </Inline>
                        </FormFooter>
                    </ModalFooter>
                </Form>
            </Modal>
        </Box>
    );
};

const SpaceOptionSchema = z.object({
    label: z.string(),
    value: SpaceSchema,
});

type SpaceOption = z.infer<typeof SpaceOptionSchema>;

const createOptions = (spaces: Space[]): SpaceOption[] => {
    return spaces.map((space) => ({ label: space.name, value: space }));
};

export default GlobalSettingsEdit;
