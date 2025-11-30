import React, {useMemo} from "react";
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
    xcss
} from "@forge/react";
import useDebounce from "../../hooks/useDebounce";
import {useQuery} from "@tanstack/react-query";
import z from "zod";
import {searchSpacesByTitle} from "../../api/SpaceAPI";
import {makeInvoke} from "@forge/bridge";
import {ResolverDefs} from "../../../shared/types";
import {Space, SpaceSchema} from "../../../lib/schemas";

const invoke = makeInvoke<ResolverDefs>()

interface GlobalSettingsEditProps {
    onSubmit: () => void;
    closeModal: () => void;
}

const GlobalSettingsEdit = ({onSubmit, closeModal}: GlobalSettingsEditProps) => {
    const [key, setKey] = React.useState("");

    const {handleSubmit, register, getFieldId} = useForm();

    const debouncedKey = useDebounce(key, 300);

    const {data: spaces} = useQuery(searchSpacesByTitle(debouncedKey))

    const options = useMemo(() => createOptions(spaces?.results.map(searchItem => searchItem.space) || []), [spaces]);

    const saveSetting = async (data: unknown) => {
        console.debug("data :>> ", data)
        try {

            const parsedInput = SpaceSelectionFormSchema.parse(data);
            await invoke("saveGlobalSpaceSetting", {space: parsedInput.space.value});
            onSubmit();
        } catch (e: unknown) {
            console.error("Error parsing form data", e);
        }
    };

    return (
        <Box xcss={xcss({marginBlock: "space.300", marginInline: "space.500"})}>
            <Modal onClose={closeModal}>

                <Form onSubmit={handleSubmit(saveSetting)}>
                    <ModalHeader>
                        <ModalTitle>Configure default space</ModalTitle>
                        <Button appearance="subtle" onClick={closeModal}>X</Button>
                    </ModalHeader>

                    <ModalBody>
                        <Box xcss={xcss({maxWidth: "30rem"})}>
                            <Label labelFor={getFieldId("space")}>Space</Label>
                            <Select
                                {...register("space", {required: true})}
                                appearance="subtle"
                                onInputChange={value => setKey(value)}
                                options={options}
                            />
                        </Box>
                    </ModalBody>

                    <ModalFooter>
                        <FormFooter>
                            <Inline space="space.200">
                                <Button appearance="subtle" onClick={closeModal}>Cancel</Button>
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
    return spaces.map((space) => ({label: space.name, value: space}))
}

const SpaceSelectionFormSchema = z.object({
    space: SpaceOptionSchema,
});


export default GlobalSettingsEdit;
