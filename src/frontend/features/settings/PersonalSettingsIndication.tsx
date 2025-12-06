import { Text } from "@forge/react";
import { useQuery } from "@tanstack/react-query";
import { getPersonalSettings } from "../../api/InternalAPI";

const PersonalSettingsIndication = () => {
    const { data, isLoading } = useQuery(getPersonalSettings());

    if (isLoading) {
        return <Text>Loading personal settings</Text>;
    }

    if (!data) {
        return <Text>No personal settings found</Text>;
    }

    return <Text>Personal settings saved successfully</Text>;
};

export default PersonalSettingsIndication;
