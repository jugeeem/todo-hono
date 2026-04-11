import type {
	UserRoleDto,
	UserRoleRepository,
} from "@/server/domain/repositories/user-role-repository";
import type { Result } from "@/server/use-cases/types";

export class GetUserRolesUseCase {
	constructor(private readonly userRoleRepository: UserRoleRepository) {}

	async execute(userId: string): Promise<Result<UserRoleDto[]>> {
		return this.userRoleRepository.findByUserId(userId);
	}
}
