import { describe, expect, test } from "bun:test";
import {
	DomainError,
	NotFoundError,
	ValidationError,
} from "@/server/domain/errors/domain-error";
import { err, ok } from "@/server/use-cases/types";

describe("use-cases/types", () => {
	describe("ok()", () => {
		test("should return Result with ok=true and value when called with a value", () => {
			// Arrange
			const value = { id: "123", name: "test" };

			// Act
			const result = ok(value);

			// Assert
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toEqual(value);
			}
		});

		test("should return Result with ok=true when called with null", () => {
			// Arrange & Act
			const result = ok(null);

			// Assert
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBeNull();
			}
		});

		test("should return Result with ok=true when called with undefined", () => {
			// Arrange & Act
			const result = ok(undefined);

			// Assert
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBeUndefined();
			}
		});
	});

	describe("err()", () => {
		test("should return Result with ok=false and error when called with DomainError", () => {
			// Arrange
			const error = new DomainError("TEST_ERROR", "テストエラー", 400);

			// Act
			const result = err(error);

			// Assert
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toBe(error);
				expect(result.error.code).toBe("TEST_ERROR");
				expect(result.error.message).toBe("テストエラー");
				expect(result.error.statusCode).toBe(400);
			}
		});

		test("should return Result with ok=false when called with NotFoundError", () => {
			// Arrange
			const error = new NotFoundError("ユーザーが見つかりません");

			// Act
			const result = err(error);

			// Assert
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.code).toBe("NOT_FOUND");
				expect(result.error.statusCode).toBe(404);
			}
		});

		test("should return Result with ok=false when called with ValidationError", () => {
			// Arrange
			const error = new ValidationError();

			// Act
			const result = err(error);

			// Assert
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.code).toBe("VALIDATION_ERROR");
				expect(result.error.statusCode).toBe(422);
			}
		});
	});
});
