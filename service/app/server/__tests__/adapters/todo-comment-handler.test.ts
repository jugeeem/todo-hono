import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { createTodoCommentHandlers } from "@/server/adapters/handlers/todo-comment-handler";
import { errorHandler } from "@/server/adapters/middleware/error-handler";
import type { AuthContext } from "@/server/domain/entities/auth";
import {
	DomainError,
	NotFoundError,
} from "@/server/domain/errors/domain-error";
import type {
	TodoCommentDto,
	TodoCommentRepository,
} from "@/server/domain/repositories/todo-comment-repository";
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

const mockComment: TodoCommentDto = {
	id: "comment-1",
	content: "テストコメント",
	todoId: "todo-1",
	userId: "user-1",
	createdAt: now,
	updatedAt: now,
};

function createMockRepository(
	overrides?: Partial<TodoCommentRepository>,
): TodoCommentRepository {
	return {
		findAllByTodoId: async () => ok([mockComment]),
		findById: async () => ok(mockComment),
		create: async (input) =>
			ok({ ...mockComment, id: "comment-new", content: input.content }),
		update: async (_id, _userId, input) =>
			ok({ ...mockComment, content: input.content ?? mockComment.content }),
		softDelete: async () => ok(undefined),
		...overrides,
	};
}

function createTestApp(repo: TodoCommentRepository) {
	const app = new Hono<AppEnv>();
	app.onError(errorHandler);
	app.use("/*", async (c, next) => {
		c.set("auth", mockAuth);
		await next();
	});
	const handlers = createTodoCommentHandlers(repo);
	app.get("/todos/:todoId/comments", handlers.getTodoComments);
	app.get("/todos/:todoId/comments/:id", handlers.getTodoCommentById);
	app.post("/todos/:todoId/comments", handlers.createTodoComment);
	app.patch("/todos/:todoId/comments/:id", handlers.updateTodoComment);
	app.delete("/todos/:todoId/comments/:id", handlers.deleteTodoComment);
	return app;
}

describe("adapters/handlers/todo-comment-handler", () => {
	describe("getTodoComments", () => {
		test("should return comments for the todo", async () => {
			const app = createTestApp(createMockRepository());

			const res = await app.request("/todos/todo-1/comments");
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body.data).toHaveLength(1);
			expect(body.data[0].content).toBe("テストコメント");
		});

		test("should return 500 when repository fails", async () => {
			const app = createTestApp(
				createMockRepository({
					findAllByTodoId: async () =>
						err(new DomainError("INTERNAL_ERROR", "DB error", 500)),
				}),
			);

			const res = await app.request("/todos/todo-1/comments");
			const body = await res.json();

			expect(res.status).toBe(500);
			expect(body.error.code).toBe("INTERNAL_ERROR");
		});
	});

	describe("getTodoCommentById", () => {
		test("should return comment when found", async () => {
			const app = createTestApp(createMockRepository());

			const res = await app.request("/todos/todo-1/comments/comment-1");
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body.data.content).toBe("テストコメント");
		});

		test("should return 404 when comment not found", async () => {
			const app = createTestApp(
				createMockRepository({
					findById: async () => ok(null),
				}),
			);

			const res = await app.request("/todos/todo-1/comments/nonexistent");
			const body = await res.json();

			expect(res.status).toBe(404);
			expect(body.error.code).toBe("NOT_FOUND");
		});
	});

	describe("createTodoComment", () => {
		test("should return 201 when comment is created", async () => {
			const app = createTestApp(createMockRepository());

			const res = await app.request("/todos/todo-1/comments", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content: "新しいコメント" }),
			});
			const body = await res.json();

			expect(res.status).toBe(201);
			expect(body.data.content).toBe("新しいコメント");
		});

		test("should return 422 when validation fails", async () => {
			const app = createTestApp(createMockRepository());

			const res = await app.request("/todos/todo-1/comments", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content: "" }),
			});
			const body = await res.json();

			expect(res.status).toBe(422);
			expect(body.error.code).toBe("VALIDATION_ERROR");
		});
	});

	describe("updateTodoComment", () => {
		test("should return updated comment when successful", async () => {
			const app = createTestApp(createMockRepository());

			const res = await app.request("/todos/todo-1/comments/comment-1", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content: "更新されたコメント" }),
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body.data.content).toBe("更新されたコメント");
		});

		test("should return 404 when comment not found", async () => {
			const app = createTestApp(
				createMockRepository({
					update: async () =>
						err(new NotFoundError("コメントが見つかりません")),
				}),
			);

			const res = await app.request("/todos/todo-1/comments/nonexistent", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content: "更新" }),
			});
			const body = await res.json();

			expect(res.status).toBe(404);
			expect(body.error.code).toBe("NOT_FOUND");
		});

		test("should return 422 when validation fails", async () => {
			const app = createTestApp(createMockRepository());

			const res = await app.request("/todos/todo-1/comments/comment-1", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content: "" }),
			});
			const body = await res.json();

			expect(res.status).toBe(422);
			expect(body.error.code).toBe("VALIDATION_ERROR");
		});
	});

	describe("deleteTodoComment", () => {
		test("should return 204 when comment is deleted", async () => {
			const app = createTestApp(createMockRepository());

			const res = await app.request("/todos/todo-1/comments/comment-1", {
				method: "DELETE",
			});

			expect(res.status).toBe(204);
		});

		test("should return 404 when comment not found", async () => {
			const app = createTestApp(
				createMockRepository({
					softDelete: async () =>
						err(new NotFoundError("コメントが見つかりません")),
				}),
			);

			const res = await app.request("/todos/todo-1/comments/nonexistent", {
				method: "DELETE",
			});
			const body = await res.json();

			expect(res.status).toBe(404);
			expect(body.error.code).toBe("NOT_FOUND");
		});
	});
});
