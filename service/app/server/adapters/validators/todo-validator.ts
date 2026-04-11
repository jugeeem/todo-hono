import { z } from "zod";

export const todoStatusValues = [
	"pending",
	"in_progress",
	"done",
	"cancelled",
] as const;

export const createTodoSchema = z.object({
	title: z.string().min(1).max(256),
	description: z.string().optional(),
	status: z.enum(todoStatusValues).default("pending"),
	priority: z.number().int().min(1).max(5).default(2),
	dueDate: z.string().datetime().optional(),
	categoryId: z.string().uuid().optional(),
	parentTodoId: z.string().uuid().optional(),
});

export const updateTodoSchema = z.object({
	title: z.string().min(1).max(256).optional(),
	description: z.string().nullable().optional(),
	status: z.enum(todoStatusValues).optional(),
	priority: z.number().int().min(1).max(5).optional(),
	dueDate: z.string().datetime().nullable().optional(),
	completedAt: z.string().datetime().nullable().optional(),
	categoryId: z.string().uuid().nullable().optional(),
});

export type CreateTodoBody = z.infer<typeof createTodoSchema>;
export type UpdateTodoBody = z.infer<typeof updateTodoSchema>;
