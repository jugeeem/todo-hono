import type {
	RoleDto,
	RoleRepository,
} from "@/server/domain/repositories/role-repository";
import type { Result } from "@/server/use-cases/types";

export type UpdateRoleUseCaseInput = {
	id: string;
	name?: string;
	description?: string;
	updatedBy: string;
};

export class UpdateRoleUseCase {
	constructor(private readonly roleRepository: RoleRepository) {}

	async execute(input: UpdateRoleUseCaseInput): Promise<Result<RoleDto>> {
		const { id, ...updateData } = input;
		return this.roleRepository.update(id, updateData);
	}
}
