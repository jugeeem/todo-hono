import type { PrismaClient, Users } from "@/prisma/generated/prisma/client";
import type { AuthUser } from "@/server/domain/entities/auth";
import {
	ConflictError,
	DomainError,
	NotFoundError,
} from "@/server/domain/errors/domain-error";
import type {
	UpdateUserInput,
	UserDto,
	UserInfoDto,
	UserRepository,
} from "@/server/domain/repositories/user-repository";
import type { Result } from "@/server/use-cases/types";
import { err, ok } from "@/server/use-cases/types";

const userSelect = {
	id: true,
	username: true,
	email: true,
	createdAt: true,
	updatedAt: true,
	userInfo: {
		select: {
			firstName: true,
			lastName: true,
			bio: true,
		},
	},
} as const;

function toUserDto(user: {
	id: string;
	username: string;
	email: string;
	createdAt: Date;
	updatedAt: Date;
	userInfo: UserInfoDto | null;
}): UserDto {
	return {
		id: user.id,
		username: user.username,
		email: user.email,
		userInfo: user.userInfo,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	};
}

export class PrismaUserRepository implements UserRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async findAll(): Promise<Result<UserDto[]>> {
		try {
			const users = await this.prisma.users.findMany({
				where: { deletedAt: null },
				select: userSelect,
				orderBy: { createdAt: "asc" },
			});
			return ok(users.map(toUserDto));
		} catch {
			return err(
				new DomainError(
					"USER_FETCH_ERROR",
					"ユーザー情報の取得に失敗しました",
					500,
				),
			);
		}
	}

	async findById(id: string): Promise<Result<Users | null>> {
		try {
			const user = await this.prisma.users.findFirst({
				where: { id, deletedAt: null },
			});
			return ok(user);
		} catch {
			return err(
				new DomainError(
					"USER_FETCH_ERROR",
					"ユーザー情報の取得に失敗しました",
					500,
				),
			);
		}
	}

	async findDtoById(id: string): Promise<Result<UserDto | null>> {
		try {
			const user = await this.prisma.users.findFirst({
				where: { id, deletedAt: null },
				select: userSelect,
			});
			return ok(user ? toUserDto(user) : null);
		} catch {
			return err(
				new DomainError(
					"USER_FETCH_ERROR",
					"ユーザー情報の取得に失敗しました",
					500,
				),
			);
		}
	}

	async create(authUser: AuthUser): Promise<Result<Users>> {
		try {
			const user = await this.prisma.users.create({
				data: {
					id: authUser.identityId,
					username: authUser.username,
					email: authUser.email,
					password: "MANAGED_BY_KRATOS",
					createdBy: authUser.identityId,
					updatedBy: authUser.identityId,
				},
			});
			return ok(user);
		} catch {
			return err(
				new DomainError(
					"USER_CREATE_ERROR",
					"ユーザーの作成に失敗しました",
					500,
				),
			);
		}
	}

	async update(id: string, input: UpdateUserInput): Promise<Result<UserDto>> {
		try {
			const existing = await this.prisma.users.findFirst({
				where: { id, deletedAt: null },
			});
			if (!existing) {
				return err(new NotFoundError("ユーザーが見つかりません"));
			}
			if (input.username && input.username !== existing.username) {
				const conflict = await this.prisma.users.findFirst({
					where: { username: input.username, deletedAt: null },
				});
				if (conflict) {
					return err(
						new ConflictError(
							`ユーザー名 "${input.username}" は既に使用されています`,
						),
					);
				}
			}
			if (input.email && input.email !== existing.email) {
				const conflict = await this.prisma.users.findFirst({
					where: { email: input.email, deletedAt: null },
				});
				if (conflict) {
					return err(
						new ConflictError(
							`メールアドレス "${input.email}" は既に使用されています`,
						),
					);
				}
			}
			const updated = await this.prisma.users.update({
				where: { id },
				data: {
					...(input.username !== undefined && { username: input.username }),
					...(input.email !== undefined && { email: input.email }),
					updatedBy: input.updatedBy,
					updatedAt: new Date(),
					...(input.userInfo !== undefined && {
						userInfo: {
							upsert: {
								create: {
									firstName: input.userInfo.firstName ?? "",
									lastName: input.userInfo.lastName ?? "",
									bio: input.userInfo.bio ?? null,
									createdBy: input.updatedBy,
									updatedBy: input.updatedBy,
								},
								update: {
									...(input.userInfo.firstName !== undefined && {
										firstName: input.userInfo.firstName,
									}),
									...(input.userInfo.lastName !== undefined && {
										lastName: input.userInfo.lastName,
									}),
									...(input.userInfo.bio !== undefined && {
										bio: input.userInfo.bio,
									}),
									updatedBy: input.updatedBy,
									updatedAt: new Date(),
								},
							},
						},
					}),
				},
				select: userSelect,
			});
			return ok(toUserDto(updated));
		} catch {
			return err(
				new DomainError(
					"USER_UPDATE_ERROR",
					"ユーザーの更新に失敗しました",
					500,
				),
			);
		}
	}

	async softDelete(id: string, deletedBy: string): Promise<Result<void>> {
		try {
			const existing = await this.prisma.users.findFirst({
				where: { id, deletedAt: null },
			});
			if (!existing) {
				return err(new NotFoundError("ユーザーが見つかりません"));
			}
			await this.prisma.users.update({
				where: { id },
				data: {
					deletedAt: new Date(),
					deletedBy,
				},
			});
			return ok(undefined);
		} catch {
			return err(
				new DomainError(
					"USER_DELETE_ERROR",
					"ユーザーの削除に失敗しました",
					500,
				),
			);
		}
	}
}
