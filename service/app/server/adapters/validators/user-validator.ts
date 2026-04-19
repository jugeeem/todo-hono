import { z } from "zod";

export const updateUserSchema = z.object({
	username: z.string().min(1).max(256).optional(),
	email: z.email().max(256).optional(),
	userInfo: z
		.object({
			firstName: z.string().max(256).optional(),
			lastName: z.string().max(256).optional(),
			bio: z.string().nullable().optional(),
		})
		.optional(),
});

export type UpdateUserBody = z.infer<typeof updateUserSchema>;
