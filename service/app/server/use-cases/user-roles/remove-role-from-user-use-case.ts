import type { UserRoleRepository } from "@/server/domain/repositories/user-role-repository";
import type { Result } from "@/server/use-cases/types";

export class RemoveRoleFromUserUseCase {
	constructor(private readonly userRoleRepository: UserRoleRepository) {}

	async execute(
		userId: string,
		roleId: string,
		deletedBy: string,
	): Promise<Result<void>> {
		return this.userRoleRepository.remove(userId, roleId, deletedBy);
	}
}
