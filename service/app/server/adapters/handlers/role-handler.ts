import type { Context } from "hono";
import { successResponse } from "@/server/adapters/presenters/api-response";
import {
	addPermissionSchema,
	createRoleSchema,
	updateRoleSchema,
} from "@/server/adapters/validators/role-validator";
import { ValidationError } from "@/server/domain/errors/domain-error";
import type { PermissionRepository } from "@/server/domain/repositories/permission-repository";
import type { RoleRepository } from "@/server/domain/repositories/role-repository";
import type { AppEnv } from "@/server/types";
import { AddPermissionToRoleUseCase } from "@/server/use-cases/roles/add-permission-to-role-use-case";
import { CreateRoleUseCase } from "@/server/use-cases/roles/create-role-use-case";
import { DeleteRoleUseCase } from "@/server/use-cases/roles/delete-role-use-case";
import { GetRoleByIdUseCase } from "@/server/use-cases/roles/get-role-by-id-use-case";
import { GetRolesUseCase } from "@/server/use-cases/roles/get-roles-use-case";
import { RemovePermissionFromRoleUseCase } from "@/server/use-cases/roles/remove-permission-from-role-use-case";
import { UpdateRoleUseCase } from "@/server/use-cases/roles/update-role-use-case";

export function createRoleHandlers(
	roleRepository: RoleRepository,
	permissionRepository: PermissionRepository,
) {
	return {
		getRoles: async (c: Context<AppEnv>) => {
			const useCase = new GetRolesUseCase(roleRepository);
			const result = await useCase.execute();
			if (!result.ok) throw result.error;
			return successResponse(c, result.value);
		},

		getRoleById: async (c: Context<AppEnv>) => {
			const id = c.req.param("id") ?? "";
			const useCase = new GetRoleByIdUseCase(roleRepository);
			const result = await useCase.execute(id);
			if (!result.ok) throw result.error;
			return successResponse(c, result.value);
		},

		createRole: async (c: Context<AppEnv>) => {
			const body = await c.req.json();
			const parsed = createRoleSchema.safeParse(body);
			if (!parsed.success) {
				throw new ValidationError(
					parsed.error.issues[0]?.message ?? "入力が無効です",
				);
			}
			const auth = c.get("auth");
			const useCase = new CreateRoleUseCase(roleRepository);
			const result = await useCase.execute({
				...parsed.data,
				createdBy: auth.user.identityId,
			});
			if (!result.ok) throw result.error;
			return successResponse(c, result.value, 201);
		},

		updateRole: async (c: Context<AppEnv>) => {
			const id = c.req.param("id") ?? "";
			const body = await c.req.json();
			const parsed = updateRoleSchema.safeParse(body);
			if (!parsed.success) {
				throw new ValidationError(
					parsed.error.issues[0]?.message ?? "入力が無効です",
				);
			}
			const auth = c.get("auth");
			const useCase = new UpdateRoleUseCase(roleRepository);
			const result = await useCase.execute({
				id,
				...parsed.data,
				updatedBy: auth.user.identityId,
			});
			if (!result.ok) throw result.error;
			return successResponse(c, result.value);
		},

		deleteRole: async (c: Context<AppEnv>) => {
			const id = c.req.param("id") ?? "";
			const auth = c.get("auth");
			const useCase = new DeleteRoleUseCase(roleRepository);
			const result = await useCase.execute(id, auth.user.identityId);
			if (!result.ok) throw result.error;
			return c.body(null, 204);
		},

		addPermission: async (c: Context<AppEnv>) => {
			const roleId = c.req.param("id") ?? "";
			const body = await c.req.json();
			const parsed = addPermissionSchema.safeParse(body);
			if (!parsed.success) {
				throw new ValidationError(
					parsed.error.issues[0]?.message ?? "入力が無効です",
				);
			}
			const auth = c.get("auth");
			const useCase = new AddPermissionToRoleUseCase(
				roleRepository,
				permissionRepository,
			);
			const result = await useCase.execute(
				roleId,
				parsed.data.permissionId,
				auth.user.identityId,
			);
			if (!result.ok) throw result.error;
			return c.body(null, 204);
		},

		removePermission: async (c: Context<AppEnv>) => {
			const roleId = c.req.param("id") ?? "";
			const permissionId = c.req.param("permissionId") ?? "";
			const auth = c.get("auth");
			const useCase = new RemovePermissionFromRoleUseCase(roleRepository);
			const result = await useCase.execute(
				roleId,
				permissionId,
				auth.user.identityId,
			);
			if (!result.ok) throw result.error;
			return c.body(null, 204);
		},
	};
}
