import { NotFoundError } from "@/server/domain/errors/domain-error";
import type {
	RoleDto,
	RoleRepository,
} from "@/server/domain/repositories/role-repository";
import type { Result } from "@/server/use-cases/types";
import { err } from "@/server/use-cases/types";

export class GetRoleByIdUseCase {
	constructor(private readonly roleRepository: RoleRepository) {}

	async execute(id: string): Promise<Result<RoleDto>> {
		const result = await this.roleRepository.findById(id);
		if (!result.ok) return result;
		if (!result.value) return err(new NotFoundError("ロールが見つかりません"));
		return result as Result<RoleDto>;
	}
}
