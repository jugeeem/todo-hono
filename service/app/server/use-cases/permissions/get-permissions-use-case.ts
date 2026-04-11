import type {
	PermissionDto,
	PermissionRepository,
} from "@/server/domain/repositories/permission-repository";
import type { Result } from "@/server/use-cases/types";

export class GetPermissionsUseCase {
	constructor(private readonly permissionRepository: PermissionRepository) {}

	async execute(): Promise<Result<PermissionDto[]>> {
		return this.permissionRepository.findAll();
	}
}
