import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { authMiddleware } from "@/server/adapters/middleware/auth-middleware";
import { errorHandler } from "@/server/adapters/middleware/error-handler";
import type { AuthUser } from "@/server/domain/entities/auth";
import { UnauthorizedError } from "@/server/domain/errors/domain-error";
import type { AuthService } from "@/server/domain/repositories/auth-service";
import type { PermissionRepository } from "@/server/domain/repositories/permission-repository";
import type { UserRepository } from "@/server/domain/repositories/user-repository";
import type { AppEnv } from "@/server/types";
import { err, ok } from "@/server/use-cases/types";

const mockUser: AuthUser = {
	identityId: "user-uuid-123",
	email: "test@example.com",
	username: "testuser",
	sessionId: "session-123",
};

function createMockAuthService(overrides?: Partial<AuthService>): AuthService {
	return {
		validateSession: async () => ok(mockUser),
		logout: async () => ok(undefined),
		...overrides,
	};
}

function createMockPermissionRepository(
	overrides?: Partial<PermissionRepository>,
): PermissionRepository {
	return {
		getPermissionsByUserId: async () => ok(["todo:read", "todo:write"]),
		findAll: async () => ok([]),
		findById: async () => ok(null),
		create: async () =>
			ok({ id: "perm-1", name: "todo:read", description: null }),
		...overrides,
	};
}

function createMockUserRepository(
	overrides?: Partial<UserRepository>,
): UserRepository {
	return {
		findAll: async () => ok([]),
		findById: async () => ok({ id: "user-uuid-123" } as never),
		findDtoById: async () => ok(null),
		create: async () => ok({ id: "user-uuid-123" } as never),
		update: async () => ok({ id: "user-uuid-123" } as never),
		softDelete: async () => ok(undefined),
		...overrides,
	};
}

function createTestApp(
	authService: AuthService,
	permissionRepository: PermissionRepository,
	userRepository: UserRepository,
) {
	const app = new Hono<AppEnv>();
	app.onError(errorHandler);
	app.use(
		"/protected/*",
		authMiddleware(authService, permissionRepository, userRepository),
	);
	app.get("/protected/resource", (c) => {
		const auth = c.get("auth");
		return c.json({ user: auth.user, permissions: auth.permissions });
	});
	return app;
}

describe("adapters/middleware/auth-middleware", () => {
	test("should set auth context when valid token is provided", async () => {
		// Arrange
		const app = createTestApp(
			createMockAuthService(),
			createMockPermissionRepository(),
			createMockUserRepository(),
		);

		// Act
		const res = await app.request("/protected/resource", {
			headers: { Authorization: "Bearer valid-token" },
		});
		const body = await res.json();

		// Assert
		expect(res.status).toBe(200);
		expect(body.user).toEqual(mockUser);
		expect(body.permissions).toEqual(["todo:read", "todo:write"]);
	});

	test("should return 401 when Authorization header is missing", async () => {
		// Arrange
		const app = createTestApp(
			createMockAuthService(),
			createMockPermissionRepository(),
			createMockUserRepository(),
		);

		// Act
		const res = await app.request("/protected/resource");
		const body = await res.json();

		// Assert
		expect(res.status).toBe(401);
		expect(body.error.code).toBe("UNAUTHORIZED");
	});

	test("should return 401 when Authorization header is not Bearer", async () => {
		// Arrange
		const app = createTestApp(
			createMockAuthService(),
			createMockPermissionRepository(),
			createMockUserRepository(),
		);

		// Act
		const res = await app.request("/protected/resource", {
			headers: { Authorization: "Basic dXNlcjpwYXNz" },
		});
		const body = await res.json();

		// Assert
		expect(res.status).toBe(401);
		expect(body.error.code).toBe("UNAUTHORIZED");
	});

	test("should return 401 when session validation fails", async () => {
		// Arrange
		const app = createTestApp(
			createMockAuthService({
				validateSession: async () =>
					err(new UnauthorizedError("無効なトークン")),
			}),
			createMockPermissionRepository(),
			createMockUserRepository(),
		);

		// Act
		const res = await app.request("/protected/resource", {
			headers: { Authorization: "Bearer invalid-token" },
		});
		const body = await res.json();

		// Assert
		expect(res.status).toBe(401);
		expect(body.error.code).toBe("UNAUTHORIZED");
		expect(body.error.message).toBe("無効なトークン");
	});

	test("should create user via JIT provisioning when user does not exist in DB", async () => {
		// Arrange
		let createCalled = false;
		const app = createTestApp(
			createMockAuthService(),
			createMockPermissionRepository(),
			createMockUserRepository({
				findById: async () => ok(null),
				create: async () => {
					createCalled = true;
					return ok({ id: mockUser.identityId } as never);
				},
			}),
		);

		// Act
		const res = await app.request("/protected/resource", {
			headers: { Authorization: "Bearer valid-token" },
		});

		// Assert
		expect(res.status).toBe(200);
		expect(createCalled).toBe(true);
	});
});
