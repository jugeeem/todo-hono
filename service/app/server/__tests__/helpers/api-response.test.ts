import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import {
	errorResponse,
	successResponse,
} from "@/server/adapters/presenters/api-response";

function createTestApp() {
	return new Hono();
}

describe("adapters/presenters/api-response", () => {
	describe("successResponse()", () => {
		test("should return JSON with data and error=null when called with data", async () => {
			// Arrange
			const app = createTestApp();
			const data = { id: "1", name: "テスト" };
			app.get("/test", (c) => successResponse(c, data));

			// Act
			const res = await app.request("/test");
			const body = await res.json();

			// Assert
			expect(res.status).toBe(200);
			expect(body).toEqual({ data: { id: "1", name: "テスト" }, error: null });
		});

		test("should return specified status code when custom statusCode is provided", async () => {
			// Arrange
			const app = createTestApp();
			app.get("/test", (c) => successResponse(c, { created: true }, 201));

			// Act
			const res = await app.request("/test");
			const body = await res.json();

			// Assert
			expect(res.status).toBe(201);
			expect(body).toEqual({ data: { created: true }, error: null });
		});

		test("should return data=null and error=null when called with null data", async () => {
			// Arrange
			const app = createTestApp();
			app.get("/test", (c) => successResponse(c, null));

			// Act
			const res = await app.request("/test");
			const body = await res.json();

			// Assert
			expect(res.status).toBe(200);
			expect(body).toEqual({ data: null, error: null });
		});
	});

	describe("errorResponse()", () => {
		test("should return JSON with data=null and error object when called with error info", async () => {
			// Arrange
			const app = createTestApp();
			app.get("/test", (c) =>
				errorResponse(c, "NOT_FOUND", "リソースが見つかりません", 404),
			);

			// Act
			const res = await app.request("/test");
			const body = await res.json();

			// Assert
			expect(res.status).toBe(404);
			expect(body).toEqual({
				data: null,
				error: { code: "NOT_FOUND", message: "リソースが見つかりません" },
			});
		});

		test("should default to 500 status code when statusCode is not provided", async () => {
			// Arrange
			const app = createTestApp();
			app.get("/test", (c) =>
				errorResponse(c, "INTERNAL_SERVER_ERROR", "内部エラー"),
			);

			// Act
			const res = await app.request("/test");
			const body = await res.json();

			// Assert
			expect(res.status).toBe(500);
			expect(body).toEqual({
				data: null,
				error: { code: "INTERNAL_SERVER_ERROR", message: "内部エラー" },
			});
		});
	});
});
