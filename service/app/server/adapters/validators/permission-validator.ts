import { z } from "zod";

export const createPermissionSchema = z.object({
	name: z.string().min(1).max(256),
	description: z.string().optional(),
});

export type CreatePermissionBody = z.infer<typeof createPermissionSchema>;
