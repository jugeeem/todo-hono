import { z } from "zod";

export const createTagSchema = z.object({
	name: z.string().min(1).max(100),
});

export const updateTagSchema = z.object({
	name: z.string().min(1).max(100).optional(),
});

export type CreateTagBody = z.infer<typeof createTagSchema>;
export type UpdateTagBody = z.infer<typeof updateTagSchema>;
