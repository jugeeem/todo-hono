import type { PrismaClient } from "@/prisma/generated/prisma/client";
import {
	ConflictError,
	DomainError,
} from "@/server/domain/errors/domain-error";
import type {
	CreatePermissionInput,
	PermissionDto,
	PermissionRepository,
} from "@/server/domain/repositories/permission-repository";
import type { Result } from "@/server/use-cases/types";
import { err, ok } from "@/server/use-cases/types";

export class PrismaPermissionRepository implements PermissionRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async getPermissionsByUserId(userId: string): Promise<Result<string[]>> {
		try {
			const userRoles = await this.prisma.userRoles.findMany({
				where: {
					userId,
					deletedAt: null,
					role: {
						deletedAt: null,
					},
				},
				select: {
					role: {
						select: {
							rolePermissions: {
								where: {
									deletedAt: null,
									permission: {
										deletedAt: null,
									},
								},
								select: {
									permission: {
										select: {
											name: true,
										},
									},
								},
							},
						},
					},
				},
			});

			const permissionNames = [
				...new Set(
					userRoles.flatMap((ur) =>
						ur.role.rolePermissions.map((rp) => rp.permission.name),
					),
				),
			];

			return ok(permissionNames);
		} catch {
			return err(
				new DomainError(
					"PERMISSION_FETCH_ERROR",
					"権限情報の取得に失敗しました",
					500,
				),
			);
		}
	}

	async findAll(): Promise<Result<PermissionDto[]>> {
		try {
			const permissions = await this.prisma.permissions.findMany({
				where: { deletedAt: null },
				select: { id: true, name: true, description: true },
				orderBy: { name: "asc" },
			});
			return ok(permissions);
		} catch {
			return err(
				new DomainError(
					"PERMISSION_FETCH_ERROR",
					"パーミッション一覧の取得に失敗しました",
					500,
				),
			);
		}
	}

	async findById(id: string): Promise<Result<PermissionDto | null>> {
		try {
			const permission = await this.prisma.permissions.findFirst({
				where: { id, deletedAt: null },
				select: { id: true, name: true, description: true },
			});
			return ok(permission);
		} catch {
			return err(
				new DomainError(
					"PERMISSION_FETCH_ERROR",
					"パーミッション情報の取得に失敗しました",
					500,
				),
			);
		}
	}

	async create(input: CreatePermissionInput): Promise<Result<PermissionDto>> {
		try {
			const existing = await this.prisma.permissions.findFirst({
				where: { name: input.name, deletedAt: null },
			});
			if (existing) {
				return err(
					new ConflictError(`パーミッション "${input.name}" は既に存在します`),
				);
			}
			const permission = await this.prisma.permissions.create({
				data: {
					name: input.name,
					description: input.description,
					createdBy: input.createdBy,
					updatedBy: input.createdBy,
				},
				select: { id: true, name: true, description: true },
			});
			return ok(permission);
		} catch (e) {
			if (e instanceof DomainError) return err(e);
			return err(
				new DomainError(
					"PERMISSION_CREATE_ERROR",
					"パーミッションの作成に失敗しました",
					500,
				),
			);
		}
	}
}
