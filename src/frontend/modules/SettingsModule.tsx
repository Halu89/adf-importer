import React, {useMemo} from "react";
import ForgeReconciler, {
    Box,
    Button,
    Form,
    FormFooter, FormHeader,
    FormSection, Heading, HelperMessage,
    Label,
    RequiredAsterisk, Select,
    Text,
    Textfield, useForm, xcss
} from "@forge/react";
import {QueryClientProvider, queryOptions, useQuery} from "@tanstack/react-query";
import {queryClient, RequestError} from "../providers/QueryClientProvider";
import {requestConfluence,} from "@forge/bridge";
import logger from "../../lib/logger";
import z from "zod";
import useDebounce from "../hooks/useDebounce";

const stringOrNumber = z.union([z.string(), z.number()]);

const SpaceSchema = z.object({
    id: stringOrNumber,
    key: z.string(),
    name: z.string(),
    status: z.string(),
    icon: z.object({
        path: z.string(),
    }).optional().nullable(),
    homepage: z.object({
        id: stringOrNumber
    }).optional(),
});

type Space = z.infer<typeof SpaceSchema>;

const MultiSpaceResultSchema = z.object({
    results: z.array(z.object({space: SpaceSchema})),
})

function searchSpacesByTitle(debouncedKey: string) {
    return queryOptions({
        queryKey: ["GetSpaces", debouncedKey],
        queryFn: async () => {
            const titleSearchResults = await requestConfluence(`/wiki/rest/api/search?limit=20&expand=space.homepage&cql=type=space+AND+title~"${encodeURIComponent(debouncedKey)}*"`, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (titleSearchResults.ok) {
                try {
                    return MultiSpaceResultSchema.parse(await titleSearchResults.json());
                } catch (e: unknown) {
                    logger.error("Unable to parse spaces response", e)
                    throw new Error("Unable to parse spaces response")
                }
            }
        },
    });
}

const App = () => {
        const [key, setKey] = React.useState("");

        const {handleSubmit, register, getFieldId} = useForm();

        const debouncedKey = useDebounce(key, 300);

        const {data: spaces} = useQuery(searchSpacesByTitle(debouncedKey))

        const options = useMemo(() => createOptions(spaces?.results.map(searchItem => searchItem.space) || []), [spaces]);

        const login = (data: unknown) => {
            const parsedInput = SpaceSelectionFormSchema.parse(data);
            logger.debug(`Selected space: ${JSON.stringify(parsedInput.space.value, null, 2)}`);
        };

        return (
            <Form onSubmit={handleSubmit(login)}>
                <Heading as="h2" size={"small"}>
                    Configure the default space where the imported pages will be created.
                </Heading>
                <Box xcss={xcss({maxWidth: "50%"})}>

                    <FormSection>
                        <Label labelFor={getFieldId("space")} >Space</Label>
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
    }
;

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

ForgeReconciler.render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <App/>
        </QueryClientProvider>
    </React.StrictMode>,
);
