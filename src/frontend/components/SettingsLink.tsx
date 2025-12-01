import { LinkProps } from "@forge/react/out/types";
import { useQuery } from "@tanstack/react-query";
import { router } from "@forge/bridge";
import { Link } from "@forge/react";
import React from "react";

type SettingsLinkProps = Omit<LinkProps, "href">;

const SettingsLink = ({ children, ...rest }: SettingsLinkProps) => {
    const { data: settingsUrl = "#" } = useQuery({
        queryKey: ["GetSettingsUrl"],
        queryFn: async () => {
            const url = await router.getUrl({
                target: "module",
                moduleKey: "settings",
            });
            return url?.href;
        },
    });

    return (
        <Link href={settingsUrl} {...rest}>
            Configure my personal settings
        </Link>
    );
};

export default SettingsLink;
