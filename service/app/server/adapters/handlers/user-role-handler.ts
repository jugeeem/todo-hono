import type { Context } from "hono";
import { successResponse } from "@/server/adapters/presenters/api-response";
import { assignRoleSchema } from "@/server/adapters/validators/user-role-validator";
import { ValidationError } from "@/server/domain/errors/domain-error";
import type { UserRoleRepository } from "@/server/domain/repositories/user-role-repository";
import type { AppEnv } from "@/server/types";
import { AssignRoleToUserUseCase } from "@/server/use-cases/user-roles/assign-role-to-user-use-case";
import { GetUserRolesUseCase } from "@/server/use-cases/user-roles/get-user-roles-use-case";
import { RemoveRoleFromUserUseCase } from "@/server/use-cases/user-roles/remove-role-from-user-use-case";

export function createUserRoleHandlers(userRoleRepository: UserRoleRepository) {
	return {
		getUserRoles: async (c: Context<AppEnv>) => {
			const userId = c.req.param("id") ?? "";
			const useCase = new GetUserRolesUseCase(userRoleRepository);
			const result = await useCase.execute(userId);
			if (!result.ok) throw result.error;
			return successResponse(c, result.value);
		},

		assignRole: async (c: Context<AppEnv>) => {
			const userId = c.req.param("id") ?? "";
			const body = await c.req.json();
			const parsed = assignRoleSchema.safeParse(body);
			if (!parsed.success) {
				throw new ValidationError(
					parsed.error.issues[0]?.message ?? "入力が無効です",
				);
			}
			const auth = c.get("auth");
			const useCase = new AssignRoleToUserUseCase(userRoleRepository);
			const result = await useCase.execute(
				userId,
				parsed.data.roleId,
				auth.user.identityId,
			);
			if (!result.ok) throw result.error;
			return c.body(null, 204);
		},

		removeRole: async (c: Context<AppEnv>) => {
			const userId = c.req.param("id") ?? "";
			const roleId = c.req.param("roleId") ?? "";
			const auth = c.get("auth");
			const useCase = new RemoveRoleFromUserUseCase(userRoleRepository);
			const result = await useCase.execute(
				userId,
				roleId,
				auth.user.identityId,
			);
			if (!result.ok) throw result.error;
			return c.body(null, 204);
		},
	};
}
