import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { createTagHandlers } from "@/server/adapters/handlers/tag-handler";
import { errorHandler } from "@/server/adapters/middleware/error-handler";
import type { AuthContext } from "@/server/domain/entities/auth";
import {
	ConflictError,
	DomainError,
	NotFoundError,
} from "@/server/domain/errors/domain-error";
import type {
	TagDto,
	TagRepository,
} from "@/server/domain/repositories/tag-repository";
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

const mockTag: TagDto = {
	id: "tag-1",
	name: "重要",
	userId: "user-1",
	createdAt: now,
	updatedAt: now,
};

function createMockTagRepository(
	overrides?: Partial<TagRepository>,
): TagRepository {
	return {
		findAllByUserId: async () => ok([mockTag]),
		findByIdAndUserId: async () => ok(mockTag),
		create: async (input) =>
			ok({ ...mockTag, id: "tag-new", name: input.name }),
		update: async (_id, _userId, input) =>
			ok({ ...mockTag, name: input.name ?? mockTag.name }),
		softDelete: async () => ok(undefined),
		...overrides,
	};
}

function createTestApp(repo: TagRepository) {
	const app = new Hono<AppEnv>();
	app.onError(errorHandler);
	app.use("/*", async (c, next) => {
		c.set("auth", mockAuth);
		await next();
	});
	const handlers = createTagHandlers(repo);
	app.get("/tags", handlers.getTags);
	app.get("/tags/:id", handlers.getTagById);
	app.post("/tags", handlers.createTag);
	app.patch("/tags/:id", handlers.updateTag);
	app.delete("/tags/:id", handlers.deleteTag);
	return app;
}

describe("adapters/handlers/tag-handler", () => {
	describe("getTags", () => {
		test("should return tags for current user when successful", async () => {
			const app = createTestApp(createMockTagRepository());

			const res = await app.request("/tags");
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body.data).toHaveLength(1);
			expect(body.data[0].name).toBe("重要");
		});

		test("should return 500 when repository fails", async () => {
			const app = createTestApp(
				createMockTagRepository({
					findAllByUserId: async () =>
						err(new DomainError("INTERNAL_ERROR", "DB error", 500)),
				}),
			);

			const res = await app.request("/tags");
			const body = await res.json();

			expect(res.status).toBe(500);
			expect(body.error.code).toBe("INTERNAL_ERROR");
		});
	});

	describe("getTagById", () => {
		test("should return tag when found", async () => {
			const app = createTestApp(createMockTagRepository());

			const res = await app.request("/tags/tag-1");
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body.data.name).toBe("重要");
		});

		test("should return 404 when tag not found", async () => {
			const app = createTestApp(
				createMockTagRepository({
					findByIdAndUserId: async () => ok(null),
				}),
			);

			const res = await app.request("/tags/nonexistent");
			const body = await res.json();

			expect(res.status).toBe(404);
			expect(body.error.code).toBe("NOT_FOUND");
		});
	});

	describe("createTag", () => {
		test("should return 201 when tag is created", async () => {
			const app = createTestApp(createMockTagRepository());

			const res = await app.request("/tags", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: "新タグ" }),
			});
			const body = await res.json();

			expect(res.status).toBe(201);
			expect(body.data.name).toBe("新タグ");
		});

		test("should return 422 when validation fails", async () => {
			const app = createTestApp(createMockTagRepository());

			const res = await app.request("/tags", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: "" }),
			});
			const body = await res.json();

			expect(res.status).toBe(422);
			expect(body.error.code).toBe("VALIDATION_ERROR");
		});

		test("should return 409 when name already exists", async () => {
			const app = createTestApp(
				createMockTagRepository({
					create: async () =>
						err(new ConflictError('タグ "重要" は既に存在します')),
				}),
			);

			const res = await app.request("/tags", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: "重要" }),
			});
			const body = await res.json();

			expect(res.status).toBe(409);
			expect(body.error.code).toBe("CONFLICT");
		});
	});

	describe("updateTag", () => {
		test("should return updated tag when successful", async () => {
			const app = createTestApp(createMockTagRepository());

			const res = await app.request("/tags/tag-1", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: "緊急" }),
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body.data.name).toBe("緊急");
		});

		test("should return 404 when tag not found", async () => {
			const app = createTestApp(
				createMockTagRepository({
					update: async () => err(new NotFoundError("タグが見つかりません")),
				}),
			);

			const res = await app.request("/tags/nonexistent", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: "更新" }),
			});
			const body = await res.json();

			expect(res.status).toBe(404);
			expect(body.error.code).toBe("NOT_FOUND");
		});

		test("should return 422 when validation fails", async () => {
			const app = createTestApp(createMockTagRepository());

			const res = await app.request("/tags/tag-1", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: "" }),
			});
			const body = await res.json();

			expect(res.status).toBe(422);
			expect(body.error.code).toBe("VALIDATION_ERROR");
		});
	});

	describe("deleteTag", () => {
		test("should return 204 when tag is deleted", async () => {
			const app = createTestApp(createMockTagRepository());

			const res = await app.request("/tags/tag-1", { method: "DELETE" });

			expect(res.status).toBe(204);
		});

		test("should return 404 when tag not found", async () => {
			const app = createTestApp(
				createMockTagRepository({
					softDelete: async () =>
						err(new NotFoundError("タグが見つかりません")),
				}),
			);

			const res = await app.request("/tags/nonexistent", {
				method: "DELETE",
			});
			const body = await res.json();

			expect(res.status).toBe(404);
			expect(body.error.code).toBe("NOT_FOUND");
		});
	});
});
