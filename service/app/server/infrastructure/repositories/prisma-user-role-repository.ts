import type { PrismaClient } from "@/prisma/generated/prisma/client";
import {
	ConflictError,
	DomainError,
} from "@/server/domain/errors/domain-error";
import type {
	UserRoleDto,
	UserRoleRepository,
} from "@/server/domain/repositories/user-role-repository";
import type { Result } from "@/server/use-cases/types";
import { err, ok } from "@/server/use-cases/types";

export class PrismaUserRoleRepository implements UserRoleRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async findByUserId(userId: string): Promise<Result<UserRoleDto[]>> {
		try {
			const userRoles = await this.prisma.userRoles.findMany({
				where: {
					userId,
					deletedAt: null,
					role: { deletedAt: null },
				},
				select: {
					id: true,
					roleId: true,
					createdAt: true,
					role: {
						select: { name: true, description: true },
					},
				},
				orderBy: { createdAt: "asc" },
			});
			return ok(
				userRoles.map((ur) => ({
					id: ur.id,
					roleId: ur.roleId,
					roleName: ur.role.name,
					roleDescription: ur.role.description,
					assignedAt: ur.createdAt,
				})),
			);
		} catch {
			return err(
				new DomainError(
					"USER_ROLE_FETCH_ERROR",
					"ユーザーのロール情報の取得に失敗しました",
					500,
				),
			);
		}
	}

	async assign(
		userId: string,
		roleId: string,
		createdBy: string,
	): Promise<Result<void>> {
		try {
			const existing = await this.prisma.userRoles.findFirst({
				where: { userId, roleId, deletedAt: null },
			});
			if (existing) {
				return err(
					new ConflictError("このロールは既にユーザーに割り当てられています"),
				);
			}
			await this.prisma.userRoles.create({
				data: { userId, roleId, createdBy, updatedBy: createdBy },
			});
			return ok(undefined);
		} catch (e) {
			if (e instanceof DomainError) return err(e);
			return err(
				new DomainError(
					"USER_ROLE_ASSIGN_ERROR",
					"ロールの割り当てに失敗しました",
					500,
				),
			);
		}
	}

	async remove(
		userId: string,
		roleId: string,
		deletedBy: string,
	): Promise<Result<void>> {
		try {
			await this.prisma.userRoles.updateMany({
				where: { userId, roleId, deletedAt: null },
				data: {
					deletedAt: new Date(),
					deletedBy,
					updatedAt: new Date(),
					updatedBy: deletedBy,
				},
			});
			return ok(undefined);
		} catch {
			return err(
				new DomainError(
					"USER_ROLE_REMOVE_ERROR",
					"ロールの削除に失敗しました",
					500,
				),
			);
		}
	}
}
