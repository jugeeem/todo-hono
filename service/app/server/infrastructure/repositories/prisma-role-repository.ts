import type { PrismaClient } from "@/prisma/generated/prisma/client";
import {
	ConflictError,
	DomainError,
	NotFoundError,
} from "@/server/domain/errors/domain-error";
import type {
	CreateRoleInput,
	RoleDto,
	RoleRepository,
	UpdateRoleInput,
} from "@/server/domain/repositories/role-repository";
import type { Result } from "@/server/use-cases/types";
import { err, ok } from "@/server/use-cases/types";

const roleSelect = {
	id: true,
	name: true,
	description: true,
	createdAt: true,
	updatedAt: true,
	rolePermissions: {
		where: {
			deletedAt: null,
			permission: { deletedAt: null },
		},
		select: {
			permission: {
				select: { id: true, name: true, description: true },
			},
		},
	},
} as const;

type RoleSelectResult = {
	id: string;
	name: string;
	description: string | null;
	createdAt: Date;
	updatedAt: Date;
	rolePermissions: Array<{
		permission: { id: string; name: string; description: string | null };
	}>;
};

function toRoleDto(role: RoleSelectResult): RoleDto {
	return {
		id: role.id,
		name: role.name,
		description: role.description,
		createdAt: role.createdAt,
		updatedAt: role.updatedAt,
		permissions: role.rolePermissions.map((rp) => rp.permission),
	};
}

export class PrismaRoleRepository implements RoleRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async findAll(): Promise<Result<RoleDto[]>> {
		try {
			const roles = await this.prisma.roles.findMany({
				where: { deletedAt: null },
				select: roleSelect,
				orderBy: { createdAt: "asc" },
			});
			return ok(roles.map(toRoleDto));
		} catch {
			return err(
				new DomainError(
					"ROLE_FETCH_ERROR",
					"ロール情報の取得に失敗しました",
					500,
				),
			);
		}
	}

	async findById(id: string): Promise<Result<RoleDto | null>> {
		try {
			const role = await this.prisma.roles.findFirst({
				where: { id, deletedAt: null },
				select: roleSelect,
			});
			return ok(role ? toRoleDto(role) : null);
		} catch {
			return err(
				new DomainError(
					"ROLE_FETCH_ERROR",
					"ロール情報の取得に失敗しました",
					500,
				),
			);
		}
	}

	async create(input: CreateRoleInput): Promise<Result<RoleDto>> {
		try {
			const existing = await this.prisma.roles.findFirst({
				where: { name: input.name, deletedAt: null },
			});
			if (existing) {
				return err(
					new ConflictError(`ロール "${input.name}" は既に存在します`),
				);
			}
			const role = await this.prisma.roles.create({
				data: {
					name: input.name,
					description: input.description,
					createdBy: input.createdBy,
					updatedBy: input.createdBy,
				},
				select: roleSelect,
			});
			return ok(toRoleDto(role));
		} catch (e) {
			if (e instanceof DomainError) return err(e);
			return err(
				new DomainError("ROLE_CREATE_ERROR", "ロールの作成に失敗しました", 500),
			);
		}
	}

	async update(id: string, input: UpdateRoleInput): Promise<Result<RoleDto>> {
		try {
			const existing = await this.prisma.roles.findFirst({
				where: { id, deletedAt: null },
			});
			if (!existing) {
				return err(new NotFoundError("ロールが見つかりません"));
			}
			const role = await this.prisma.roles.update({
				where: { id },
				data: {
					...(input.name !== undefined && { name: input.name }),
					...(input.description !== undefined && {
						description: input.description,
					}),
					updatedBy: input.updatedBy,
					updatedAt: new Date(),
				},
				select: roleSelect,
			});
			return ok(toRoleDto(role));
		} catch (e) {
			if (e instanceof DomainError) return err(e);
			return err(
				new DomainError("ROLE_UPDATE_ERROR", "ロールの更新に失敗しました", 500),
			);
		}
	}

	async softDelete(id: string, deletedBy: string): Promise<Result<void>> {
		try {
			const existing = await this.prisma.roles.findFirst({
				where: { id, deletedAt: null },
			});
			if (!existing) {
				return err(new NotFoundError("ロールが見つかりません"));
			}
			await this.prisma.roles.update({
				where: { id },
				data: {
					deletedAt: new Date(),
					deletedBy,
					updatedAt: new Date(),
					updatedBy: deletedBy,
				},
			});
			return ok(undefined);
		} catch (e) {
			if (e instanceof DomainError) return err(e);
			return err(
				new DomainError("ROLE_DELETE_ERROR", "ロールの削除に失敗しました", 500),
			);
		}
	}

	async addPermission(
		roleId: string,
		permissionId: string,
		createdBy: string,
	): Promise<Result<void>> {
		try {
			const existing = await this.prisma.rolePermissions.findFirst({
				where: { roleId, permissionId, deletedAt: null },
			});
			if (existing) {
				return err(
					new ConflictError(
						"このパーミッションは既にロールに割り当てられています",
					),
				);
			}
			await this.prisma.rolePermissions.create({
				data: { roleId, permissionId, createdBy, updatedBy: createdBy },
			});
			return ok(undefined);
		} catch (e) {
			if (e instanceof DomainError) return err(e);
			return err(
				new DomainError(
					"ROLE_PERMISSION_ADD_ERROR",
					"パーミッションの追加に失敗しました",
					500,
				),
			);
		}
	}

	async removePermission(
		roleId: string,
		permissionId: string,
		deletedBy: string,
	): Promise<Result<void>> {
		try {
			await this.prisma.rolePermissions.updateMany({
				where: { roleId, permissionId, deletedAt: null },
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
					"ROLE_PERMISSION_REMOVE_ERROR",
					"パーミッションの削除に失敗しました",
					500,
				),
			);
		}
	}
}
