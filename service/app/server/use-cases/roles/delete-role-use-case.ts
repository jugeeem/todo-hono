import type { RoleRepository } from "@/server/domain/repositories/role-repository";
import type { Result } from "@/server/use-cases/types";

export class DeleteRoleUseCase {
	constructor(private readonly roleRepository: RoleRepository) {}

	async execute(id: string, deletedBy: string): Promise<Result<void>> {
		return this.roleRepository.softDelete(id, deletedBy);
	}
}
