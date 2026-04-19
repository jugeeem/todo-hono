import { describe, expect, test } from "bun:test";
import {
	DomainError,
	NotFoundError,
} from "@/server/domain/errors/domain-error";
import type {
	TodoDto,
	TodoRepository,
} from "@/server/domain/repositories/todo-repository";
import { CreateTodoUseCase } from "@/server/use-cases/todos/create-todo-use-case";
import { DeleteTodoUseCase } from "@/server/use-cases/todos/delete-todo-use-case";
import { GetTodoByIdUseCase } from "@/server/use-cases/todos/get-todo-by-id-use-case";
import { GetTodosUseCase } from "@/server/use-cases/todos/get-todos-use-case";
import { UpdateTodoUseCase } from "@/server/use-cases/todos/update-todo-use-case";
import { err, ok } from "@/server/use-cases/types";

const sampleTodo: TodoDto = {
	id: "todo-1",
	title: "テスト",
	description: null,
	status: "pending",
	priority: 2,
	dueDate: null,
	completedAt: null,
	userId: "user-1",
	categoryId: null,
	parentTodoId: null,
	category: null,
	tags: [],
	comments: [],
	createdAt: new Date("2025-01-01"),
	updatedAt: new Date("2025-01-01"),
};

function createMockTodoRepository(
	overrides?: Partial<TodoRepository>,
): TodoRepository {
	return {
		findAllByUserId: async () => ok([sampleTodo]),
		findByIdAndUserId: async () => ok(sampleTodo),
		create: async () => ok(sampleTodo),
		update: async () => ok(sampleTodo),
		softDelete: async () => ok(undefined),
		...overrides,
	};
}

describe("use-cases/todos", () => {
	describe("GetTodosUseCase", () => {
		test("should return todos for user when repository succeeds", async () => {
			const repo = createMockTodoRepository();
			const result = await new GetTodosUseCase(repo).execute("user-1");

			expect(result.ok).toBe(true);
			if (result.ok) expect(result.value).toHaveLength(1);
		});

		test("should return error when repository fails", async () => {
			const repo = createMockTodoRepository({
				findAllByUserId: async () =>
					err(new DomainError("TODO_FETCH_ERROR", "取得失敗", 500)),
			});
			const result = await new GetTodosUseCase(repo).execute("user-1");

			expect(result.ok).toBe(false);
		});
	});

	describe("GetTodoByIdUseCase", () => {
		test("should return todo when found", async () => {
			const repo = createMockTodoRepository();
			const result = await new GetTodoByIdUseCase(repo).execute(
				"todo-1",
				"user-1",
			);

			expect(result.ok).toBe(true);
			if (result.ok) expect(result.value.title).toBe("テスト");
		});

		test("should return NotFoundError when todo is null", async () => {
			const repo = createMockTodoRepository({
				findByIdAndUserId: async () => ok(null),
			});
			const result = await new GetTodoByIdUseCase(repo).execute(
				"not-found",
				"user-1",
			);

			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error).toBeInstanceOf(NotFoundError);
		});

		test("should return error when repository fails", async () => {
			const repo = createMockTodoRepository({
				findByIdAndUserId: async () =>
					err(new DomainError("TODO_FETCH_ERROR", "取得失敗", 500)),
			});
			const result = await new GetTodoByIdUseCase(repo).execute(
				"todo-1",
				"user-1",
			);

			expect(result.ok).toBe(false);
		});
	});

	describe("CreateTodoUseCase", () => {
		test("should create todo when valid input is provided", async () => {
			const repo = createMockTodoRepository();
			const result = await new CreateTodoUseCase(repo).execute({
				title: "新規 Todo",
				status: "pending",
				priority: 2,
				userId: "user-1",
			});

			expect(result.ok).toBe(true);
		});

		test("should create todo with tagIds and comments when provided", async () => {
			let capturedInput: Record<string, unknown> = {};
			const repo = createMockTodoRepository({
				create: async (input) => {
					capturedInput = { ...input };
					return ok(sampleTodo);
				},
			});
			await new CreateTodoUseCase(repo).execute({
				title: "タグ付き Todo",
				status: "pending",
				priority: 2,
				userId: "user-1",
				tagIds: ["tag-1", "tag-2"],
				comments: ["初期コメント"],
			});

			expect(capturedInput.tagIds).toEqual(["tag-1", "tag-2"]);
			expect(capturedInput.comments).toEqual(["初期コメント"]);
		});

		test("should return error when repository fails", async () => {
			const repo = createMockTodoRepository({
				create: async () =>
					err(new DomainError("TODO_CREATE_ERROR", "作成失敗", 500)),
			});
			const result = await new CreateTodoUseCase(repo).execute({
				title: "新規",
				status: "pending",
				priority: 2,
				userId: "user-1",
			});

			expect(result.ok).toBe(false);
		});
	});

	describe("UpdateTodoUseCase", () => {
		test("should update todo when valid input is provided", async () => {
			const repo = createMockTodoRepository();
			const result = await new UpdateTodoUseCase(repo).execute({
				id: "todo-1",
				userId: "user-1",
				status: "done",
			});

			expect(result.ok).toBe(true);
		});

		test("should update todo with tagIds and comments when provided", async () => {
			let capturedInput: Record<string, unknown> = {};
			const repo = createMockTodoRepository({
				update: async (_id, _userId, input) => {
					capturedInput = { ...input };
					return ok(sampleTodo);
				},
			});
			await new UpdateTodoUseCase(repo).execute({
				id: "todo-1",
				userId: "user-1",
				tagIds: ["tag-1"],
				comments: ["追加コメント"],
			});

			expect(capturedInput.tagIds).toEqual(["tag-1"]);
			expect(capturedInput.comments).toEqual(["追加コメント"]);
		});

		test("should pass updatedBy as userId to repository", async () => {
			let capturedInput: Record<string, unknown> = {};
			const repo = createMockTodoRepository({
				update: async (_id, _userId, input) => {
					capturedInput = input;
					return ok(sampleTodo);
				},
			});
			await new UpdateTodoUseCase(repo).execute({
				id: "todo-1",
				userId: "user-1",
				title: "更新",
			});

			expect(capturedInput.updatedBy).toBe("user-1");
		});

		test("should return error when repository fails", async () => {
			const repo = createMockTodoRepository({
				update: async () => err(new NotFoundError("Todo が見つかりません")),
			});
			const result = await new UpdateTodoUseCase(repo).execute({
				id: "not-found",
				userId: "user-1",
				status: "done",
			});

			expect(result.ok).toBe(false);
		});
	});

	describe("DeleteTodoUseCase", () => {
		test("should delete todo when valid id is provided", async () => {
			const repo = createMockTodoRepository();
			const result = await new DeleteTodoUseCase(repo).execute(
				"todo-1",
				"user-1",
			);

			expect(result.ok).toBe(true);
		});

		test("should return error when repository fails", async () => {
			const repo = createMockTodoRepository({
				softDelete: async () => err(new NotFoundError("Todo が見つかりません")),
			});
			const result = await new DeleteTodoUseCase(repo).execute(
				"not-found",
				"user-1",
			);

			expect(result.ok).toBe(false);
		});
	});
});
