import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { PrismaClient } from "@/prisma/generated/prisma/client";
import { PrismaTodoRepository } from "@/server/infrastructure/repositories/prisma-todo-repository";

function createMockPrisma() {
	return {
		todos: {
			findMany: mock(),
			findFirst: mock(),
			create: mock(),
			update: mock(),
		},
	} as unknown as PrismaClient;
}

const sampleTodoRow = {
	id: "todo-1",
	title: "テスト",
	description: null,
	status: "pending",
	priority: 2,
	dueDate: null,
	completedAt: null,
	userId: "user-1",
	categoryId: null,
	parentTodoId: null,
	createdAt: new Date("2025-01-01"),
	updatedAt: new Date("2025-01-01"),
};

describe("infrastructure/repositories/prisma-todo-repository", () => {
	let mockPrisma: PrismaClient;
	let repository: PrismaTodoRepository;

	beforeEach(() => {
		mockPrisma = createMockPrisma();
		repository = new PrismaTodoRepository(mockPrisma);
	});

	describe("findAllByUserId()", () => {
		test("should return todos for user", async () => {
			(mockPrisma.todos.findMany as ReturnType<typeof mock>).mockResolvedValue([
				sampleTodoRow,
			]);

			const result = await repository.findAllByUserId("user-1");

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toHaveLength(1);
				expect(result.value[0]?.title).toBe("テスト");
			}
		});

		test("should return empty array when user has no todos", async () => {
			(mockPrisma.todos.findMany as ReturnType<typeof mock>).mockResolvedValue(
				[],
			);

			const result = await repository.findAllByUserId("user-1");

			expect(result.ok).toBe(true);
			if (result.ok) expect(result.value).toEqual([]);
		});

		test("should return error when Prisma throws", async () => {
			(mockPrisma.todos.findMany as ReturnType<typeof mock>).mockRejectedValue(
				new Error("DB error"),
			);

			const result = await repository.findAllByUserId("user-1");

			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error.code).toBe("TODO_FETCH_ERROR");
		});
	});

	describe("findByIdAndUserId()", () => {
		test("should return todo when found", async () => {
			(mockPrisma.todos.findFirst as ReturnType<typeof mock>).mockResolvedValue(
				sampleTodoRow,
			);

			const result = await repository.findByIdAndUserId("todo-1", "user-1");

			expect(result.ok).toBe(true);
			if (result.ok) expect(result.value?.title).toBe("テスト");
		});

		test("should return null when todo does not exist", async () => {
			(mockPrisma.todos.findFirst as ReturnType<typeof mock>).mockResolvedValue(
				null,
			);

			const result = await repository.findByIdAndUserId("not-found", "user-1");

			expect(result.ok).toBe(true);
			if (result.ok) expect(result.value).toBeNull();
		});

		test("should return error when Prisma throws", async () => {
			(mockPrisma.todos.findFirst as ReturnType<typeof mock>).mockRejectedValue(
				new Error("DB error"),
			);

			const result = await repository.findByIdAndUserId("todo-1", "user-1");

			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error.code).toBe("TODO_FETCH_ERROR");
		});
	});

	describe("create()", () => {
		test("should create todo and return TodoDto", async () => {
			(mockPrisma.todos.create as ReturnType<typeof mock>).mockResolvedValue(
				sampleTodoRow,
			);

			const result = await repository.create({
				title: "テスト",
				status: "pending",
				priority: 2,
				userId: "user-1",
			});

			expect(result.ok).toBe(true);
			if (result.ok) expect(result.value.title).toBe("テスト");
		});

		test("should return error when Prisma throws", async () => {
			(mockPrisma.todos.create as ReturnType<typeof mock>).mockRejectedValue(
				new Error("DB error"),
			);

			const result = await repository.create({
				title: "テスト",
				status: "pending",
				priority: 2,
				userId: "user-1",
			});

			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error.code).toBe("TODO_CREATE_ERROR");
		});
	});

	describe("update()", () => {
		test("should update todo when it exists", async () => {
			const updated = { ...sampleTodoRow, status: "done" };
			(mockPrisma.todos.findFirst as ReturnType<typeof mock>).mockResolvedValue(
				sampleTodoRow,
			);
			(mockPrisma.todos.update as ReturnType<typeof mock>).mockResolvedValue(
				updated,
			);

			const result = await repository.update("todo-1", "user-1", {
				status: "done",
				updatedBy: "user-1",
			});

			expect(result.ok).toBe(true);
			if (result.ok) expect(result.value.status).toBe("done");
		});

		test("should return NotFoundError when todo does not exist", async () => {
			(mockPrisma.todos.findFirst as ReturnType<typeof mock>).mockResolvedValue(
				null,
			);

			const result = await repository.update("not-found", "user-1", {
				status: "done",
				updatedBy: "user-1",
			});

			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error.code).toBe("NOT_FOUND");
		});

		test("should return error when Prisma update throws", async () => {
			(mockPrisma.todos.findFirst as ReturnType<typeof mock>).mockResolvedValue(
				sampleTodoRow,
			);
			(mockPrisma.todos.update as ReturnType<typeof mock>).mockRejectedValue(
				new Error("DB error"),
			);

			const result = await repository.update("todo-1", "user-1", {
				status: "done",
				updatedBy: "user-1",
			});

			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error.code).toBe("TODO_UPDATE_ERROR");
		});
	});

	describe("softDelete()", () => {
		test("should soft delete todo when it exists", async () => {
			(mockPrisma.todos.findFirst as ReturnType<typeof mock>).mockResolvedValue(
				sampleTodoRow,
			);
			(mockPrisma.todos.update as ReturnType<typeof mock>).mockResolvedValue(
				{},
			);

			const result = await repository.softDelete("todo-1", "user-1", "user-1");

			expect(result.ok).toBe(true);
			const updateCall = (mockPrisma.todos.update as ReturnType<typeof mock>)
				.mock.calls[0][0];
			expect(updateCall.data.deletedBy).toBe("user-1");
			expect(updateCall.data.deletedAt).toBeInstanceOf(Date);
		});

		test("should return NotFoundError when todo does not exist", async () => {
			(mockPrisma.todos.findFirst as ReturnType<typeof mock>).mockResolvedValue(
				null,
			);

			const result = await repository.softDelete(
				"not-found",
				"user-1",
				"user-1",
			);

			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error.code).toBe("NOT_FOUND");
		});

		test("should return error when Prisma throws", async () => {
			(mockPrisma.todos.findFirst as ReturnType<typeof mock>).mockResolvedValue(
				sampleTodoRow,
			);
			(mockPrisma.todos.update as ReturnType<typeof mock>).mockRejectedValue(
				new Error("DB error"),
			);

			const result = await repository.softDelete("todo-1", "user-1", "user-1");

			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error.code).toBe("TODO_DELETE_ERROR");
		});
	});
});
