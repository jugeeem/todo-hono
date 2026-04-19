import { describe, expect, test } from "bun:test";
import {
	ConflictError,
	DomainError,
	NotFoundError,
} from "@/server/domain/errors/domain-error";
import type {
	CategoryDto,
	CategoryRepository,
} from "@/server/domain/repositories/category-repository";
import { CreateCategoryUseCase } from "@/server/use-cases/categories/create-category-use-case";
import { DeleteCategoryUseCase } from "@/server/use-cases/categories/delete-category-use-case";
import { GetCategoriesUseCase } from "@/server/use-cases/categories/get-categories-use-case";
import { GetCategoryByIdUseCase } from "@/server/use-cases/categories/get-category-by-id-use-case";
import { UpdateCategoryUseCase } from "@/server/use-cases/categories/update-category-use-case";
import { err, ok } from "@/server/use-cases/types";

const sampleCategory: CategoryDto = {
	id: "cat-1",
	name: "仕事",
	description: "仕事関連",
	userId: "user-1",
	createdAt: new Date("2025-01-01"),
	updatedAt: new Date("2025-01-01"),
};

function createMockCategoryRepository(
	overrides?: Partial<CategoryRepository>,
): CategoryRepository {
	return {
		findAllByUserId: async () => ok([sampleCategory]),
		findByIdAndUserId: async () => ok(sampleCategory),
		create: async () => ok(sampleCategory),
		update: async () => ok(sampleCategory),
		softDelete: async () => ok(undefined),
		...overrides,
	};
}

describe("use-cases/categories", () => {
	describe("GetCategoriesUseCase", () => {
		test("should return categories for user when repository succeeds", async () => {
			const repo = createMockCategoryRepository();
			const result = await new GetCategoriesUseCase(repo).execute("user-1");

			expect(result.ok).toBe(true);
			if (result.ok) expect(result.value).toHaveLength(1);
		});

		test("should return error when repository fails", async () => {
			const repo = createMockCategoryRepository({
				findAllByUserId: async () =>
					err(new DomainError("CATEGORY_FETCH_ERROR", "取得失敗", 500)),
			});
			const result = await new GetCategoriesUseCase(repo).execute("user-1");

			expect(result.ok).toBe(false);
		});
	});

	describe("GetCategoryByIdUseCase", () => {
		test("should return category when found", async () => {
			const repo = createMockCategoryRepository();
			const result = await new GetCategoryByIdUseCase(repo).execute(
				"cat-1",
				"user-1",
			);

			expect(result.ok).toBe(true);
			if (result.ok) expect(result.value.name).toBe("仕事");
		});

		test("should return NotFoundError when category is null", async () => {
			const repo = createMockCategoryRepository({
				findByIdAndUserId: async () => ok(null),
			});
			const result = await new GetCategoryByIdUseCase(repo).execute(
				"not-found",
				"user-1",
			);

			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error).toBeInstanceOf(NotFoundError);
		});

		test("should return error when repository fails", async () => {
			const repo = createMockCategoryRepository({
				findByIdAndUserId: async () =>
					err(new DomainError("CATEGORY_FETCH_ERROR", "取得失敗", 500)),
			});
			const result = await new GetCategoryByIdUseCase(repo).execute(
				"cat-1",
				"user-1",
			);

			expect(result.ok).toBe(false);
		});
	});

	describe("CreateCategoryUseCase", () => {
		test("should create category when valid input is provided", async () => {
			const repo = createMockCategoryRepository();
			const result = await new CreateCategoryUseCase(repo).execute({
				name: "仕事",
				userId: "user-1",
			});

			expect(result.ok).toBe(true);
		});

		test("should return ConflictError when name already exists", async () => {
			const repo = createMockCategoryRepository({
				create: async () =>
					err(new ConflictError('カテゴリ "仕事" は既に存在します')),
			});
			const result = await new CreateCategoryUseCase(repo).execute({
				name: "仕事",
				userId: "user-1",
			});

			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error).toBeInstanceOf(ConflictError);
		});

		test("should return error when repository fails", async () => {
			const repo = createMockCategoryRepository({
				create: async () =>
					err(new DomainError("CATEGORY_CREATE_ERROR", "作成失敗", 500)),
			});
			const result = await new CreateCategoryUseCase(repo).execute({
				name: "新規",
				userId: "user-1",
			});

			expect(result.ok).toBe(false);
		});
	});

	describe("UpdateCategoryUseCase", () => {
		test("should update category when valid input is provided", async () => {
			const repo = createMockCategoryRepository();
			const result = await new UpdateCategoryUseCase(repo).execute({
				id: "cat-1",
				userId: "user-1",
				name: "プライベート",
			});

			expect(result.ok).toBe(true);
		});

		test("should pass updatedBy as userId to repository", async () => {
			let capturedInput: Record<string, unknown> = {};
			const repo = createMockCategoryRepository({
				update: async (_id, _userId, input) => {
					capturedInput = input;
					return ok(sampleCategory);
				},
			});
			await new UpdateCategoryUseCase(repo).execute({
				id: "cat-1",
				userId: "user-1",
				name: "更新",
			});

			expect(capturedInput.updatedBy).toBe("user-1");
		});

		test("should return error when repository fails", async () => {
			const repo = createMockCategoryRepository({
				update: async () => err(new NotFoundError("カテゴリが見つかりません")),
			});
			const result = await new UpdateCategoryUseCase(repo).execute({
				id: "not-found",
				userId: "user-1",
				name: "更新",
			});

			expect(result.ok).toBe(false);
		});
	});

	describe("DeleteCategoryUseCase", () => {
		test("should delete category when valid id is provided", async () => {
			const repo = createMockCategoryRepository();
			const result = await new DeleteCategoryUseCase(repo).execute(
				"cat-1",
				"user-1",
			);

			expect(result.ok).toBe(true);
		});

		test("should return error when repository fails", async () => {
			const repo = createMockCategoryRepository({
				softDelete: async () =>
					err(new NotFoundError("カテゴリが見つかりません")),
			});
			const result = await new DeleteCategoryUseCase(repo).execute(
				"not-found",
				"user-1",
			);

			expect(result.ok).toBe(false);
		});
	});
});
