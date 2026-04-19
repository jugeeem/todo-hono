import type { PrismaClient } from "@/prisma/generated/prisma/client";
import {
	ConflictError,
	DomainError,
	NotFoundError,
} from "@/server/domain/errors/domain-error";
import type {
	CreateTagInput,
	TagDto,
	TagRepository,
	UpdateTagInput,
} from "@/server/domain/repositories/tag-repository";
import type { Result } from "@/server/use-cases/types";
import { err, ok } from "@/server/use-cases/types";

const tagSelect = {
	id: true,
	name: true,
	userId: true,
	createdAt: true,
	updatedAt: true,
} as const;

export class PrismaTagRepository implements TagRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async findAllByUserId(userId: string): Promise<Result<TagDto[]>> {
		try {
			const tags = await this.prisma.tags.findMany({
				where: { userId, deletedAt: null },
				select: tagSelect,
				orderBy: { createdAt: "desc" },
			});
			return ok(tags);
		} catch {
			return err(
				new DomainError("TAG_FETCH_ERROR", "タグ情報の取得に失敗しました", 500),
			);
		}
	}

	async findByIdAndUserId(
		id: string,
		userId: string,
	): Promise<Result<TagDto | null>> {
		try {
			const tag = await this.prisma.tags.findFirst({
				where: { id, userId, deletedAt: null },
				select: tagSelect,
			});
			return ok(tag);
		} catch {
			return err(
				new DomainError("TAG_FETCH_ERROR", "タグ情報の取得に失敗しました", 500),
			);
		}
	}

	async create(input: CreateTagInput): Promise<Result<TagDto>> {
		try {
			const existing = await this.prisma.tags.findFirst({
				where: { userId: input.userId, name: input.name, deletedAt: null },
			});
			if (existing) {
				return err(new ConflictError(`タグ "${input.name}" は既に存在します`));
			}
			const tag = await this.prisma.tags.create({
				data: {
					name: input.name,
					userId: input.userId,
					createdBy: input.userId,
					updatedBy: input.userId,
				},
				select: tagSelect,
			});
			return ok(tag);
		} catch (e) {
			if (e instanceof DomainError) return err(e);
			return err(
				new DomainError("TAG_CREATE_ERROR", "タグの作成に失敗しました", 500),
			);
		}
	}

	async update(
		id: string,
		userId: string,
		input: UpdateTagInput,
	): Promise<Result<TagDto>> {
		try {
			const existing = await this.prisma.tags.findFirst({
				where: { id, userId, deletedAt: null },
			});
			if (!existing) {
				return err(new NotFoundError("タグが見つかりません"));
			}
			if (input.name !== undefined && input.name !== existing.name) {
				const nameConflict = await this.prisma.tags.findFirst({
					where: { userId, name: input.name, deletedAt: null },
				});
				if (nameConflict) {
					return err(
						new ConflictError(`タグ "${input.name}" は既に存在します`),
					);
				}
			}
			const tag = await this.prisma.tags.update({
				where: { id },
				data: {
					...(input.name !== undefined && { name: input.name }),
					updatedBy: input.updatedBy,
					updatedAt: new Date(),
				},
				select: tagSelect,
			});
			return ok(tag);
		} catch (e) {
			if (e instanceof DomainError) return err(e);
			return err(
				new DomainError("TAG_UPDATE_ERROR", "タグの更新に失敗しました", 500),
			);
		}
	}

	async softDelete(
		id: string,
		userId: string,
		deletedBy: string,
	): Promise<Result<void>> {
		try {
			const existing = await this.prisma.tags.findFirst({
				where: { id, userId, deletedAt: null },
			});
			if (!existing) {
				return err(new NotFoundError("タグが見つかりません"));
			}
			await this.prisma.tags.update({
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
				new DomainError("TAG_DELETE_ERROR", "タグの削除に失敗しました", 500),
			);
		}
	}
}
