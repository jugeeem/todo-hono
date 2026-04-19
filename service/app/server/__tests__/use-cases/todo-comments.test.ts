import { describe, expect, test } from "bun:test";
import {
	DomainError,
	NotFoundError,
} from "@/server/domain/errors/domain-error";
import type {
	TodoCommentDto,
	TodoCommentRepository,
} from "@/server/domain/repositories/todo-comment-repository";
import { CreateTodoCommentUseCase } from "@/server/use-cases/todo-comments/create-todo-comment-use-case";
import { DeleteTodoCommentUseCase } from "@/server/use-cases/todo-comments/delete-todo-comment-use-case";
import { GetTodoCommentByIdUseCase } from "@/server/use-cases/todo-comments/get-todo-comment-by-id-use-case";
import { GetTodoCommentsUseCase } from "@/server/use-cases/todo-comments/get-todo-comments-use-case";
import { UpdateTodoCommentUseCase } from "@/server/use-cases/todo-comments/update-todo-comment-use-case";
import { err, ok } from "@/server/use-cases/types";

const sampleComment: TodoCommentDto = {
	id: "comment-1",
	content: "テストコメント",
	todoId: "todo-1",
	userId: "user-1",
	createdAt: new Date("2025-01-01"),
	updatedAt: new Date("2025-01-01"),
};

function createMockRepository(
	overrides?: Partial<TodoCommentRepository>,
): TodoCommentRepository {
	return {
		findAllByTodoId: async () => ok([sampleComment]),
		findById: async () => ok(sampleComment),
		create: async () => ok(sampleComment),
		update: async () => ok(sampleComment),
		softDelete: async () => ok(undefined),
		...overrides,
	};
}

describe("use-cases/todo-comments", () => {
	describe("GetTodoCommentsUseCase", () => {
		test("should return comments when repository succeeds", async () => {
			const repo = createMockRepository();
			const result = await new GetTodoCommentsUseCase(repo).execute(
				"todo-1",
				"user-1",
			);

			expect(result.ok).toBe(true);
			if (result.ok) expect(result.value).toHaveLength(1);
		});

		test("should return error when repository fails", async () => {
			const repo = createMockRepository({
				findAllByTodoId: async () =>
					err(new DomainError("TODO_COMMENT_FETCH_ERROR", "取得失敗", 500)),
			});
			const result = await new GetTodoCommentsUseCase(repo).execute(
				"todo-1",
				"user-1",
			);

			expect(result.ok).toBe(false);
		});
	});

	describe("GetTodoCommentByIdUseCase", () => {
		test("should return comment when found", async () => {
			const repo = createMockRepository();
			const result = await new GetTodoCommentByIdUseCase(repo).execute(
				"comment-1",
				"todo-1",
			);

			expect(result.ok).toBe(true);
			if (result.ok) expect(result.value.content).toBe("テストコメント");
		});

		test("should return NotFoundError when comment is null", async () => {
			const repo = createMockRepository({
				findById: async () => ok(null),
			});
			const result = await new GetTodoCommentByIdUseCase(repo).execute(
				"not-found",
				"todo-1",
			);

			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error).toBeInstanceOf(NotFoundError);
		});

		test("should return error when repository fails", async () => {
			const repo = createMockRepository({
				findById: async () =>
					err(new DomainError("TODO_COMMENT_FETCH_ERROR", "取得失敗", 500)),
			});
			const result = await new GetTodoCommentByIdUseCase(repo).execute(
				"comment-1",
				"todo-1",
			);

			expect(result.ok).toBe(false);
		});
	});

	describe("CreateTodoCommentUseCase", () => {
		test("should create comment when valid input is provided", async () => {
			const repo = createMockRepository();
			const result = await new CreateTodoCommentUseCase(repo).execute({
				content: "新しいコメント",
				todoId: "todo-1",
				userId: "user-1",
			});

			expect(result.ok).toBe(true);
		});

		test("should return error when repository fails", async () => {
			const repo = createMockRepository({
				create: async () =>
					err(new DomainError("TODO_COMMENT_CREATE_ERROR", "作成失敗", 500)),
			});
			const result = await new CreateTodoCommentUseCase(repo).execute({
				content: "新しいコメント",
				todoId: "todo-1",
				userId: "user-1",
			});

			expect(result.ok).toBe(false);
		});
	});

	describe("UpdateTodoCommentUseCase", () => {
		test("should update comment when valid input is provided", async () => {
			const repo = createMockRepository();
			const result = await new UpdateTodoCommentUseCase(repo).execute({
				id: "comment-1",
				userId: "user-1",
				content: "更新コメント",
			});

			expect(result.ok).toBe(true);
		});

		test("should pass updatedBy as userId to repository", async () => {
			let capturedInput: Record<string, unknown> = {};
			const repo = createMockRepository({
				update: async (_id, _userId, input) => {
					capturedInput = input;
					return ok(sampleComment);
				},
			});
			await new UpdateTodoCommentUseCase(repo).execute({
				id: "comment-1",
				userId: "user-1",
				content: "更新",
			});

			expect(capturedInput.updatedBy).toBe("user-1");
		});

		test("should return error when repository fails", async () => {
			const repo = createMockRepository({
				update: async () => err(new NotFoundError("コメントが見つかりません")),
			});
			const result = await new UpdateTodoCommentUseCase(repo).execute({
				id: "not-found",
				userId: "user-1",
				content: "更新",
			});

			expect(result.ok).toBe(false);
		});
	});

	describe("DeleteTodoCommentUseCase", () => {
		test("should delete comment when valid id is provided", async () => {
			const repo = createMockRepository();
			const result = await new DeleteTodoCommentUseCase(repo).execute(
				"comment-1",
				"user-1",
			);

			expect(result.ok).toBe(true);
		});

		test("should return error when repository fails", async () => {
			const repo = createMockRepository({
				softDelete: async () =>
					err(new NotFoundError("コメントが見つかりません")),
			});
			const result = await new DeleteTodoCommentUseCase(repo).execute(
				"not-found",
				"user-1",
			);

			expect(result.ok).toBe(false);
		});
	});
});
