import type { UserRoleRepository } from "@/server/domain/repositories/user-role-repository";
import type { Result } from "@/server/use-cases/types";

export class AssignRoleToUserUseCase {
	constructor(private readonly userRoleRepository: UserRoleRepository) {}

	async execute(
		userId: string,
		roleId: string,
		createdBy: string,
	): Promise<Result<void>> {
		return this.userRoleRepository.assign(userId, roleId, createdBy);
	}
}
