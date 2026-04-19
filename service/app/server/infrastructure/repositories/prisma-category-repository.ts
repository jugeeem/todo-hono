import type { PrismaClient } from "@/prisma/generated/prisma/client";
import {
	ConflictError,
	DomainError,
	NotFoundError,
} from "@/server/domain/errors/domain-error";
import type {
	CategoryDto,
	CategoryRepository,
	CreateCategoryInput,
	UpdateCategoryInput,
} from "@/server/domain/repositories/category-repository";
import type { Result } from "@/server/use-cases/types";
import { err, ok } from "@/server/use-cases/types";

const categorySelect = {
	id: true,
	name: true,
	description: true,
	userId: true,
	createdAt: true,
	updatedAt: true,
} as const;

export class PrismaCategoryRepository implements CategoryRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async findAllByUserId(userId: string): Promise<Result<CategoryDto[]>> {
		try {
			const categories = await this.prisma.categories.findMany({
				where: { userId, deletedAt: null },
				select: categorySelect,
				orderBy: { createdAt: "desc" },
			});
			return ok(categories);
		} catch {
			return err(
				new DomainError(
					"CATEGORY_FETCH_ERROR",
					"カテゴリ情報の取得に失敗しました",
					500,
				),
			);
		}
	}

	async findByIdAndUserId(
		id: string,
		userId: string,
	): Promise<Result<CategoryDto | null>> {
		try {
			const category = await this.prisma.categories.findFirst({
				where: { id, userId, deletedAt: null },
				select: categorySelect,
			});
			return ok(category);
		} catch {
			return err(
				new DomainError(
					"CATEGORY_FETCH_ERROR",
					"カテゴリ情報の取得に失敗しました",
					500,
				),
			);
		}
	}

	async create(input: CreateCategoryInput): Promise<Result<CategoryDto>> {
		try {
			const existing = await this.prisma.categories.findFirst({
				where: { userId: input.userId, name: input.name, deletedAt: null },
			});
			if (existing) {
				return err(
					new ConflictError(`カテゴリ "${input.name}" は既に存在します`),
				);
			}
			const category = await this.prisma.categories.create({
				data: {
					name: input.name,
					description: input.description,
					userId: input.userId,
					createdBy: input.userId,
					updatedBy: input.userId,
				},
				select: categorySelect,
			});
			return ok(category);
		} catch (e) {
			if (e instanceof DomainError) return err(e);
			return err(
				new DomainError(
					"CATEGORY_CREATE_ERROR",
					"カテゴリの作成に失敗しました",
					500,
				),
			);
		}
	}

	async update(
		id: string,
		userId: string,
		input: UpdateCategoryInput,
	): Promise<Result<CategoryDto>> {
		try {
			const existing = await this.prisma.categories.findFirst({
				where: { id, userId, deletedAt: null },
			});
			if (!existing) {
				return err(new NotFoundError("カテゴリが見つかりません"));
			}
			if (input.name !== undefined && input.name !== existing.name) {
				const nameConflict = await this.prisma.categories.findFirst({
					where: { userId, name: input.name, deletedAt: null },
				});
				if (nameConflict) {
					return err(
						new ConflictError(`カテゴリ "${input.name}" は既に存在します`),
					);
				}
			}
			const category = await this.prisma.categories.update({
				where: { id },
				data: {
					...(input.name !== undefined && { name: input.name }),
					...(input.description !== undefined && {
						description: input.description,
					}),
					updatedBy: input.updatedBy,
					updatedAt: new Date(),
				},
				select: categorySelect,
			});
			return ok(category);
		} catch (e) {
			if (e instanceof DomainError) return err(e);
			return err(
				new DomainError(
					"CATEGORY_UPDATE_ERROR",
					"カテゴリの更新に失敗しました",
					500,
				),
			);
		}
	}

	async softDelete(
		id: string,
		userId: string,
		deletedBy: string,
	): Promise<Result<void>> {
		try {
			const existing = await this.prisma.categories.findFirst({
				where: { id, userId, deletedAt: null },
			});
			if (!existing) {
				return err(new NotFoundError("カテゴリが見つかりません"));
			}
			await this.prisma.categories.update({
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
				new DomainError(
					"CATEGORY_DELETE_ERROR",
					"カテゴリの削除に失敗しました",
					500,
				),
			);
		}
	}
}
