import kvs from "@forge/kvs";
import z from "zod";
import {
    type PersonalSettings,
    PersonalSettingsSchema,
    type Space,
    SpaceSchema,
} from "../schemas";
import logger from "../logger";

class SettingsRepository {
    readonly #keyPrefix: string = "settings";

    private static readonly PERSONAL: string = "personal";
    private static readonly GLOBAL_SPACE: string = "globalSpace";

    public async saveGlobalSetting(space: Space) {
        SpaceSchema.parse(space);
        return await kvs.set(
            this.getKey(SettingsRepository.GLOBAL_SPACE),
            JSON.stringify(space),
        );
    }

    public async getGlobalSetting(): Promise<Space | undefined> {
        const value = z
            .string()
            .optional()
            .parse(await kvs.get(this.getKey(SettingsRepository.GLOBAL_SPACE)));
        return value ? SpaceSchema.parse(JSON.parse(value)) : undefined;
    }

    public async savePersonalSpaceSetting(
        accountId: string,
        settings: PersonalSettings,
    ) {
        try {
            PersonalSettingsSchema.parse(settings);
            z.string().trim().min(8).parse(accountId);

            return await kvs.setSecret(
                this.getKey(SettingsRepository.PERSONAL, accountId),
                JSON.stringify(settings),
            );
        } catch (e) {
            logger.error("Unable to save personal settings", e);
        }
    }

    public async getPersonalSpaceSetting(
        accountId: string,
    ): Promise<PersonalSettings | undefined> {
        const value = z
            .string()
            .optional()
            .parse(
                await kvs.getSecret(
                    this.getKey(SettingsRepository.PERSONAL, accountId),
                ),
            );
        try {
            return value
                ? PersonalSettingsSchema.parse(JSON.parse(value))
                : undefined;
        } catch (e) {
            logger.error("Unable to parse personal settings", e);
            return undefined;
        }
    }

    private getKey(...args: string[]): string {
        return [this.#keyPrefix, ...args].join("-");
    }
}

export const settingsRepository = new SettingsRepository();
