import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { PrismaClient } from "@/prisma/generated/prisma/client";
import { PrismaUserRoleRepository } from "@/server/infrastructure/repositories/prisma-user-role-repository";

function createMockPrisma() {
	return {
		userRoles: {
			findMany: mock(),
			findFirst: mock(),
			create: mock(),
			updateMany: mock(),
		},
	} as unknown as PrismaClient;
}

describe("infrastructure/repositories/prisma-user-role-repository", () => {
	let mockPrisma: PrismaClient;
	let repository: PrismaUserRoleRepository;

	beforeEach(() => {
		mockPrisma = createMockPrisma();
		repository = new PrismaUserRoleRepository(mockPrisma);
	});

	describe("findByUserId()", () => {
		test("should return mapped UserRoleDtos when user has roles", async () => {
			const mockUserRoles = [
				{
					id: "ur-1",
					roleId: "role-1",
					createdAt: new Date("2025-01-01"),
					role: { name: "ADMIN", description: "管理者" },
				},
			];
			(
				mockPrisma.userRoles.findMany as ReturnType<typeof mock>
			).mockResolvedValue(mockUserRoles);

			const result = await repository.findByUserId("user-1");

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toHaveLength(1);
				expect(result.value[0]?.roleName).toBe("ADMIN");
				expect(result.value[0]?.roleDescription).toBe("管理者");
				expect(result.value[0]?.assignedAt).toEqual(new Date("2025-01-01"));
			}
		});

		test("should return empty array when user has no roles", async () => {
			(
				mockPrisma.userRoles.findMany as ReturnType<typeof mock>
			).mockResolvedValue([]);

			const result = await repository.findByUserId("user-1");

			expect(result.ok).toBe(true);
			if (result.ok) expect(result.value).toEqual([]);
		});

		test("should return error when Prisma throws", async () => {
			(
				mockPrisma.userRoles.findMany as ReturnType<typeof mock>
			).mockRejectedValue(new Error("DB error"));

			const result = await repository.findByUserId("user-1");

			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error.code).toBe("USER_ROLE_FETCH_ERROR");
		});
	});

	describe("assign()", () => {
		test("should assign role when not already assigned", async () => {
			(
				mockPrisma.userRoles.findFirst as ReturnType<typeof mock>
			).mockResolvedValue(null);
			(
				mockPrisma.userRoles.create as ReturnType<typeof mock>
			).mockResolvedValue({});

			const result = await repository.assign("user-1", "role-1", "admin-1");

			expect(result.ok).toBe(true);
		});

		test("should return ConflictError when role already assigned", async () => {
			(
				mockPrisma.userRoles.findFirst as ReturnType<typeof mock>
			).mockResolvedValue({ id: "existing" });

			const result = await repository.assign("user-1", "role-1", "admin-1");

			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error.code).toBe("CONFLICT");
		});

		test("should return error when Prisma throws", async () => {
			(
				mockPrisma.userRoles.findFirst as ReturnType<typeof mock>
			).mockResolvedValue(null);
			(
				mockPrisma.userRoles.create as ReturnType<typeof mock>
			).mockRejectedValue(new Error("DB error"));

			const result = await repository.assign("user-1", "role-1", "admin-1");

			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error.code).toBe("USER_ROLE_ASSIGN_ERROR");
		});
	});

	describe("remove()", () => {
		test("should remove role when valid input is provided", async () => {
			(
				mockPrisma.userRoles.updateMany as ReturnType<typeof mock>
			).mockResolvedValue({ count: 1 });

			const result = await repository.remove("user-1", "role-1", "admin-1");

			expect(result.ok).toBe(true);
			const updateCall = (
				mockPrisma.userRoles.updateMany as ReturnType<typeof mock>
			).mock.calls[0][0];
			expect(updateCall.data.deletedBy).toBe("admin-1");
		});

		test("should return error when Prisma throws", async () => {
			(
				mockPrisma.userRoles.updateMany as ReturnType<typeof mock>
			).mockRejectedValue(new Error("DB error"));

			const result = await repository.remove("user-1", "role-1", "admin-1");

			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error.code).toBe("USER_ROLE_REMOVE_ERROR");
		});
	});
});
