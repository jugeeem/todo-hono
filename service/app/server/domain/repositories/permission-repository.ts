import type { Result } from "@/server/use-cases/types";

export type PermissionDto = {
	id: string;
	name: string;
	description: string | null;
};

export type CreatePermissionInput = {
	name: string;
	description?: string;
	createdBy: string;
};

export interface PermissionRepository {
	getPermissionsByUserId(userId: string): Promise<Result<string[]>>;
	findAll(): Promise<Result<PermissionDto[]>>;
	findById(id: string): Promise<Result<PermissionDto | null>>;
	create(input: CreatePermissionInput): Promise<Result<PermissionDto>>;
}
