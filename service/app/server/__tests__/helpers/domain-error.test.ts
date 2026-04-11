import { describe, expect, test } from "bun:test";
import {
	ConflictError,
	DomainError,
	ForbiddenError,
	NotFoundError,
	UnauthorizedError,
	ValidationError,
} from "@/server/domain/errors/domain-error";

describe("domain/errors/domain-error", () => {
	describe("DomainError", () => {
		test("should set code, message, and statusCode when constructed", () => {
			// Arrange & Act
			const error = new DomainError("TEST_CODE", "テストメッセージ", 400);

			// Assert
			expect(error.code).toBe("TEST_CODE");
			expect(error.message).toBe("テストメッセージ");
			expect(error.statusCode).toBe(400);
			expect(error.name).toBe("DomainError");
			expect(error).toBeInstanceOf(Error);
		});
	});

	describe("NotFoundError", () => {
		test("should default to 404 and NOT_FOUND code when constructed without arguments", () => {
			// Arrange & Act
			const error = new NotFoundError();

			// Assert
			expect(error.code).toBe("NOT_FOUND");
			expect(error.statusCode).toBe(404);
			expect(error.message).toBe("リソースが見つかりません");
			expect(error).toBeInstanceOf(DomainError);
		});

		test("should use custom message when provided", () => {
			// Arrange & Act
			const error = new NotFoundError("ユーザーが見つかりません");

			// Assert
			expect(error.message).toBe("ユーザーが見つかりません");
		});
	});

	describe("ValidationError", () => {
		test("should default to 422 and VALIDATION_ERROR code when constructed", () => {
			// Arrange & Act
			const error = new ValidationError();

			// Assert
			expect(error.code).toBe("VALIDATION_ERROR");
			expect(error.statusCode).toBe(422);
			expect(error).toBeInstanceOf(DomainError);
		});
	});

	describe("UnauthorizedError", () => {
		test("should default to 401 and UNAUTHORIZED code when constructed", () => {
			// Arrange & Act
			const error = new UnauthorizedError();

			// Assert
			expect(error.code).toBe("UNAUTHORIZED");
			expect(error.statusCode).toBe(401);
			expect(error).toBeInstanceOf(DomainError);
		});
	});

	describe("ForbiddenError", () => {
		test("should default to 403 and FORBIDDEN code when constructed", () => {
			// Arrange & Act
			const error = new ForbiddenError();

			// Assert
			expect(error.code).toBe("FORBIDDEN");
			expect(error.statusCode).toBe(403);
			expect(error).toBeInstanceOf(DomainError);
		});
	});

	describe("ConflictError", () => {
		test("should default to 409 and CONFLICT code when constructed", () => {
			// Arrange & Act
			const error = new ConflictError();

			// Assert
			expect(error.code).toBe("CONFLICT");
			expect(error.statusCode).toBe(409);
			expect(error).toBeInstanceOf(DomainError);
		});
	});
});
