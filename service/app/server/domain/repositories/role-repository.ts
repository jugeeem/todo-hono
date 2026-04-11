import type { Result } from "@/server/use-cases/types";

export type PermissionSummary = {
	id: string;
	name: string;
	description: string | null;
};

export type RoleDto = {
	id: string;
	name: string;
	description: string | null;
	createdAt: Date;
	updatedAt: Date;
	permissions: PermissionSummary[];
};

export type CreateRoleInput = {
	name: string;
	description?: string;
	createdBy: string;
};

export type UpdateRoleInput = {
	name?: string;
	description?: string;
	updatedBy: string;
};

export interface RoleRepository {
	findAll(): Promise<Result<RoleDto[]>>;
	findById(id: string): Promise<Result<RoleDto | null>>;
	create(input: CreateRoleInput): Promise<Result<RoleDto>>;
	update(id: string, input: UpdateRoleInput): Promise<Result<RoleDto>>;
	softDelete(id: string, deletedBy: string): Promise<Result<void>>;
	addPermission(
		roleId: string,
		permissionId: string,
		createdBy: string,
	): Promise<Result<void>>;
	removePermission(
		roleId: string,
		permissionId: string,
		deletedBy: string,
	): Promise<Result<void>>;
}
