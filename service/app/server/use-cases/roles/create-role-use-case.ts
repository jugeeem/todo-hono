import type {
	RoleDto,
	RoleRepository,
} from "@/server/domain/repositories/role-repository";
import type { Result } from "@/server/use-cases/types";

export type CreateRoleUseCaseInput = {
	name: string;
	description?: string;
	createdBy: string;
};

export class CreateRoleUseCase {
	constructor(private readonly roleRepository: RoleRepository) {}

	async execute(input: CreateRoleUseCaseInput): Promise<Result<RoleDto>> {
		return this.roleRepository.create(input);
	}
}
