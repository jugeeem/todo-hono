import { describe, expect, test } from "bun:test";
import {
	addPermissionSchema,
	createRoleSchema,
	updateRoleSchema,
} from "@/server/adapters/validators/role-validator";

describe("validators/role-validator", () => {
	describe("createRoleSchema", () => {
		test("should pass when valid name is provided", () => {
			const result = createRoleSchema.safeParse({ name: "ADMIN" });
			expect(result.success).toBe(true);
		});

		test("should pass when name and description are provided", () => {
			const result = createRoleSchema.safeParse({
				name: "ADMIN",
				description: "管理者",
			});
			expect(result.success).toBe(true);
		});

		test("should fail when name is empty", () => {
			const result = createRoleSchema.safeParse({ name: "" });
			expect(result.success).toBe(false);
		});

		test("should fail when name is missing", () => {
			const result = createRoleSchema.safeParse({});
			expect(result.success).toBe(false);
		});

		test("should fail when name exceeds 256 characters", () => {
			const result = createRoleSchema.safeParse({ name: "a".repeat(257) });
			expect(result.success).toBe(false);
		});
	});

	describe("updateRoleSchema", () => {
		test("should pass when name is provided", () => {
			const result = updateRoleSchema.safeParse({ name: "MANAGER" });
			expect(result.success).toBe(true);
		});

		test("should pass when description only is provided", () => {
			const result = updateRoleSchema.safeParse({ description: "更新" });
			expect(result.success).toBe(true);
		});

		test("should pass when empty object is provided", () => {
			const result = updateRoleSchema.safeParse({});
			expect(result.success).toBe(true);
		});

		test("should fail when name is empty string", () => {
			const result = updateRoleSchema.safeParse({ name: "" });
			expect(result.success).toBe(false);
		});
	});

	describe("addPermissionSchema", () => {
		test("should pass when valid UUID permissionId is provided", () => {
			const result = addPermissionSchema.safeParse({
				permissionId: "550e8400-e29b-41d4-a716-446655440000",
			});
			expect(result.success).toBe(true);
		});

		test("should fail when permissionId is not a UUID", () => {
			const result = addPermissionSchema.safeParse({
				permissionId: "not-a-uuid",
			});
			expect(result.success).toBe(false);
		});

		test("should fail when permissionId is missing", () => {
			const result = addPermissionSchema.safeParse({});
			expect(result.success).toBe(false);
		});
	});
});
