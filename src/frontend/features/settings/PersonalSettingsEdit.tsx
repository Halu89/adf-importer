import {
    Box,
    Button,
    ErrorMessage,
    Form,
    FormFooter,
    Inline,
    Label,
    LoadingButton,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    ModalTitle,
    ModalTransition,
    RequiredAsterisk,
    Spinner,
    Textfield,
    useForm,
    xcss,
} from "@forge/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Fragment, useState } from "react";
import type { PersonalSettings } from "../../../shared/schemas";
import {
    getPersonalSettings,
    savePersonalSettings,
} from "../../api/InternalAPI";

type Replacements = Exclude<PersonalSettings["replacements"], undefined>;

const PersonalSettingsEdit = () => {
    const [isOpen, setIsOpen] = useState(false);

    const closeModal = () => setIsOpen(false);

    const { data: existingSettings, isLoading } = useQuery(
        getPersonalSettings(),
    );

    console.debug("existingSettings :>> ", existingSettings);

    return (
        <>
            <Button onClick={() => setIsOpen(!isOpen)}>
                Open personal settings
            </Button>

            <ModalTransition>
                {isOpen && (
                    <Modal>
                        {isLoading ? (
                            <Spinner />
                        ) : (
                            <SettingsForm
                                closeModal={closeModal}
                                initialValues={existingSettings}
                            />
                        )}
                    </Modal>
                )}
            </ModalTransition>
        </>
    );
};

const SettingsForm = ({
    initialValues,
    closeModal,
}: {
    closeModal: () => void;
    initialValues: PersonalSettings;
}) => {
    const [replacements, setReplacements] = useState<Replacements>([]);
    const handleRemoveReplacement = (index: number) => {
        setReplacements((prev) => prev.filter((_, i) => index !== i));
    };

    const { mutate: saveSettings, isPending } = useMutation({
        ...savePersonalSettings,
        onSuccess: (...args) => {
            savePersonalSettings.onSuccess?.(...args);
            closeModal();
        },
    });

    const { handleSubmit, register, getFieldId, formState } =
        useForm<PersonalSettings>(
            initialValues ? { defaultValues: initialValues } : undefined,
        );

    const { errors } = formState;

    return (
        <Form
            onSubmit={handleSubmit((settings) => {
                saveSettings(settings);
            })}
        >
            <ModalHeader>
                <ModalTitle>Personal settings</ModalTitle>
                <Button onClick={closeModal} appearance={"subtle"}>
                    X
                </Button>
            </ModalHeader>
            <ModalBody>
                <Label labelFor={getFieldId("targetInstance")}>
                    Target instance
                    <RequiredAsterisk />
                </Label>
                <Textfield
                    {...register("targetInstance", {
                        required: true,
                    })}
                    placeholder="https://requirementyogi.atlassian.net"
                    autoFocus
                />
                {errors.targetInstance && (
                    <ErrorMessage>{errors.targetInstance.message}</ErrorMessage>
                )}

                <Label labelFor={getFieldId("authentication.email")}>
                    Email
                    <RequiredAsterisk />
                </Label>
                <Textfield
                    {...register("authentication.email", {
                        required: true,
                    })}
                    placeholder="cbriand@r-yogi.com"
                />
                {errors.authentication?.email && (
                    <ErrorMessage>
                        {errors.authentication?.email.message}
                    </ErrorMessage>
                )}

                <Label labelFor={getFieldId("authentication.token")}>
                    Token
                    <RequiredAsterisk />
                </Label>
                <Textfield
                    {...register("authentication.token", {
                        required: true,
                    })}
                    type={"password"}
                />
                {errors.authentication?.token && (
                    <ErrorMessage>
                        {errors.authentication?.token.message}
                    </ErrorMessage>
                )}

                <Label labelFor={getFieldId("space.id")}>
                    Space id
                    <RequiredAsterisk />
                </Label>
                <Textfield
                    {...register("space.id", {
                        required: true,
                    })}
                    placeholder="123456"
                />
                {errors.space?.id && (
                    <ErrorMessage>{errors.space?.id.message}</ErrorMessage>
                )}

                <Box xcss={xcss({ marginBlock: "space.100" })}>
                    <Button
                        onClick={() =>
                            setReplacements([
                                ...replacements,
                                { from: "", to: "" },
                            ])
                        }
                    >
                        Add replacement
                    </Button>
                </Box>

                {replacements.map((replacement, index) => (
                    <Fragment key={`${replacement.from}-${replacement.to}`}>
                        <Inline
                            grow={"fill"}
                            space="space.100"
                            alignInline="stretch"
                        >
                            <Box xcss={xcss({ width: "100%" })}>
                                <Label
                                    labelFor={getFieldId(
                                        `replacements.${index}.from`,
                                    )}
                                >
                                    From
                                    <RequiredAsterisk />
                                </Label>
                                <Textfield
                                    {...register(`replacements.${index}.from`, {
                                        required: true,
                                    })}
                                    placeholder="c2decf0d-0aa0-4ac9-bc64-4e3fb6d21205"
                                />
                            </Box>

                            <Box xcss={xcss({ width: "100%" })}>
                                <Label
                                    labelFor={getFieldId(
                                        `replacements.${index}.to`,
                                    )}
                                >
                                    To
                                    <RequiredAsterisk />
                                </Label>
                                <Textfield
                                    {...register(`replacements.${index}.to`, {
                                        required: true,
                                    })}
                                    placeholder="c2decf0d-0aa0-4ac9-bc64-4e3fb6d21205"
                                />
                            </Box>
                        </Inline>

                        <Box
                            xcss={xcss({
                                marginBlock: "space.050",
                            })}
                        >
                            <Button
                                onClick={() => handleRemoveReplacement(index)}
                            >
                                Remove
                            </Button>
                        </Box>
                    </Fragment>
                ))}
            </ModalBody>

            <ModalFooter>
                <FormFooter>
                    <Inline space="space.200">
                        <Button appearance="subtle" onClick={closeModal}>
                            Cancel
                        </Button>
                        <LoadingButton
                            appearance="primary"
                            type="submit"
                            isLoading={isPending}
                        >
                            Submit
                        </LoadingButton>
                    </Inline>
                </FormFooter>
            </ModalFooter>
        </Form>
    );
};

export default PersonalSettingsEdit;
