import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { createUserRoleHandlers } from "@/server/adapters/handlers/user-role-handler";
import { errorHandler } from "@/server/adapters/middleware/error-handler";
import type { AuthContext } from "@/server/domain/entities/auth";
import {
	ConflictError,
	DomainError,
} from "@/server/domain/errors/domain-error";
import type {
	UserRoleDto,
	UserRoleRepository,
} from "@/server/domain/repositories/user-role-repository";
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

const mockUserRole: UserRoleDto = {
	id: "ur-1",
	roleId: "role-1",
	roleName: "admin",
	roleDescription: "Administrator",
	assignedAt: now,
};

function createMockUserRoleRepository(
	overrides?: Partial<UserRoleRepository>,
): UserRoleRepository {
	return {
		findByUserId: async () => ok([mockUserRole]),
		assign: async () => ok(undefined),
		remove: async () => ok(undefined),
		...overrides,
	};
}

function createTestApp(repo: UserRoleRepository) {
	const app = new Hono<AppEnv>();
	app.onError(errorHandler);
	app.use("/*", async (c, next) => {
		c.set("auth", mockAuth);
		await next();
	});
	const handlers = createUserRoleHandlers(repo);
	app.get("/users/:id/roles", handlers.getUserRoles);
	app.post("/users/:id/roles", handlers.assignRole);
	app.delete("/users/:id/roles/:roleId", handlers.removeRole);
	return app;
}

describe("adapters/handlers/user-role-handler", () => {
	describe("getUserRoles", () => {
		test("should return roles for user when successful", async () => {
			const app = createTestApp(createMockUserRoleRepository());

			const res = await app.request("/users/user-1/roles");
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body.data).toHaveLength(1);
			expect(body.data[0].roleName).toBe("admin");
		});

		test("should return 500 when repository fails", async () => {
			const app = createTestApp(
				createMockUserRoleRepository({
					findByUserId: async () =>
						err(new DomainError("INTERNAL_ERROR", "DB error", 500)),
				}),
			);

			const res = await app.request("/users/user-1/roles");
			const body = await res.json();

			expect(res.status).toBe(500);
			expect(body.error.code).toBe("INTERNAL_ERROR");
		});
	});

	describe("assignRole", () => {
		test("should return 204 when role is assigned", async () => {
			const app = createTestApp(createMockUserRoleRepository());

			const res = await app.request("/users/user-1/roles", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					roleId: "550e8400-e29b-41d4-a716-446655440000",
				}),
			});

			expect(res.status).toBe(204);
		});

		test("should return 422 when roleId is invalid", async () => {
			const app = createTestApp(createMockUserRoleRepository());

			const res = await app.request("/users/user-1/roles", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ roleId: "not-a-uuid" }),
			});
			const body = await res.json();

			expect(res.status).toBe(422);
			expect(body.error.code).toBe("VALIDATION_ERROR");
		});

		test("should return 409 when role already assigned", async () => {
			const app = createTestApp(
				createMockUserRoleRepository({
					assign: async () =>
						err(new ConflictError("既に割り当てられています")),
				}),
			);

			const res = await app.request("/users/user-1/roles", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					roleId: "550e8400-e29b-41d4-a716-446655440000",
				}),
			});
			const body = await res.json();

			expect(res.status).toBe(409);
			expect(body.error.code).toBe("CONFLICT");
		});
	});

	describe("removeRole", () => {
		test("should return 204 when role is removed", async () => {
			const app = createTestApp(createMockUserRoleRepository());

			const res = await app.request("/users/user-1/roles/role-1", {
				method: "DELETE",
			});

			expect(res.status).toBe(204);
		});

		test("should return 500 when remove fails", async () => {
			const app = createTestApp(
				createMockUserRoleRepository({
					remove: async () =>
						err(new DomainError("INTERNAL_ERROR", "DB error", 500)),
				}),
			);

			const res = await app.request("/users/user-1/roles/role-1", {
				method: "DELETE",
			});
			const body = await res.json();

			expect(res.status).toBe(500);
			expect(body.error.code).toBe("INTERNAL_ERROR");
		});
	});
});
