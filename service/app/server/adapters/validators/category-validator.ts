import { z } from "zod";

export const createCategorySchema = z.object({
	name: z.string().min(1).max(100),
	description: z.string().optional(),
});

export const updateCategorySchema = z.object({
	name: z.string().min(1).max(100).optional(),
	description: z.string().nullable().optional(),
});

export type CreateCategoryBody = z.infer<typeof createCategorySchema>;
export type UpdateCategoryBody = z.infer<typeof updateCategorySchema>;
