import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { errorHandler } from "@/server/adapters/middleware/error-handler";
import { requirePermission } from "@/server/adapters/middleware/require-permission";
import type { AuthContext } from "@/server/domain/entities/auth";
import type { AppEnv } from "@/server/types";

function createTestApp(authContext: AuthContext | null) {
	const app = new Hono<AppEnv>();
	app.onError(errorHandler);

	// Simulate auth middleware by setting auth context
	app.use("/protected/*", async (c, next) => {
		if (authContext) {
			c.set("auth", authContext);
		}
		await next();
	});

	app.get("/protected/admin", requirePermission("admin:access"), (c) =>
		c.json({ ok: true }),
	);

	app.get(
		"/protected/multi",
		requirePermission("todo:read", "todo:write"),
		(c) => c.json({ ok: true }),
	);

	return app;
}

const baseAuthContext: AuthContext = {
	user: {
		identityId: "user-uuid-123",
		email: "test@example.com",
		username: "testuser",
		sessionId: "session-123",
	},
	permissions: ["admin:access", "todo:read", "todo:write"],
};

describe("adapters/middleware/require-permission", () => {
	test("should pass when user has required permission", async () => {
		// Arrange
		const app = createTestApp(baseAuthContext);

		// Act
		const res = await app.request("/protected/admin");

		// Assert
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body).toEqual({ ok: true });
	});

	test("should pass when user has all required permissions", async () => {
		// Arrange
		const app = createTestApp(baseAuthContext);

		// Act
		const res = await app.request("/protected/multi");

		// Assert
		expect(res.status).toBe(200);
	});

	test("should return 403 when user lacks required permission", async () => {
		// Arrange
		const app = createTestApp({
			...baseAuthContext,
			permissions: ["todo:read"],
		});

		// Act
		const res = await app.request("/protected/admin");
		const body = await res.json();

		// Assert
		expect(res.status).toBe(403);
		expect(body.error.code).toBe("FORBIDDEN");
	});

	test("should return 403 when user lacks one of multiple required permissions", async () => {
		// Arrange
		const app = createTestApp({
			...baseAuthContext,
			permissions: ["todo:read"],
		});

		// Act
		const res = await app.request("/protected/multi");
		const body = await res.json();

		// Assert
		expect(res.status).toBe(403);
		expect(body.error.code).toBe("FORBIDDEN");
		expect(body.error.message).toContain("todo:write");
	});

	test("should return 401 when auth context is not set", async () => {
		// Arrange
		const app = createTestApp(null);

		// Act
		const res = await app.request("/protected/admin");
		const body = await res.json();

		// Assert
		expect(res.status).toBe(401);
		expect(body.error.code).toBe("UNAUTHORIZED");
	});
});
