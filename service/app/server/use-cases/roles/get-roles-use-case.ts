import type {
	RoleDto,
	RoleRepository,
} from "@/server/domain/repositories/role-repository";
import type { Result } from "@/server/use-cases/types";

export class GetRolesUseCase {
	constructor(private readonly roleRepository: RoleRepository) {}

	async execute(): Promise<Result<RoleDto[]>> {
		return this.roleRepository.findAll();
	}
}
