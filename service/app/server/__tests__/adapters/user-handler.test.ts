import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { createUserHandlers } from "@/server/adapters/handlers/user-handler";
import { errorHandler } from "@/server/adapters/middleware/error-handler";
import type { AuthContext } from "@/server/domain/entities/auth";
import {
	DomainError,
	NotFoundError,
} from "@/server/domain/errors/domain-error";
import type {
	UserDto,
	UserRepository,
} from "@/server/domain/repositories/user-repository";
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

const mockUserDto: UserDto = {
	id: "user-1",
	username: "testuser",
	email: "test@example.com",
	userInfo: null,
	createdAt: now,
	updatedAt: now,
};

function createMockUserRepository(
	overrides?: Partial<UserRepository>,
): UserRepository {
	return {
		findAll: async () => ok([mockUserDto]),
		findById: async () => ok(null as never),
		findDtoById: async () => ok(mockUserDto),
		create: async () => ok(null as never),
		update: async (_id, input) =>
			ok({
				...mockUserDto,
				username: input.username ?? mockUserDto.username,
				email: input.email ?? mockUserDto.email,
			}),
		softDelete: async () => ok(undefined),
		...overrides,
	};
}

function createTestApp(repo: UserRepository) {
	const app = new Hono<AppEnv>();
	app.onError(errorHandler);
	app.use("/*", async (c, next) => {
		c.set("auth", mockAuth);
		await next();
	});
	const handlers = createUserHandlers(repo);
	app.get("/users", handlers.getUsers);
	app.get("/users/:id", handlers.getUserById);
	app.patch("/users/:id", handlers.updateUser);
	app.delete("/users/:id", handlers.deleteUser);
	return app;
}

describe("adapters/handlers/user-handler", () => {
	describe("getUsers", () => {
		test("should return users list when successful", async () => {
			const app = createTestApp(createMockUserRepository());

			const res = await app.request("/users");
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body.data).toHaveLength(1);
			expect(body.data[0].username).toBe("testuser");
		});

		test("should return 500 when repository fails", async () => {
			const app = createTestApp(
				createMockUserRepository({
					findAll: async () =>
						err(new DomainError("INTERNAL_ERROR", "DB error", 500)),
				}),
			);

			const res = await app.request("/users");
			const body = await res.json();

			expect(res.status).toBe(500);
			expect(body.error.code).toBe("INTERNAL_ERROR");
		});
	});

	describe("getUserById", () => {
		test("should return user when found", async () => {
			const app = createTestApp(createMockUserRepository());

			const res = await app.request("/users/user-1");
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body.data.username).toBe("testuser");
		});

		test("should return 404 when user not found", async () => {
			const app = createTestApp(
				createMockUserRepository({
					findDtoById: async () => ok(null),
				}),
			);

			const res = await app.request("/users/nonexistent");
			const body = await res.json();

			expect(res.status).toBe(404);
			expect(body.error.code).toBe("NOT_FOUND");
		});
	});

	describe("updateUser", () => {
		test("should return updated user when successful", async () => {
			const app = createTestApp(createMockUserRepository());

			const res = await app.request("/users/user-1", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username: "newname" }),
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body.data.username).toBe("newname");
		});

		test("should return 422 when validation fails", async () => {
			const app = createTestApp(createMockUserRepository());

			const res = await app.request("/users/user-1", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username: "" }),
			});
			const body = await res.json();

			expect(res.status).toBe(422);
			expect(body.error.code).toBe("VALIDATION_ERROR");
		});

		test("should return 404 when user not found", async () => {
			const app = createTestApp(
				createMockUserRepository({
					update: async () =>
						err(new NotFoundError("ユーザーが見つかりません")),
				}),
			);

			const res = await app.request("/users/nonexistent", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username: "newname" }),
			});
			const body = await res.json();

			expect(res.status).toBe(404);
			expect(body.error.code).toBe("NOT_FOUND");
		});
	});

	describe("deleteUser", () => {
		test("should return 204 when user is deleted", async () => {
			const app = createTestApp(createMockUserRepository());

			const res = await app.request("/users/user-1", { method: "DELETE" });

			expect(res.status).toBe(204);
		});

		test("should return 500 when delete fails", async () => {
			const app = createTestApp(
				createMockUserRepository({
					softDelete: async () =>
						err(new DomainError("INTERNAL_ERROR", "DB error", 500)),
				}),
			);

			const res = await app.request("/users/user-1", { method: "DELETE" });
			const body = await res.json();

			expect(res.status).toBe(500);
			expect(body.error.code).toBe("INTERNAL_ERROR");
		});
	});
});
