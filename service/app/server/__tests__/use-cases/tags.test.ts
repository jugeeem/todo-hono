import { describe, expect, test } from "bun:test";
import {
	ConflictError,
	DomainError,
	NotFoundError,
} from "@/server/domain/errors/domain-error";
import type {
	TagDto,
	TagRepository,
} from "@/server/domain/repositories/tag-repository";
import { CreateTagUseCase } from "@/server/use-cases/tags/create-tag-use-case";
import { DeleteTagUseCase } from "@/server/use-cases/tags/delete-tag-use-case";
import { GetTagByIdUseCase } from "@/server/use-cases/tags/get-tag-by-id-use-case";
import { GetTagsUseCase } from "@/server/use-cases/tags/get-tags-use-case";
import { UpdateTagUseCase } from "@/server/use-cases/tags/update-tag-use-case";
import { err, ok } from "@/server/use-cases/types";

const sampleTag: TagDto = {
	id: "tag-1",
	name: "重要",
	userId: "user-1",
	createdAt: new Date("2025-01-01"),
	updatedAt: new Date("2025-01-01"),
};

function createMockTagRepository(
	overrides?: Partial<TagRepository>,
): TagRepository {
	return {
		findAllByUserId: async () => ok([sampleTag]),
		findByIdAndUserId: async () => ok(sampleTag),
		create: async () => ok(sampleTag),
		update: async () => ok(sampleTag),
		softDelete: async () => ok(undefined),
		...overrides,
	};
}

describe("use-cases/tags", () => {
	describe("GetTagsUseCase", () => {
		test("should return tags for user when repository succeeds", async () => {
			const repo = createMockTagRepository();
			const result = await new GetTagsUseCase(repo).execute("user-1");

			expect(result.ok).toBe(true);
			if (result.ok) expect(result.value).toHaveLength(1);
		});

		test("should return error when repository fails", async () => {
			const repo = createMockTagRepository({
				findAllByUserId: async () =>
					err(new DomainError("TAG_FETCH_ERROR", "取得失敗", 500)),
			});
			const result = await new GetTagsUseCase(repo).execute("user-1");

			expect(result.ok).toBe(false);
		});
	});

	describe("GetTagByIdUseCase", () => {
		test("should return tag when found", async () => {
			const repo = createMockTagRepository();
			const result = await new GetTagByIdUseCase(repo).execute(
				"tag-1",
				"user-1",
			);

			expect(result.ok).toBe(true);
			if (result.ok) expect(result.value.name).toBe("重要");
		});

		test("should return NotFoundError when tag is null", async () => {
			const repo = createMockTagRepository({
				findByIdAndUserId: async () => ok(null),
			});
			const result = await new GetTagByIdUseCase(repo).execute(
				"not-found",
				"user-1",
			);

			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error).toBeInstanceOf(NotFoundError);
		});

		test("should return error when repository fails", async () => {
			const repo = createMockTagRepository({
				findByIdAndUserId: async () =>
					err(new DomainError("TAG_FETCH_ERROR", "取得失敗", 500)),
			});
			const result = await new GetTagByIdUseCase(repo).execute(
				"tag-1",
				"user-1",
			);

			expect(result.ok).toBe(false);
		});
	});

	describe("CreateTagUseCase", () => {
		test("should create tag when valid input is provided", async () => {
			const repo = createMockTagRepository();
			const result = await new CreateTagUseCase(repo).execute({
				name: "重要",
				userId: "user-1",
			});

			expect(result.ok).toBe(true);
		});

		test("should return ConflictError when name already exists", async () => {
			const repo = createMockTagRepository({
				create: async () =>
					err(new ConflictError('タグ "重要" は既に存在します')),
			});
			const result = await new CreateTagUseCase(repo).execute({
				name: "重要",
				userId: "user-1",
			});

			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error).toBeInstanceOf(ConflictError);
		});

		test("should return error when repository fails", async () => {
			const repo = createMockTagRepository({
				create: async () =>
					err(new DomainError("TAG_CREATE_ERROR", "作成失敗", 500)),
			});
			const result = await new CreateTagUseCase(repo).execute({
				name: "新規",
				userId: "user-1",
			});

			expect(result.ok).toBe(false);
		});
	});

	describe("UpdateTagUseCase", () => {
		test("should update tag when valid input is provided", async () => {
			const repo = createMockTagRepository();
			const result = await new UpdateTagUseCase(repo).execute({
				id: "tag-1",
				userId: "user-1",
				name: "緊急",
			});

			expect(result.ok).toBe(true);
		});

		test("should pass updatedBy as userId to repository", async () => {
			let capturedInput: Record<string, unknown> = {};
			const repo = createMockTagRepository({
				update: async (_id, _userId, input) => {
					capturedInput = input;
					return ok(sampleTag);
				},
			});
			await new UpdateTagUseCase(repo).execute({
				id: "tag-1",
				userId: "user-1",
				name: "更新",
			});

			expect(capturedInput.updatedBy).toBe("user-1");
		});

		test("should return error when repository fails", async () => {
			const repo = createMockTagRepository({
				update: async () => err(new NotFoundError("タグが見つかりません")),
			});
			const result = await new UpdateTagUseCase(repo).execute({
				id: "not-found",
				userId: "user-1",
				name: "更新",
			});

			expect(result.ok).toBe(false);
		});
	});

	describe("DeleteTagUseCase", () => {
		test("should delete tag when valid id is provided", async () => {
			const repo = createMockTagRepository();
			const result = await new DeleteTagUseCase(repo).execute(
				"tag-1",
				"user-1",
			);

			expect(result.ok).toBe(true);
		});

		test("should return error when repository fails", async () => {
			const repo = createMockTagRepository({
				softDelete: async () => err(new NotFoundError("タグが見つかりません")),
			});
			const result = await new DeleteTagUseCase(repo).execute(
				"not-found",
				"user-1",
			);

			expect(result.ok).toBe(false);
		});
	});
});
