import { describe, expect, test } from "bun:test";
import {
	createTodoSchema,
	updateTodoSchema,
} from "@/server/adapters/validators/todo-validator";

describe("validators/todo-validator", () => {
	describe("createTodoSchema", () => {
		test("should pass with minimal valid input", () => {
			const result = createTodoSchema.safeParse({ title: "テスト Todo" });
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.status).toBe("pending");
				expect(result.data.priority).toBe(2);
			}
		});

		test("should pass with all fields provided", () => {
			const result = createTodoSchema.safeParse({
				title: "テスト",
				description: "詳細",
				status: "in_progress",
				priority: 3,
				dueDate: "2026-12-31T23:59:59.000Z",
				categoryId: "550e8400-e29b-41d4-a716-446655440000",
				parentTodoId: "550e8400-e29b-41d4-a716-446655440001",
			});
			expect(result.success).toBe(true);
		});

		test("should fail when title is empty", () => {
			const result = createTodoSchema.safeParse({ title: "" });
			expect(result.success).toBe(false);
		});

		test("should fail when title is missing", () => {
			const result = createTodoSchema.safeParse({});
			expect(result.success).toBe(false);
		});

		test("should fail when title exceeds 256 characters", () => {
			const result = createTodoSchema.safeParse({ title: "a".repeat(257) });
			expect(result.success).toBe(false);
		});

		test("should fail when status is invalid", () => {
			const result = createTodoSchema.safeParse({
				title: "テスト",
				status: "invalid",
			});
			expect(result.success).toBe(false);
		});

		test("should accept all valid status values", () => {
			for (const status of ["pending", "in_progress", "done", "cancelled"]) {
				const result = createTodoSchema.safeParse({ title: "テスト", status });
				expect(result.success).toBe(true);
			}
		});

		test("should fail when priority is out of range", () => {
			expect(
				createTodoSchema.safeParse({ title: "テスト", priority: 0 }).success,
			).toBe(false);
			expect(
				createTodoSchema.safeParse({ title: "テスト", priority: 6 }).success,
			).toBe(false);
		});

		test("should fail when dueDate is not a valid datetime", () => {
			const result = createTodoSchema.safeParse({
				title: "テスト",
				dueDate: "not-a-date",
			});
			expect(result.success).toBe(false);
		});

		test("should fail when categoryId is not a UUID", () => {
			const result = createTodoSchema.safeParse({
				title: "テスト",
				categoryId: "invalid",
			});
			expect(result.success).toBe(false);
		});
	});

	describe("updateTodoSchema", () => {
		test("should pass with empty object", () => {
			const result = updateTodoSchema.safeParse({});
			expect(result.success).toBe(true);
		});

		test("should pass with partial update", () => {
			const result = updateTodoSchema.safeParse({ status: "done" });
			expect(result.success).toBe(true);
		});

		test("should accept nullable fields", () => {
			const result = updateTodoSchema.safeParse({
				description: null,
				dueDate: null,
				completedAt: null,
				categoryId: null,
			});
			expect(result.success).toBe(true);
		});

		test("should fail when title is empty", () => {
			const result = updateTodoSchema.safeParse({ title: "" });
			expect(result.success).toBe(false);
		});
	});
});
