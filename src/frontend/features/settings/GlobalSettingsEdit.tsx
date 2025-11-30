import React, {useMemo} from "react";
import {Box, Button, Form, FormFooter, FormSection, Heading, Label, Select, useForm, xcss} from "@forge/react";
import useDebounce from "../../hooks/useDebounce";
import {useQuery} from "@tanstack/react-query";
import z from "zod";
import {searchSpacesByTitle} from "../../api/SpaceAPI";
import {makeInvoke} from "@forge/bridge";
import {ResolverDefs} from "../../../shared/types";
import {Space, SpaceSchema} from "../../../lib/schemas";

const invoke = makeInvoke<ResolverDefs>()

const GlobalSettingsEdit = () => {
    const [key, setKey] = React.useState("");

    const {handleSubmit, register, getFieldId} = useForm();

    const debouncedKey = useDebounce(key, 300);

    const {data: spaces} = useQuery(searchSpacesByTitle(debouncedKey))

    const options = useMemo(() => createOptions(spaces?.results.map(searchItem => searchItem.space) || []), [spaces]);

    const saveSetting = async (data: unknown) => {
        const parsedInput = SpaceSelectionFormSchema.parse(data);

        await invoke("saveGlobalSpaceSetting", { space: parsedInput.space.value});
    };

    return (
        <Form onSubmit={handleSubmit(saveSetting)}>
            <Heading as="h2" size={"small"}>
                Configure the default space where the imported pages will be created.
            </Heading>
            <Box xcss={xcss({maxWidth: "50%"})}>

                <FormSection>
                    <Label labelFor={getFieldId("space")}>Space</Label>
                    <Select
                        {...register("space", {required: true})}
                        appearance="subtle"
                        onInputChange={value => setKey(value)}
                        options={options}
                    />

                </FormSection>
                <FormFooter>
                    <Button appearance="primary" type="submit">
                        Submit
                    </Button>
                </FormFooter>
            </Box>
        </Form>
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
