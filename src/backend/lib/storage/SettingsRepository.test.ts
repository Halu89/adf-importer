import { describe, it, expect, vi, beforeEach } from "vitest";
import logger from "../logger";
import { settingsRepository } from "./SettingsRepository";

vi.mock(import("@forge/kvs"));

const kvs = vi.mocked((await import("@forge/kvs")).default);

// Mock logger
vi.spyOn(logger, "error").mockImplementation(() => {});

describe("SettingsRepository", () => {
    const space = { id: 1, key: "KEY", name: "Space", status: "active" };
    const personalSettings = {
        targetInstance: "url",
        authentication: { email: "a@b.com", token: "tok" },
        space: { id: "1" },
        replacements: [{ from: "a", to: "b" }],
    };
    const accountId = "12345678";

    beforeEach(async () => {
        vi.clearAllMocks();
    });

    it("saveGlobalSetting stores the space", async () => {
        kvs.set.mockResolvedValue(undefined);
        await expect(
            settingsRepository.saveGlobalSetting(space),
        ).resolves.toBeUndefined();

        expect(kvs.set).toHaveBeenCalledWith(
            "settings-globalSpace",
            JSON.stringify(space),
        );
    });

    it("getGlobalSetting returns parsed space", async () => {
        kvs.get.mockResolvedValue(JSON.stringify(space) as never);
        const result = await settingsRepository.getGlobalSetting();

        expect(kvs.get).toHaveBeenCalledWith("settings-globalSpace");
        expect(result).toEqual(space);
    });

    it("getGlobalSetting returns undefined if not set", async () => {
        kvs.get.mockResolvedValue(undefined);
        const result = await settingsRepository.getGlobalSetting();
        expect(kvs.get).toHaveBeenCalledWith("settings-globalSpace");
        expect(result).toBeUndefined();
    });

    it("savePersonalSpaceSetting stores settings", async () => {
        kvs.setSecret.mockResolvedValue(undefined);
        await expect(
            settingsRepository.savePersonalSpaceSetting(
                accountId,
                personalSettings,
            ),
        ).resolves.toBeUndefined();

        expect(kvs.setSecret).toHaveBeenCalledWith(
            "settings-personal-12345678",
            JSON.stringify(personalSettings),
        );
    });

    it("savePersonalSpaceSetting logs error on invalid input", async () => {
        await settingsRepository.savePersonalSpaceSetting(
            "short",
            personalSettings,
        );

        expect(logger.error).toHaveBeenCalledWith(
            "Unable to save personal settings",
            expect.anything(),
        );
    });

    it("getPersonalSpaceSetting returns parsed settings", async () => {
        kvs.getSecret.mockResolvedValue(
            JSON.stringify(personalSettings) as never,
        );
        const result =
            await settingsRepository.getPersonalSpaceSetting(accountId);

        expect(kvs.getSecret).toHaveBeenCalledWith(
            "settings-personal-12345678",
        );
        expect(result).toEqual(personalSettings);
    });

    it("getPersonalSpaceSetting returns undefined if not set", async () => {
        kvs.getSecret.mockResolvedValue(undefined);
        const result =
            await settingsRepository.getPersonalSpaceSetting(accountId);

        expect(kvs.getSecret).toHaveBeenCalledWith(
            "settings-personal-12345678",
        );
        expect(result).toBeUndefined();
    });

    it("getPersonalSpaceSetting logs error and returns undefined on parse error", async () => {
        kvs.getSecret.mockResolvedValue("not-json" as never);
        const result =
            await settingsRepository.getPersonalSpaceSetting(accountId);

        expect(logger.error).toHaveBeenCalledWith(
            "Unable to parse personal settings",
            expect.anything(),
        );
        expect(kvs.getSecret).toHaveBeenCalledWith(
            "settings-personal-12345678",
        );
        expect(result).toBeUndefined();
    });
});
