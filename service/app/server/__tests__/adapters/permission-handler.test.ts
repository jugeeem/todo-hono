import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { createPermissionHandlers } from "@/server/adapters/handlers/permission-handler";
import { errorHandler } from "@/server/adapters/middleware/error-handler";
import type { AuthContext } from "@/server/domain/entities/auth";
import { DomainError } from "@/server/domain/errors/domain-error";
import type {
	PermissionDto,
	PermissionRepository,
} from "@/server/domain/repositories/permission-repository";
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

const mockPermission: PermissionDto = {
	id: "perm-1",
	name: "todo:read",
	description: "Read todos",
};

function createMockPermissionRepository(
	overrides?: Partial<PermissionRepository>,
): PermissionRepository {
	return {
		getPermissionsByUserId: async () => ok([]),
		findAll: async () => ok([mockPermission]),
		findById: async () => ok(mockPermission),
		create: async (input) =>
			ok({
				id: "perm-new",
				name: input.name,
				description: input.description ?? null,
			}),
		...overrides,
	};
}

function createTestApp(repo: PermissionRepository) {
	const app = new Hono<AppEnv>();
	app.onError(errorHandler);
	app.use("/*", async (c, next) => {
		c.set("auth", mockAuth);
		await next();
	});
	const handlers = createPermissionHandlers(repo);
	app.get("/permissions", handlers.getPermissions);
	app.post("/permissions", handlers.createPermission);
	return app;
}

describe("adapters/handlers/permission-handler", () => {
	describe("getPermissions", () => {
		test("should return permissions list when successful", async () => {
			const app = createTestApp(createMockPermissionRepository());

			const res = await app.request("/permissions");
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body.data).toHaveLength(1);
			expect(body.data[0].name).toBe("todo:read");
		});

		test("should return 500 when repository fails", async () => {
			const app = createTestApp(
				createMockPermissionRepository({
					findAll: async () =>
						err(new DomainError("INTERNAL_ERROR", "DB error", 500)),
				}),
			);

			const res = await app.request("/permissions");
			const body = await res.json();

			expect(res.status).toBe(500);
			expect(body.error.code).toBe("INTERNAL_ERROR");
		});
	});

	describe("createPermission", () => {
		test("should return 201 when permission is created", async () => {
			const app = createTestApp(createMockPermissionRepository());

			const res = await app.request("/permissions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: "todo:write",
					description: "Write todos",
				}),
			});
			const body = await res.json();

			expect(res.status).toBe(201);
			expect(body.data.name).toBe("todo:write");
		});

		test("should return 422 when validation fails", async () => {
			const app = createTestApp(createMockPermissionRepository());

			const res = await app.request("/permissions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: "" }),
			});
			const body = await res.json();

			expect(res.status).toBe(422);
			expect(body.error.code).toBe("VALIDATION_ERROR");
		});

		test("should return 500 when repository fails", async () => {
			const app = createTestApp(
				createMockPermissionRepository({
					create: async () =>
						err(new DomainError("INTERNAL_ERROR", "DB error", 500)),
				}),
			);

			const res = await app.request("/permissions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: "todo:write" }),
			});
			const body = await res.json();

			expect(res.status).toBe(500);
			expect(body.error.code).toBe("INTERNAL_ERROR");
		});
	});
});
