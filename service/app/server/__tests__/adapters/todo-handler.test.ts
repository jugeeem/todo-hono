import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { createTodoHandlers } from "@/server/adapters/handlers/todo-handler";
import { errorHandler } from "@/server/adapters/middleware/error-handler";
import type { AuthContext } from "@/server/domain/entities/auth";
import {
	DomainError,
	NotFoundError,
} from "@/server/domain/errors/domain-error";
import type {
	TodoDto,
	TodoRepository,
} from "@/server/domain/repositories/todo-repository";
import type { AppEnv } from "@/server/types";
import { err, ok } from "@/server/use-cases/types";

const mockAuth: AuthContext = {
	user: {
		identityId: "user-1",
		email: "test@example.com",
		username: "testuser",
		sessionId: "session-1",
	},
	permissions: [],
};

const now = new Date();

const mockTodo: TodoDto = {
	id: "todo-1",
	title: "Test Todo",
	description: "A test todo",
	status: "pending",
	priority: 3,
	dueDate: null,
	completedAt: null,
	userId: "user-1",
	categoryId: null,
	parentTodoId: null,
	category: null,
	tags: [],
	comments: [],
	createdAt: now,
	updatedAt: now,
};

function createMockTodoRepository(
	overrides?: Partial<TodoRepository>,
): TodoRepository {
	return {
		findAllByUserId: async () => ok([mockTodo]),
		findByIdAndUserId: async () => ok(mockTodo),
		create: async (input) =>
			ok({ ...mockTodo, id: "todo-new", title: input.title }),
		update: async (_id, _userId, input) =>
			ok({ ...mockTodo, title: input.title ?? mockTodo.title }),
		softDelete: async () => ok(undefined),
		...overrides,
	};
}

function createTestApp(repo: TodoRepository) {
	const app = new Hono<AppEnv>();
	app.onError(errorHandler);
	app.use("/*", async (c, next) => {
		c.set("auth", mockAuth);
		await next();
	});
	const handlers = createTodoHandlers(repo);
	app.get("/todos", handlers.getTodos);
	app.get("/todos/:id", handlers.getTodoById);
	app.post("/todos", handlers.createTodo);
	app.patch("/todos/:id", handlers.updateTodo);
	app.delete("/todos/:id", handlers.deleteTodo);
	return app;
}

describe("adapters/handlers/todo-handler", () => {
	describe("getTodos", () => {
		test("should return todos for current user when successful", async () => {
			const app = createTestApp(createMockTodoRepository());

			const res = await app.request("/todos");
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body.data).toHaveLength(1);
			expect(body.data[0].title).toBe("Test Todo");
		});

		test("should return 500 when repository fails", async () => {
			const app = createTestApp(
				createMockTodoRepository({
					findAllByUserId: async () =>
						err(new DomainError("INTERNAL_ERROR", "DB error", 500)),
				}),
			);

			const res = await app.request("/todos");
			const body = await res.json();

			expect(res.status).toBe(500);
			expect(body.error.code).toBe("INTERNAL_ERROR");
		});
	});

	describe("getTodoById", () => {
		test("should return todo when found", async () => {
			const app = createTestApp(createMockTodoRepository());

			const res = await app.request("/todos/todo-1");
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body.data.title).toBe("Test Todo");
		});

		test("should return 404 when todo not found", async () => {
			const app = createTestApp(
				createMockTodoRepository({
					findByIdAndUserId: async () => ok(null),
				}),
			);

			const res = await app.request("/todos/nonexistent");
			const body = await res.json();

			expect(res.status).toBe(404);
			expect(body.error.code).toBe("NOT_FOUND");
		});
	});

	describe("createTodo", () => {
		test("should return 201 when todo is created", async () => {
			const app = createTestApp(createMockTodoRepository());

			const res = await app.request("/todos", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title: "New Todo" }),
			});
			const body = await res.json();

			expect(res.status).toBe(201);
			expect(body.data.title).toBe("New Todo");
		});

		test("should return 422 when validation fails", async () => {
			const app = createTestApp(createMockTodoRepository());

			const res = await app.request("/todos", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title: "" }),
			});
			const body = await res.json();

			expect(res.status).toBe(422);
			expect(body.error.code).toBe("VALIDATION_ERROR");
		});

		test("should pass dueDate as Date when provided", async () => {
			let capturedInput: Record<string, unknown> = {};
			const app = createTestApp(
				createMockTodoRepository({
					create: async (input) => {
						capturedInput = { ...input };
						return ok({ ...mockTodo, id: "todo-new", title: input.title });
					},
				}),
			);

			await app.request("/todos", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: "Todo with date",
					dueDate: "2025-12-31T23:59:59.000Z",
				}),
			});

			expect(capturedInput.dueDate).toBeInstanceOf(Date);
		});

		test("should pass tagIds and comments to repository when provided", async () => {
			let capturedInput: Record<string, unknown> = {};
			const app = createTestApp(
				createMockTodoRepository({
					create: async (input) => {
						capturedInput = { ...input };
						return ok({ ...mockTodo, id: "todo-new", title: input.title });
					},
				}),
			);

			await app.request("/todos", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: "タグ付き Todo",
					tagIds: ["550e8400-e29b-41d4-a716-446655440001"],
					comments: ["最初のコメント"],
				}),
			});

			expect(capturedInput.tagIds).toEqual([
				"550e8400-e29b-41d4-a716-446655440001",
			]);
			expect(capturedInput.comments).toEqual(["最初のコメント"]);
		});
	});

	describe("updateTodo", () => {
		test("should return updated todo when successful", async () => {
			const app = createTestApp(createMockTodoRepository());

			const res = await app.request("/todos/todo-1", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title: "Updated Title" }),
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body.data.title).toBe("Updated Title");
		});

		test("should return 404 when todo not found", async () => {
			const app = createTestApp(
				createMockTodoRepository({
					update: async () => err(new NotFoundError("Todoが見つかりません")),
				}),
			);

			const res = await app.request("/todos/nonexistent", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title: "Updated" }),
			});
			const body = await res.json();

			expect(res.status).toBe(404);
			expect(body.error.code).toBe("NOT_FOUND");
		});

		test("should return 422 when validation fails", async () => {
			const app = createTestApp(createMockTodoRepository());

			const res = await app.request("/todos/todo-1", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ priority: 0 }),
			});
			const body = await res.json();

			expect(res.status).toBe(422);
			expect(body.error.code).toBe("VALIDATION_ERROR");
		});

		test("should pass tagIds and comments to repository on update", async () => {
			let capturedInput: Record<string, unknown> = {};
			const app = createTestApp(
				createMockTodoRepository({
					update: async (_id, _userId, input) => {
						capturedInput = { ...input };
						return ok(mockTodo);
					},
				}),
			);

			await app.request("/todos/todo-1", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					tagIds: ["550e8400-e29b-41d4-a716-446655440001"],
					comments: ["追加コメント"],
				}),
			});

			expect(capturedInput.tagIds).toEqual([
				"550e8400-e29b-41d4-a716-446655440001",
			]);
			expect(capturedInput.comments).toEqual(["追加コメント"]);
		});
	});

	describe("deleteTodo", () => {
		test("should return 204 when todo is deleted", async () => {
			const app = createTestApp(createMockTodoRepository());

			const res = await app.request("/todos/todo-1", { method: "DELETE" });

			expect(res.status).toBe(204);
		});

		test("should return 500 when delete fails", async () => {
			const app = createTestApp(
				createMockTodoRepository({
					softDelete: async () =>
						err(new DomainError("INTERNAL_ERROR", "DB error", 500)),
				}),
			);

			const res = await app.request("/todos/todo-1", { method: "DELETE" });
			const body = await res.json();

			expect(res.status).toBe(500);
			expect(body.error.code).toBe("INTERNAL_ERROR");
		});
	});
});
