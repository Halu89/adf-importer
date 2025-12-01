import { Fragment, useState } from "react";
import {
    Button,
    FormFooter,
    Form,
    Inline,
    Label,
    Modal,
    ModalBody,
    ModalHeader,
    ModalFooter,
    ModalTitle,
    ModalTransition,
    Textfield,
    useForm,
    RequiredAsterisk,
    LoadingButton,
    xcss,
    Box,
} from "@forge/react";
import type { PersonalSettings } from "../../../lib/schemas";
import { useMutation } from "@tanstack/react-query";
import { savePersonalSettings } from "../../api/InternalAPI";

type Replacements = Exclude<PersonalSettings["replacements"], undefined>;

const PersonalSettingsEdit = () => {
    const { handleSubmit, register, getFieldId } = useForm<PersonalSettings>();
    const [isOpen, setIsOpen] = useState(false);

    const [replacements, setReplacements] = useState<Replacements>([]);

    const closeModal = () => setIsOpen(false);

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

    return (
        <>
            <Button onClick={() => setIsOpen(!isOpen)}>
                Open personal settings
            </Button>

            <ModalTransition>
                {isOpen && (
                    <Modal>
                        <Form
                            onSubmit={handleSubmit((settings) => {
                                console.debug("settings :>> ", settings);
                                saveSettings(settings);
                            })}
                        >
                            <ModalHeader>
                                <ModalTitle>Personal settings</ModalTitle>
                                <Button
                                    onClick={closeModal}
                                    appearance={"subtle"}
                                >
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

                                <Label
                                    labelFor={getFieldId(
                                        "authentication.email",
                                    )}
                                >
                                    Email
                                    <RequiredAsterisk />
                                </Label>
                                <Textfield
                                    {...register("authentication.email", {
                                        required: true,
                                    })}
                                    placeholder="cbriand@r-yogi.com"
                                />

                                <Label
                                    labelFor={getFieldId(
                                        "authentication.token",
                                    )}
                                >
                                    Token
                                    <RequiredAsterisk />
                                </Label>
                                <Textfield
                                    {...register("authentication.token", {
                                        required: true,
                                    })}
                                    type={"password"}
                                />

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
                                    <Fragment
                                        key={`${replacement.from}-${replacement.to}`}
                                    >
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
                                                    {...register(
                                                        `replacements.${index}.from`,
                                                        {
                                                            required: true,
                                                        },
                                                    )}
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
                                                    {...register(
                                                        `replacements.${index}.to`,
                                                        {
                                                            required: true,
                                                        },
                                                    )}
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
                                                onClick={() =>
                                                    handleRemoveReplacement(
                                                        index,
                                                    )
                                                }
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
                                        <Button
                                            appearance="subtle"
                                            onClick={closeModal}
                                        >
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
                    </Modal>
                )}
            </ModalTransition>
        </>
    );
};

export default PersonalSettingsEdit;
