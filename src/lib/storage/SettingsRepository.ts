import kvs from "@forge/kvs";
import z from "zod";
import {
    PersonalSettings,
    PersonalSettingsSchema,
    type Space,
    SpaceSchema,
} from "../schemas";

class SettingsRepository {
    readonly #keyPrefix: string = "settings";

    public async saveGlobalSetting(space: Space) {
        SpaceSchema.parse(space);
        return await kvs.set(this.getKey("globalSpace"), JSON.stringify(space));
    }

    public async getGlobalSetting(): Promise<Space | undefined> {
        const value = z
            .string()
            .optional()
            .parse(await kvs.get(this.getKey("globalSpace")));
        return value ? SpaceSchema.parse(JSON.parse(value)) : undefined;
    }

    public async savePersonalSpaceSetting(
        accountId: string,
        settings: PersonalSettings,
    ) {
        PersonalSettingsSchema.parse(settings);
        z.string().trim().min(8).parse(accountId);

        return await kvs.set(
            this.getKey("personalSettings", accountId),
            JSON.stringify(settings),
        );
    }

    public async getPersonalSpaceSetting(
        accountId: string,
    ): Promise<PersonalSettings | undefined> {
        const value = z
            .string()
            .optional()
            .parse(await kvs.get(this.getKey("personalSpace", accountId)));
        return value
            ? PersonalSettingsSchema.parse(JSON.parse(value))
            : undefined;
    }

    private getKey(...args: string[]): string {
        return [this.#keyPrefix, ...args].join("-");
    }
}

export const settingsRepository = new SettingsRepository();
