import type { Context } from "hono";
import { successResponse } from "@/server/adapters/presenters/api-response";
import { createPermissionSchema } from "@/server/adapters/validators/permission-validator";
import { ValidationError } from "@/server/domain/errors/domain-error";
import type { PermissionRepository } from "@/server/domain/repositories/permission-repository";
import type { AppEnv } from "@/server/types";
import { CreatePermissionUseCase } from "@/server/use-cases/permissions/create-permission-use-case";
import { GetPermissionsUseCase } from "@/server/use-cases/permissions/get-permissions-use-case";

export function createPermissionHandlers(
	permissionRepository: PermissionRepository,
) {
	return {
		getPermissions: async (c: Context<AppEnv>) => {
			const useCase = new GetPermissionsUseCase(permissionRepository);
			const result = await useCase.execute();
			if (!result.ok) throw result.error;
			return successResponse(c, result.value);
		},

		createPermission: async (c: Context<AppEnv>) => {
			const body = await c.req.json();
			const parsed = createPermissionSchema.safeParse(body);
			if (!parsed.success) {
				throw new ValidationError(
					parsed.error.issues[0]?.message ?? "入力が無効です",
				);
			}
			const auth = c.get("auth");
			const useCase = new CreatePermissionUseCase(permissionRepository);
			const result = await useCase.execute({
				...parsed.data,
				createdBy: auth.user.identityId,
			});
			if (!result.ok) throw result.error;
			return successResponse(c, result.value, 201);
		},
	};
}
