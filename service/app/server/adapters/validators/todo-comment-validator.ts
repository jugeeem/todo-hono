import { z } from "zod";

export const createTodoCommentSchema = z.object({
	content: z.string().min(1),
});

export const updateTodoCommentSchema = z.object({
	content: z.string().min(1).optional(),
});

export type CreateTodoCommentBody = z.infer<typeof createTodoCommentSchema>;
export type UpdateTodoCommentBody = z.infer<typeof updateTodoCommentSchema>;
