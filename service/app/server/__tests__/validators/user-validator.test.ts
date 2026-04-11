import { describe, expect, test } from "bun:test";
import { updateUserSchema } from "@/server/adapters/validators/user-validator";

describe("validators/user-validator", () => {
	describe("updateUserSchema", () => {
		test("should pass when username is provided", () => {
			const result = updateUserSchema.safeParse({ username: "newuser" });
			expect(result.success).toBe(true);
		});

		test("should pass when email is provided", () => {
			const result = updateUserSchema.safeParse({
				email: "new@example.com",
			});
			expect(result.success).toBe(true);
		});

		test("should pass when both username and email are provided", () => {
			const result = updateUserSchema.safeParse({
				username: "newuser",
				email: "new@example.com",
			});
			expect(result.success).toBe(true);
		});

		test("should pass when empty object is provided", () => {
			const result = updateUserSchema.safeParse({});
			expect(result.success).toBe(true);
		});

		test("should fail when username is empty", () => {
			const result = updateUserSchema.safeParse({ username: "" });
			expect(result.success).toBe(false);
		});

		test("should fail when username exceeds 256 characters", () => {
			const result = updateUserSchema.safeParse({
				username: "a".repeat(257),
			});
			expect(result.success).toBe(false);
		});

		test("should fail when email is invalid", () => {
			const result = updateUserSchema.safeParse({ email: "not-an-email" });
			expect(result.success).toBe(false);
		});

		test("should fail when email exceeds 256 characters", () => {
			const result = updateUserSchema.safeParse({
				email: `${"a".repeat(245)}@example.com`,
			});
			expect(result.success).toBe(false);
		});
	});
});
