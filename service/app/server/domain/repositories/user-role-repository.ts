import type { Result } from "@/server/use-cases/types";

export type UserRoleDto = {
	id: string;
	roleId: string;
	roleName: string;
	roleDescription: string | null;
	assignedAt: Date;
};

export interface UserRoleRepository {
	findByUserId(userId: string): Promise<Result<UserRoleDto[]>>;
	assign(
		userId: string,
		roleId: string,
		createdBy: string,
	): Promise<Result<void>>;
	remove(
		userId: string,
		roleId: string,
		deletedBy: string,
	): Promise<Result<void>>;
}
