import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { createRoleHandlers } from "@/server/adapters/handlers/role-handler";
import { errorHandler } from "@/server/adapters/middleware/error-handler";
import type { AuthContext } from "@/server/domain/entities/auth";
import {
	ConflictError,
	DomainError,
	NotFoundError,
} from "@/server/domain/errors/domain-error";
import type { PermissionRepository } from "@/server/domain/repositories/permission-repository";
import type {
	RoleDto,
	RoleRepository,
} from "@/server/domain/repositories/role-repository";
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

const mockRole: RoleDto = {
	id: "role-1",
	name: "admin",
	description: "Administrator",
	createdAt: now,
	updatedAt: now,
	permissions: [{ id: "perm-1", name: "todo:read", description: null }],
};

function createMockRoleRepository(
	overrides?: Partial<RoleRepository>,
): RoleRepository {
	return {
		findAll: async () => ok([mockRole]),
		findById: async () => ok(mockRole),
		create: async (input) =>
			ok({
				...mockRole,
				id: "role-new",
				name: input.name,
				description: input.description ?? null,
			}),
		update: async (_id, input) =>
			ok({ ...mockRole, name: input.name ?? mockRole.name }),
		softDelete: async () => ok(undefined),
		addPermission: async () => ok(undefined),
		removePermission: async () => ok(undefined),
		...overrides,
	};
}

function createMockPermissionRepository(
	overrides?: Partial<PermissionRepository>,
): PermissionRepository {
	return {
		getPermissionsByUserId: async () => ok([]),
		findAll: async () => ok([]),
		findById: async () =>
			ok({ id: "perm-1", name: "todo:read", description: null }),
		create: async () =>
			ok({ id: "perm-1", name: "todo:read", description: null }),
		...overrides,
	};
}

function createTestApp(
	roleRepo: RoleRepository,
	permRepo: PermissionRepository,
) {
	const app = new Hono<AppEnv>();
	app.onError(errorHandler);
	app.use("/*", async (c, next) => {
		c.set("auth", mockAuth);
		await next();
	});
	const handlers = createRoleHandlers(roleRepo, permRepo);
	app.get("/roles", handlers.getRoles);
	app.get("/roles/:id", handlers.getRoleById);
	app.post("/roles", handlers.createRole);
	app.patch("/roles/:id", handlers.updateRole);
	app.delete("/roles/:id", handlers.deleteRole);
	app.post("/roles/:id/permissions", handlers.addPermission);
	app.delete("/roles/:id/permissions/:permissionId", handlers.removePermission);
	return app;
}

describe("adapters/handlers/role-handler", () => {
	describe("getRoles", () => {
		test("should return roles list when successful", async () => {
			const app = createTestApp(
				createMockRoleRepository(),
				createMockPermissionRepository(),
			);

			const res = await app.request("/roles");
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body.data).toHaveLength(1);
			expect(body.data[0].name).toBe("admin");
		});

		test("should return 500 when repository fails", async () => {
			const app = createTestApp(
				createMockRoleRepository({
					findAll: async () =>
						err(new DomainError("INTERNAL_ERROR", "DB error", 500)),
				}),
				createMockPermissionRepository(),
			);

			const res = await app.request("/roles");
			const body = await res.json();

			expect(res.status).toBe(500);
			expect(body.error.code).toBe("INTERNAL_ERROR");
		});
	});

	describe("getRoleById", () => {
		test("should return role when found", async () => {
			const app = createTestApp(
				createMockRoleRepository(),
				createMockPermissionRepository(),
			);

			const res = await app.request("/roles/role-1");
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body.data.name).toBe("admin");
			expect(body.data.permissions).toHaveLength(1);
		});

		test("should return 404 when role not found", async () => {
			const app = createTestApp(
				createMockRoleRepository({
					findById: async () => ok(null),
				}),
				createMockPermissionRepository(),
			);

			const res = await app.request("/roles/nonexistent");
			const body = await res.json();

			expect(res.status).toBe(404);
			expect(body.error.code).toBe("NOT_FOUND");
		});
	});

	describe("createRole", () => {
		test("should return 201 when role is created", async () => {
			const app = createTestApp(
				createMockRoleRepository(),
				createMockPermissionRepository(),
			);

			const res = await app.request("/roles", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: "editor", description: "Editor role" }),
			});
			const body = await res.json();

			expect(res.status).toBe(201);
			expect(body.data.name).toBe("editor");
		});

		test("should return 422 when validation fails", async () => {
			const app = createTestApp(
				createMockRoleRepository(),
				createMockPermissionRepository(),
			);

			const res = await app.request("/roles", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: "" }),
			});
			const body = await res.json();

			expect(res.status).toBe(422);
			expect(body.error.code).toBe("VALIDATION_ERROR");
		});
	});

	describe("updateRole", () => {
		test("should return updated role when successful", async () => {
			const app = createTestApp(
				createMockRoleRepository(),
				createMockPermissionRepository(),
			);

			const res = await app.request("/roles/role-1", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: "super-admin" }),
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body.data.name).toBe("super-admin");
		});

		test("should return 404 when role not found", async () => {
			const app = createTestApp(
				createMockRoleRepository({
					update: async () => err(new NotFoundError("ロールが見つかりません")),
				}),
				createMockPermissionRepository(),
			);

			const res = await app.request("/roles/nonexistent", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: "updated" }),
			});
			const body = await res.json();

			expect(res.status).toBe(404);
			expect(body.error.code).toBe("NOT_FOUND");
		});
	});

	describe("deleteRole", () => {
		test("should return 204 when role is deleted", async () => {
			const app = createTestApp(
				createMockRoleRepository(),
				createMockPermissionRepository(),
			);

			const res = await app.request("/roles/role-1", { method: "DELETE" });

			expect(res.status).toBe(204);
		});

		test("should return 500 when delete fails", async () => {
			const app = createTestApp(
				createMockRoleRepository({
					softDelete: async () =>
						err(new DomainError("INTERNAL_ERROR", "DB error", 500)),
				}),
				createMockPermissionRepository(),
			);

			const res = await app.request("/roles/role-1", { method: "DELETE" });
			const body = await res.json();

			expect(res.status).toBe(500);
			expect(body.error.code).toBe("INTERNAL_ERROR");
		});
	});

	describe("addPermission", () => {
		test("should return 204 when permission is added", async () => {
			const app = createTestApp(
				createMockRoleRepository(),
				createMockPermissionRepository(),
			);

			const res = await app.request("/roles/role-1/permissions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					permissionId: "550e8400-e29b-41d4-a716-446655440000",
				}),
			});

			expect(res.status).toBe(204);
		});

		test("should return 422 when permissionId is invalid", async () => {
			const app = createTestApp(
				createMockRoleRepository(),
				createMockPermissionRepository(),
			);

			const res = await app.request("/roles/role-1/permissions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ permissionId: "" }),
			});
			const body = await res.json();

			expect(res.status).toBe(422);
			expect(body.error.code).toBe("VALIDATION_ERROR");
		});

		test("should return 404 when role not found", async () => {
			const app = createTestApp(
				createMockRoleRepository({
					findById: async () => ok(null),
				}),
				createMockPermissionRepository(),
			);

			const res = await app.request("/roles/nonexistent/permissions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					permissionId: "550e8400-e29b-41d4-a716-446655440000",
				}),
			});
			const body = await res.json();

			expect(res.status).toBe(404);
			expect(body.error.code).toBe("NOT_FOUND");
		});

		test("should return 409 when permission already assigned", async () => {
			const app = createTestApp(
				createMockRoleRepository({
					addPermission: async () =>
						err(new ConflictError("既に割り当てられています")),
				}),
				createMockPermissionRepository(),
			);

			const res = await app.request("/roles/role-1/permissions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					permissionId: "550e8400-e29b-41d4-a716-446655440000",
				}),
			});
			const body = await res.json();

			expect(res.status).toBe(409);
			expect(body.error.code).toBe("CONFLICT");
		});
	});

	describe("removePermission", () => {
		test("should return 204 when permission is removed", async () => {
			const app = createTestApp(
				createMockRoleRepository(),
				createMockPermissionRepository(),
			);

			const res = await app.request("/roles/role-1/permissions/perm-1", {
				method: "DELETE",
			});

			expect(res.status).toBe(204);
		});

		test("should return 500 when remove fails", async () => {
			const app = createTestApp(
				createMockRoleRepository({
					removePermission: async () =>
						err(new DomainError("INTERNAL_ERROR", "DB error", 500)),
				}),
				createMockPermissionRepository(),
			);

			const res = await app.request("/roles/role-1/permissions/perm-1", {
				method: "DELETE",
			});
			const body = await res.json();

			expect(res.status).toBe(500);
			expect(body.error.code).toBe("INTERNAL_ERROR");
		});
	});
});
