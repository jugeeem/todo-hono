import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { errorHandler } from "@/server/adapters/middleware/error-handler";
import {
	DomainError,
	NotFoundError,
	ValidationError,
} from "@/server/domain/errors/domain-error";

function createTestApp() {
	const app = new Hono();
	app.onError(errorHandler);
	return app;
}

describe("adapters/middleware/error-handler", () => {
	test("should return mapped error response when DomainError is thrown", async () => {
		// Arrange
		const app = createTestApp();
		app.get("/test", () => {
			throw new DomainError("CUSTOM_ERROR", "カスタムエラー", 400);
		});

		// Act
		const res = await app.request("/test");
		const body = await res.json();

		// Assert
		expect(res.status).toBe(400);
		expect(body).toEqual({
			data: null,
			error: { code: "CUSTOM_ERROR", message: "カスタムエラー" },
		});
	});

	test("should return 404 response when NotFoundError is thrown", async () => {
		// Arrange
		const app = createTestApp();
		app.get("/test", () => {
			throw new NotFoundError("見つかりません");
		});

		// Act
		const res = await app.request("/test");
		const body = await res.json();

		// Assert
		expect(res.status).toBe(404);
		expect(body).toEqual({
			data: null,
			error: { code: "NOT_FOUND", message: "見つかりません" },
		});
	});

	test("should return 422 response when ValidationError is thrown", async () => {
		// Arrange
		const app = createTestApp();
		app.get("/test", () => {
			throw new ValidationError("無効な入力");
		});

		// Act
		const res = await app.request("/test");
		const body = await res.json();

		// Assert
		expect(res.status).toBe(422);
		expect(body).toEqual({
			data: null,
			error: { code: "VALIDATION_ERROR", message: "無効な入力" },
		});
	});

	test("should return 500 response when unknown error is thrown", async () => {
		// Arrange
		const app = createTestApp();
		app.get("/test", () => {
			throw new Error("予期しないエラー");
		});

		// Act
		const res = await app.request("/test");
		const body = await res.json();

		// Assert
		expect(res.status).toBe(500);
		expect(body).toEqual({
			data: null,
			error: {
				code: "INTERNAL_SERVER_ERROR",
				message: "内部サーバーエラー",
			},
		});
	});
});
