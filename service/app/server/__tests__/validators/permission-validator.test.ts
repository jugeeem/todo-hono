import { describe, expect, test } from "bun:test";
import { createPermissionSchema } from "@/server/adapters/validators/permission-validator";

describe("validators/permission-validator", () => {
	describe("createPermissionSchema", () => {
		test("should pass when valid name is provided", () => {
			const result = createPermissionSchema.safeParse({ name: "todo:read" });
			expect(result.success).toBe(true);
		});

		test("should pass when name and description are provided", () => {
			const result = createPermissionSchema.safeParse({
				name: "todo:read",
				description: "Todo 読み取り",
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.description).toBe("Todo 読み取り");
			}
		});

		test("should fail when name is empty", () => {
			const result = createPermissionSchema.safeParse({ name: "" });
			expect(result.success).toBe(false);
		});

		test("should fail when name is missing", () => {
			const result = createPermissionSchema.safeParse({});
			expect(result.success).toBe(false);
		});

		test("should fail when name exceeds 256 characters", () => {
			const result = createPermissionSchema.safeParse({
				name: "a".repeat(257),
			});
			expect(result.success).toBe(false);
		});

		test("should pass when description is omitted", () => {
			const result = createPermissionSchema.safeParse({ name: "todo:read" });
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.description).toBeUndefined();
			}
		});
	});
});
