import type { RoleRepository } from "@/server/domain/repositories/role-repository";
import type { Result } from "@/server/use-cases/types";

export class RemovePermissionFromRoleUseCase {
	constructor(private readonly roleRepository: RoleRepository) {}

	async execute(
		roleId: string,
		permissionId: string,
		deletedBy: string,
	): Promise<Result<void>> {
		return this.roleRepository.removePermission(
			roleId,
			permissionId,
			deletedBy,
		);
	}
}
