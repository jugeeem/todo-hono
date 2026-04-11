import { describe, expect, test } from "bun:test";
import { assignRoleSchema } from "@/server/adapters/validators/user-role-validator";

describe("validators/user-role-validator", () => {
	describe("assignRoleSchema", () => {
		test("should pass when valid UUID roleId is provided", () => {
			const result = assignRoleSchema.safeParse({
				roleId: "550e8400-e29b-41d4-a716-446655440000",
			});
			expect(result.success).toBe(true);
		});

		test("should fail when roleId is not a UUID", () => {
			const result = assignRoleSchema.safeParse({ roleId: "not-a-uuid" });
			expect(result.success).toBe(false);
		});

		test("should fail when roleId is missing", () => {
			const result = assignRoleSchema.safeParse({});
			expect(result.success).toBe(false);
		});

		test("should fail when roleId is empty string", () => {
			const result = assignRoleSchema.safeParse({ roleId: "" });
			expect(result.success).toBe(false);
		});
	});
});
