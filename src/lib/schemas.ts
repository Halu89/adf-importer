import z from "zod";

export const IssueSchema = z.object({
    id: z.string(),
    key: z.string(),
    updated: z.string().optional(),
    fields: z.object({
        status: z.any(),
    }),
});

const ChangeSchema = z.object({
    field: z.string(),
    fieldId: z.string(),
    from: z.string().optional(),
    to: z.string().optional(),
    fromString: z.string().optional(),
    toString: z.string().optional(),
});

export const StatusSchema = z.object({
    self: z.string(),
    description: z.string().optional(),
    iconUrl: z.string().optional(),
    name: z.string(),
    id: z.string(),
    statusCategory: z.object({
        self: z.string(),
        id: z.number(),
        key: z.string(),
        colorName: z.string(),
    }),
});

export const ChangelogSchema = z.object({
    items: z.array(ChangeSchema),
});

export const UserSchema = z.object({
    accountId: z.string(),
});

export const AttachmentSchema = z.object({
    id: z.string(),
    issueId: z.string(),
    fileName: z.string(),
    mimeType: z.string(),
    createDate: z.string(),
    author: UserSchema.optional(),
});
