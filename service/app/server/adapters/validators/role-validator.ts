import { z } from "zod";

export const createRoleSchema = z.object({
	name: z.string().min(1).max(256),
	description: z.string().optional(),
});

export const updateRoleSchema = z.object({
	name: z.string().min(1).max(256).optional(),
	description: z.string().optional(),
});

export const addPermissionSchema = z.object({
	permissionId: z.string().uuid(),
});

export type CreateRoleBody = z.infer<typeof createRoleSchema>;
export type UpdateRoleBody = z.infer<typeof updateRoleSchema>;
export type AddPermissionBody = z.infer<typeof addPermissionSchema>;
