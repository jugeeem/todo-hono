import type {
	PermissionDto,
	PermissionRepository,
} from "@/server/domain/repositories/permission-repository";
import type { Result } from "@/server/use-cases/types";

export type CreatePermissionUseCaseInput = {
	name: string;
	description?: string;
	createdBy: string;
};

export class CreatePermissionUseCase {
	constructor(private readonly permissionRepository: PermissionRepository) {}

	async execute(
		input: CreatePermissionUseCaseInput,
	): Promise<Result<PermissionDto>> {
		return this.permissionRepository.create(input);
	}
}
