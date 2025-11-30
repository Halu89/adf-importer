import React, { useState } from "react";
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
} from "@forge/react";
import { PersonalSettings } from "../../../lib/schemas";
import { useMutation } from "@tanstack/react-query";
import { savePersonalSettings } from "../../api/InternalAPI";

const PersonalSettingsEdit = () => {
    const { handleSubmit, register, getFieldId } = useForm<PersonalSettings>();
    const [isOpen, setIsOpen] = useState(false);

    const closeModal = () => setIsOpen(false);

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
                            onSubmit={handleSubmit((settings) =>
                                saveSettings(settings),
                            )}
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
