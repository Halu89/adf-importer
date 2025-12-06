import type { Mock } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import logger from "../logger";

import { pageAttachmentLinkRepository } from "./PageAttachmentLinkRepository";

vi.mock("@forge/kvs");

const kvs = vi.mocked((await import("@forge/kvs")).default);

// Mock logger
vi.spyOn(logger, "log").mockImplementation(() => {});
vi.spyOn(logger, "error").mockImplementation(() => {});
vi.spyOn(logger, "debug").mockImplementation(() => {});

describe("PageAttachmentLinkRepository", () => {
    const link = {
        pageId: "p1",
        attachmentId: "a1",
        issueId: "i1",
    };
    const key = "pageStorage-i1-a1";
    const queryKey = "pageStorage-i1";

    beforeEach(async () => {
        vi.resetModules();
        const queryMock = {
            where: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            getMany: vi.fn(),
            cursor: vi.fn(),
            getOne: vi.fn(),
        };

        kvs.query.mockReturnValue(queryMock);

        vi.clearAllMocks();
    });

    it("savePage stores the link", async () => {
        kvs.set.mockResolvedValue(undefined);
        await pageAttachmentLinkRepository.savePage(link);
        expect(kvs.set).toHaveBeenCalledWith(key, JSON.stringify(link));
        // logger.log is called with a single string containing the key and JSON value separated by a newline
        expect(logger.log).toHaveBeenCalledWith(
            expect.stringContaining(`Page stored: ${link.pageId}`),
        );
    });

    it("savePage logs error on invalid input", async () => {
        await pageAttachmentLinkRepository.savePage({
            ...link,
            // @ts-expect-error -- Testing invalid input
            pageId: 123,
        });
        expect(logger.error).toHaveBeenCalledWith(
            "Unable to store page",
            expect.anything(),
        );
    });

    it("getPage returns parsed link", async () => {
        kvs.get.mockResolvedValue(JSON.stringify(link) as never);
        const result = await pageAttachmentLinkRepository.getPage("i1", "a1");
        expect(result).toEqual(link);
    });

    it("getPage returns undefined if not set", async () => {
        kvs.get.mockResolvedValue(undefined);
        const result = await pageAttachmentLinkRepository.getPage("i1", "a1");
        expect(result).toBeUndefined();
    });

    it("deletePage calls kvs.delete and logs", async () => {
        kvs.delete.mockResolvedValue(undefined);
        await expect(
            pageAttachmentLinkRepository.deletePage("i1", "a1"),
        ).resolves.toBeUndefined();
        expect(kvs.delete).toHaveBeenCalledWith(key);
        expect(logger.debug).toHaveBeenCalledWith(
            expect.stringContaining(`Deleting kvs entry: ${key}`),
        );
    });

    it("deletePage logs and throws on error", async () => {
        kvs.delete.mockRejectedValue(new Error("fail"));
        await expect(
            pageAttachmentLinkRepository.deletePage("i1", "a1"),
        ).rejects.toThrow("fail");
        expect(logger.error).toHaveBeenCalledWith(
            expect.stringContaining(`Unable to delete kvs entry ${key}`),
            expect.anything(),
        );
    });

    it("getPages returns parsed links", async () => {
        const fakeResults = [
            { key: "pageStorage-i1-a1", value: JSON.stringify(link) },
            {
                key: "pageStorage-i1-a2",
                value: JSON.stringify({ ...link, attachmentId: "a2" }),
            },
        ];
        const query = kvs.query();
        (query.getMany as Mock).mockResolvedValue({ results: fakeResults });
        const result = await pageAttachmentLinkRepository.getPages("i1");
        expect(result).toEqual([link, { ...link, attachmentId: "a2" }]);
        expect(logger.debug).toHaveBeenCalledWith(
            expect.stringContaining(`Querying for pages with key: ${queryKey}`),
        );
    });

    it("getPages returns [] if no results", async () => {
        const query = kvs.query();
        (query.getMany as Mock).mockResolvedValue(undefined);
        const result = await pageAttachmentLinkRepository.getPages("i1");
        expect(result).toEqual([]);
    });

    it("getKey throws on invalid input", async () => {
        // @ts-expect-error purposely invalid
        expect(() => pageAttachmentLinkRepository.getKey(null)).toThrow();
        expect(() =>
            pageAttachmentLinkRepository.getKey("bad-key-arg"),
        ).toThrow();
    });
});
