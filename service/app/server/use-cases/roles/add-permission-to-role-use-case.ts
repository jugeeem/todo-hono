import { NotFoundError } from "@/server/domain/errors/domain-error";
import type { PermissionRepository } from "@/server/domain/repositories/permission-repository";
import type { RoleRepository } from "@/server/domain/repositories/role-repository";
import type { Result } from "@/server/use-cases/types";
import { err, ok } from "@/server/use-cases/types";

export class AddPermissionToRoleUseCase {
	constructor(
		private readonly roleRepository: RoleRepository,
		private readonly permissionRepository: PermissionRepository,
	) {}

	async execute(
		roleId: string,
		permissionId: string,
		createdBy: string,
	): Promise<Result<void>> {
		const roleResult = await this.roleRepository.findById(roleId);
		if (!roleResult.ok) return roleResult;
		if (!roleResult.value)
			return err(new NotFoundError("ロールが見つかりません"));

		const permResult = await this.permissionRepository.findById(permissionId);
		if (!permResult.ok) return permResult;
		if (!permResult.value)
			return err(new NotFoundError("パーミッションが見つかりません"));

		const result = await this.roleRepository.addPermission(
			roleId,
			permissionId,
			createdBy,
		);
		if (!result.ok) return result;
		return ok(undefined);
	}
}
