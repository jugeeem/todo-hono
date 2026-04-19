import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { createCategoryHandlers } from "@/server/adapters/handlers/category-handler";
import { errorHandler } from "@/server/adapters/middleware/error-handler";
import type { AuthContext } from "@/server/domain/entities/auth";
import {
	ConflictError,
	DomainError,
	NotFoundError,
} from "@/server/domain/errors/domain-error";
import type {
	CategoryDto,
	CategoryRepository,
} from "@/server/domain/repositories/category-repository";
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

const mockCategory: CategoryDto = {
	id: "cat-1",
	name: "仕事",
	description: "仕事関連",
	userId: "user-1",
	createdAt: now,
	updatedAt: now,
};

function createMockCategoryRepository(
	overrides?: Partial<CategoryRepository>,
): CategoryRepository {
	return {
		findAllByUserId: async () => ok([mockCategory]),
		findByIdAndUserId: async () => ok(mockCategory),
		create: async (input) =>
			ok({ ...mockCategory, id: "cat-new", name: input.name }),
		update: async (_id, _userId, input) =>
			ok({ ...mockCategory, name: input.name ?? mockCategory.name }),
		softDelete: async () => ok(undefined),
		...overrides,
	};
}

function createTestApp(repo: CategoryRepository) {
	const app = new Hono<AppEnv>();
	app.onError(errorHandler);
	app.use("/*", async (c, next) => {
		c.set("auth", mockAuth);
		await next();
	});
	const handlers = createCategoryHandlers(repo);
	app.get("/categories", handlers.getCategories);
	app.get("/categories/:id", handlers.getCategoryById);
	app.post("/categories", handlers.createCategory);
	app.patch("/categories/:id", handlers.updateCategory);
	app.delete("/categories/:id", handlers.deleteCategory);
	return app;
}

describe("adapters/handlers/category-handler", () => {
	describe("getCategories", () => {
		test("should return categories for current user when successful", async () => {
			const app = createTestApp(createMockCategoryRepository());

			const res = await app.request("/categories");
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body.data).toHaveLength(1);
			expect(body.data[0].name).toBe("仕事");
		});

		test("should return 500 when repository fails", async () => {
			const app = createTestApp(
				createMockCategoryRepository({
					findAllByUserId: async () =>
						err(new DomainError("INTERNAL_ERROR", "DB error", 500)),
				}),
			);

			const res = await app.request("/categories");
			const body = await res.json();

			expect(res.status).toBe(500);
			expect(body.error.code).toBe("INTERNAL_ERROR");
		});
	});

	describe("getCategoryById", () => {
		test("should return category when found", async () => {
			const app = createTestApp(createMockCategoryRepository());

			const res = await app.request("/categories/cat-1");
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body.data.name).toBe("仕事");
		});

		test("should return 404 when category not found", async () => {
			const app = createTestApp(
				createMockCategoryRepository({
					findByIdAndUserId: async () => ok(null),
				}),
			);

			const res = await app.request("/categories/nonexistent");
			const body = await res.json();

			expect(res.status).toBe(404);
			expect(body.error.code).toBe("NOT_FOUND");
		});
	});

	describe("createCategory", () => {
		test("should return 201 when category is created", async () => {
			const app = createTestApp(createMockCategoryRepository());

			const res = await app.request("/categories", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: "新カテゴリ" }),
			});
			const body = await res.json();

			expect(res.status).toBe(201);
			expect(body.data.name).toBe("新カテゴリ");
		});

		test("should return 422 when validation fails", async () => {
			const app = createTestApp(createMockCategoryRepository());

			const res = await app.request("/categories", {
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
				createMockCategoryRepository({
					create: async () =>
						err(new ConflictError('カテゴリ "仕事" は既に存在します')),
				}),
			);

			const res = await app.request("/categories", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: "仕事" }),
			});
			const body = await res.json();

			expect(res.status).toBe(409);
			expect(body.error.code).toBe("CONFLICT");
		});
	});

	describe("updateCategory", () => {
		test("should return updated category when successful", async () => {
			const app = createTestApp(createMockCategoryRepository());

			const res = await app.request("/categories/cat-1", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: "プライベート" }),
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body.data.name).toBe("プライベート");
		});

		test("should return 404 when category not found", async () => {
			const app = createTestApp(
				createMockCategoryRepository({
					update: async () =>
						err(new NotFoundError("カテゴリが見つかりません")),
				}),
			);

			const res = await app.request("/categories/nonexistent", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: "更新" }),
			});
			const body = await res.json();

			expect(res.status).toBe(404);
			expect(body.error.code).toBe("NOT_FOUND");
		});

		test("should return 422 when validation fails", async () => {
			const app = createTestApp(createMockCategoryRepository());

			const res = await app.request("/categories/cat-1", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: "" }),
			});
			const body = await res.json();

			expect(res.status).toBe(422);
			expect(body.error.code).toBe("VALIDATION_ERROR");
		});
	});

	describe("deleteCategory", () => {
		test("should return 204 when category is deleted", async () => {
			const app = createTestApp(createMockCategoryRepository());

			const res = await app.request("/categories/cat-1", { method: "DELETE" });

			expect(res.status).toBe(204);
		});

		test("should return 404 when category not found", async () => {
			const app = createTestApp(
				createMockCategoryRepository({
					softDelete: async () =>
						err(new NotFoundError("カテゴリが見つかりません")),
				}),
			);

			const res = await app.request("/categories/nonexistent", {
				method: "DELETE",
			});
			const body = await res.json();

			expect(res.status).toBe(404);
			expect(body.error.code).toBe("NOT_FOUND");
		});
	});
});
