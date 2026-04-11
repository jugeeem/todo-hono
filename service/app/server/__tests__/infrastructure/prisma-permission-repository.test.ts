import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { PrismaClient } from "@/prisma/generated/prisma/client";
import { PrismaPermissionRepository } from "@/server/infrastructure/repositories/prisma-permission-repository";

function createMockPrisma() {
	return {
		userRoles: {
			findMany: mock(),
		},
		permissions: {
			findMany: mock(),
			findFirst: mock(),
			create: mock(),
		},
	} as unknown as PrismaClient;
}

describe("infrastructure/repositories/prisma-permission-repository", () => {
	let mockPrisma: PrismaClient;
	let repository: PrismaPermissionRepository;

	beforeEach(() => {
		mockPrisma = createMockPrisma();
		repository = new PrismaPermissionRepository(mockPrisma);
	});

	test("should return deduplicated permission names for user with multiple roles", async () => {
		// Arrange
		const mockUserRoles = [
			{
				role: {
					rolePermissions: [
						{ permission: { name: "todo:read" } },
						{ permission: { name: "todo:write" } },
					],
				},
			},
			{
				role: {
					rolePermissions: [
						{ permission: { name: "todo:read" } },
						{ permission: { name: "todo:delete" } },
					],
				},
			},
		];
		(
			mockPrisma.userRoles.findMany as ReturnType<typeof mock>
		).mockResolvedValue(mockUserRoles);

		// Act
		const result = await repository.getPermissionsByUserId("user-uuid-123");

		// Assert
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value).toHaveLength(3);
			expect(result.value).toContain("todo:read");
			expect(result.value).toContain("todo:write");
			expect(result.value).toContain("todo:delete");
		}
	});

	test("should return empty array when user has no roles", async () => {
		// Arrange
		(
			mockPrisma.userRoles.findMany as ReturnType<typeof mock>
		).mockResolvedValue([]);

		// Act
		const result = await repository.getPermissionsByUserId("user-no-roles");

		// Assert
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value).toEqual([]);
		}
	});

	test("should return error when Prisma throws", async () => {
		// Arrange
		(
			mockPrisma.userRoles.findMany as ReturnType<typeof mock>
		).mockRejectedValue(new Error("DB connection error"));

		// Act
		const result = await repository.getPermissionsByUserId("user-uuid-123");

		// Assert
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.code).toBe("PERMISSION_FETCH_ERROR");
			expect(result.error.statusCode).toBe(500);
		}
	});

	describe("findAll()", () => {
		test("should return all permissions when permissions exist", async () => {
			const mockPermissions = [
				{ id: "p1", name: "todo:read", description: null },
				{ id: "p2", name: "todo:write", description: "書き込み" },
			];
			(
				mockPrisma.permissions.findMany as ReturnType<typeof mock>
			).mockResolvedValue(mockPermissions);

			const result = await repository.findAll();

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toHaveLength(2);
				expect(result.value[0]?.name).toBe("todo:read");
			}
		});

		test("should return empty array when no permissions exist", async () => {
			(
				mockPrisma.permissions.findMany as ReturnType<typeof mock>
			).mockResolvedValue([]);

			const result = await repository.findAll();

			expect(result.ok).toBe(true);
			if (result.ok) expect(result.value).toEqual([]);
		});

		test("should return error when Prisma throws", async () => {
			(
				mockPrisma.permissions.findMany as ReturnType<typeof mock>
			).mockRejectedValue(new Error("DB error"));

			const result = await repository.findAll();

			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error.code).toBe("PERMISSION_FETCH_ERROR");
		});
	});

	describe("findById()", () => {
		test("should return permission when found", async () => {
			(
				mockPrisma.permissions.findFirst as ReturnType<typeof mock>
			).mockResolvedValue({ id: "p1", name: "todo:read", description: null });

			const result = await repository.findById("p1");

			expect(result.ok).toBe(true);
			if (result.ok) expect(result.value?.name).toBe("todo:read");
		});

		test("should return null when permission does not exist", async () => {
			(
				mockPrisma.permissions.findFirst as ReturnType<typeof mock>
			).mockResolvedValue(null);

			const result = await repository.findById("not-found");

			expect(result.ok).toBe(true);
			if (result.ok) expect(result.value).toBeNull();
		});

		test("should return error when Prisma throws", async () => {
			(
				mockPrisma.permissions.findFirst as ReturnType<typeof mock>
			).mockRejectedValue(new Error("DB error"));

			const result = await repository.findById("p1");

			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error.code).toBe("PERMISSION_FETCH_ERROR");
		});
	});

	describe("create()", () => {
		test("should create permission when name is unique", async () => {
			(
				mockPrisma.permissions.findFirst as ReturnType<typeof mock>
			).mockResolvedValue(null);
			(
				mockPrisma.permissions.create as ReturnType<typeof mock>
			).mockResolvedValue({
				id: "p-new",
				name: "roles:read",
				description: null,
			});

			const result = await repository.create({
				name: "roles:read",
				createdBy: "user-1",
			});

			expect(result.ok).toBe(true);
			if (result.ok) expect(result.value.name).toBe("roles:read");
		});

		test("should return ConflictError when name already exists", async () => {
			(
				mockPrisma.permissions.findFirst as ReturnType<typeof mock>
			).mockResolvedValue({ id: "existing" });

			const result = await repository.create({
				name: "todo:read",
				createdBy: "user-1",
			});

			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error.code).toBe("CONFLICT");
		});

		test("should return error when Prisma throws on create", async () => {
			(
				mockPrisma.permissions.findFirst as ReturnType<typeof mock>
			).mockResolvedValue(null);
			(
				mockPrisma.permissions.create as ReturnType<typeof mock>
			).mockRejectedValue(new Error("DB error"));

			const result = await repository.create({
				name: "roles:read",
				createdBy: "user-1",
			});

			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error.code).toBe("PERMISSION_CREATE_ERROR");
		});
	});
});
