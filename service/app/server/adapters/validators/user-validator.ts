import { z } from "zod";

export const updateUserSchema = z.object({
	username: z.string().min(1).max(256).optional(),
	email: z.email().max(256).optional(),
});

export type UpdateUserBody = z.infer<typeof updateUserSchema>;
