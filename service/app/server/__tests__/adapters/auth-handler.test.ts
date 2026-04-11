import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { createAuthHandlers } from "@/server/adapters/handlers/auth-handler";
import { errorHandler } from "@/server/adapters/middleware/error-handler";
import type { AuthContext } from "@/server/domain/entities/auth";
import { UnauthorizedError } from "@/server/domain/errors/domain-error";
import type { AuthService } from "@/server/domain/repositories/auth-service";
import type { AppEnv } from "@/server/types";
import { err, ok } from "@/server/use-cases/types";

const mockAuthContext: AuthContext = {
	user: {
		identityId: "user-1",
		email: "test@example.com",
		username: "testuser",
		sessionId: "session-1",
	},
	permissions: ["todo:read"],
};

function createMockAuthService(overrides?: Partial<AuthService>): AuthService {
	return {
		validateSession: async () => ok(mockAuthContext.user),
		logout: async () => ok(undefined),
		...overrides,
	};
}

function createTestApp(authService: AuthService) {
	const app = new Hono<AppEnv>();
	app.onError(errorHandler);

	app.use("/*", async (c, next) => {
		c.set("auth", mockAuthContext);
		await next();
	});

	const handlers = createAuthHandlers(authService);
	app.get("/auth/session", handlers.getSession);
	app.delete("/auth/session", handlers.logout);

	return app;
}

describe("adapters/handlers/auth-handler", () => {
	describe("getSession", () => {
		test("should return user and permissions when called", async () => {
			const app = createTestApp(createMockAuthService());

			const res = await app.request("/auth/session");
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body.data.user.identityId).toBe("user-1");
			expect(body.data.permissions).toContain("todo:read");
			expect(body.error).toBeNull();
		});
	});

	describe("logout", () => {
		test("should return 204 when logout succeeds", async () => {
			const app = createTestApp(createMockAuthService());

			const res = await app.request("/auth/session", {
				method: "DELETE",
				headers: { Authorization: "Bearer valid-token" },
			});

			expect(res.status).toBe(204);
		});

		test("should return error when logout fails", async () => {
			const app = createTestApp(
				createMockAuthService({
					logout: async () =>
						err(new UnauthorizedError("ログアウトに失敗しました")),
				}),
			);

			const res = await app.request("/auth/session", {
				method: "DELETE",
				headers: { Authorization: "Bearer invalid-token" },
			});
			const body = await res.json();

			expect(res.status).toBe(401);
			expect(body.error.code).toBe("UNAUTHORIZED");
		});

		test("should extract token from Authorization header when provided", async () => {
			let capturedToken = "";
			const app = createTestApp(
				createMockAuthService({
					logout: async (token) => {
						capturedToken = token;
						return ok(undefined);
					},
				}),
			);

			await app.request("/auth/session", {
				method: "DELETE",
				headers: { Authorization: "Bearer my-session-token" },
			});

			expect(capturedToken).toBe("my-session-token");
		});
	});
});
