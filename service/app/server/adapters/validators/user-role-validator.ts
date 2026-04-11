import { z } from "zod";

export const assignRoleSchema = z.object({
	roleId: z.string().uuid(),
});

export type AssignRoleBody = z.infer<typeof assignRoleSchema>;
