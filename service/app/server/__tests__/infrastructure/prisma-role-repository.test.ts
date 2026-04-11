import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { PrismaClient } from "@/prisma/generated/prisma/client";
import { PrismaRoleRepository } from "@/server/infrastructure/repositories/prisma-role-repository";

function createMockPrisma() {
	return {
		roles: {
			findMany: mock(),
			findFirst: mock(),
			create: mock(),
			update: mock(),
		},
		rolePermissions: {
			findFirst: mock(),
			create: mock(),
			updateMany: mock(),
		},
	} as unknown as PrismaClient;
}

const sampleRoleRow = {
	id: "role-1",
	name: "ADMIN",
	description: "管理者",
	createdAt: new Date("2025-01-01"),
	updatedAt: new Date("2025-01-01"),
	rolePermissions: [
		{
			permission: { id: "p1", name: "todo:read", description: null },
		},
	],
};

describe("infrastructure/repositories/prisma-role-repository", () => {
	let mockPrisma: PrismaClient;
	let repository: PrismaRoleRepository;

	beforeEach(() => {
		mockPrisma = createMockPrisma();
		repository = new PrismaRoleRepository(mockPrisma);
	});

	describe("findAll()", () => {
		test("should return mapped RoleDtos when roles exist", async () => {
			(mockPrisma.roles.findMany as ReturnType<typeof mock>).mockResolvedValue([
				sampleRoleRow,
			]);

			const result = await repository.findAll();

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toHaveLength(1);
				expect(result.value[0]?.name).toBe("ADMIN");
				expect(result.value[0]?.permissions).toHaveLength(1);
				expect(result.value[0]?.permissions[0]?.name).toBe("todo:read");
			}
		});

		test("should return empty array when no roles exist", async () => {
			(mockPrisma.roles.findMany as ReturnType<typeof mock>).mockResolvedValue(
				[],
			);

			const result = await repository.findAll();

			expect(result.ok).toBe(true);
			if (result.ok) expect(result.value).toEqual([]);
		});

		test("should return error when Prisma throws", async () => {
			(mockPrisma.roles.findMany as ReturnType<typeof mock>).mockRejectedValue(
				new Error("DB error"),
			);

			const result = await repository.findAll();

			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error.code).toBe("ROLE_FETCH_ERROR");
		});
	});

	describe("findById()", () => {
		test("should return RoleDto when role exists", async () => {
			(mockPrisma.roles.findFirst as ReturnType<typeof mock>).mockResolvedValue(
				sampleRoleRow,
			);

			const result = await repository.findById("role-1");

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value?.name).toBe("ADMIN");
			}
		});

		test("should return null when role does not exist", async () => {
			(mockPrisma.roles.findFirst as ReturnType<typeof mock>).mockResolvedValue(
				null,
			);

			const result = await repository.findById("not-found");

			expect(result.ok).toBe(true);
			if (result.ok) expect(result.value).toBeNull();
		});

		test("should return error when Prisma throws", async () => {
			(mockPrisma.roles.findFirst as ReturnType<typeof mock>).mockRejectedValue(
				new Error("DB error"),
			);

			const result = await repository.findById("role-1");

			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error.code).toBe("ROLE_FETCH_ERROR");
		});
	});

	describe("create()", () => {
		test("should create role when name is unique", async () => {
			(mockPrisma.roles.findFirst as ReturnType<typeof mock>).mockResolvedValue(
				null,
			);
			(mockPrisma.roles.create as ReturnType<typeof mock>).mockResolvedValue(
				sampleRoleRow,
			);

			const result = await repository.create({
				name: "ADMIN",
				createdBy: "user-1",
			});

			expect(result.ok).toBe(true);
			if (result.ok) expect(result.value.name).toBe("ADMIN");
		});

		test("should return ConflictError when name already exists", async () => {
			(mockPrisma.roles.findFirst as ReturnType<typeof mock>).mockResolvedValue(
				{
					id: "existing",
				},
			);

			const result = await repository.create({
				name: "ADMIN",
				createdBy: "user-1",
			});

			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error.code).toBe("CONFLICT");
		});

		test("should return error when Prisma throws", async () => {
			(mockPrisma.roles.findFirst as ReturnType<typeof mock>).mockResolvedValue(
				null,
			);
			(mockPrisma.roles.create as ReturnType<typeof mock>).mockRejectedValue(
				new Error("DB error"),
			);

			const result = await repository.create({
				name: "ADMIN",
				createdBy: "user-1",
			});

			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error.code).toBe("ROLE_CREATE_ERROR");
		});
	});

	describe("update()", () => {
		test("should update role when role exists", async () => {
			const updated = { ...sampleRoleRow, name: "SUPER_ADMIN" };
			(mockPrisma.roles.findFirst as ReturnType<typeof mock>).mockResolvedValue(
				{ id: "role-1", deletedAt: null },
			);
			(mockPrisma.roles.update as ReturnType<typeof mock>).mockResolvedValue(
				updated,
			);

			const result = await repository.update("role-1", {
				name: "SUPER_ADMIN",
				updatedBy: "user-1",
			});

			expect(result.ok).toBe(true);
			if (result.ok) expect(result.value.name).toBe("SUPER_ADMIN");
		});

		test("should return NotFoundError when role does not exist", async () => {
			(mockPrisma.roles.findFirst as ReturnType<typeof mock>).mockResolvedValue(
				null,
			);

			const result = await repository.update("not-found", {
				name: "NEW",
				updatedBy: "user-1",
			});

			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error.code).toBe("NOT_FOUND");
		});
	});

	describe("softDelete()", () => {
		test("should soft delete role when role exists", async () => {
			(mockPrisma.roles.findFirst as ReturnType<typeof mock>).mockResolvedValue(
				{ id: "role-1" },
			);
			(mockPrisma.roles.update as ReturnType<typeof mock>).mockResolvedValue(
				{},
			);

			const result = await repository.softDelete("role-1", "user-1");

			expect(result.ok).toBe(true);
			const updateCall = (mockPrisma.roles.update as ReturnType<typeof mock>)
				.mock.calls[0][0];
			expect(updateCall.data.deletedBy).toBe("user-1");
			expect(updateCall.data.deletedAt).toBeInstanceOf(Date);
		});

		test("should return NotFoundError when role does not exist", async () => {
			(mockPrisma.roles.findFirst as ReturnType<typeof mock>).mockResolvedValue(
				null,
			);

			const result = await repository.softDelete("not-found", "user-1");

			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error.code).toBe("NOT_FOUND");
		});
	});

	describe("addPermission()", () => {
		test("should add permission when not already assigned", async () => {
			(
				mockPrisma.rolePermissions.findFirst as ReturnType<typeof mock>
			).mockResolvedValue(null);
			(
				mockPrisma.rolePermissions.create as ReturnType<typeof mock>
			).mockResolvedValue({});

			const result = await repository.addPermission("role-1", "p1", "user-1");

			expect(result.ok).toBe(true);
		});

		test("should return ConflictError when permission already assigned", async () => {
			(
				mockPrisma.rolePermissions.findFirst as ReturnType<typeof mock>
			).mockResolvedValue({ id: "existing" });

			const result = await repository.addPermission("role-1", "p1", "user-1");

			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error.code).toBe("CONFLICT");
		});

		test("should return error when Prisma throws", async () => {
			(
				mockPrisma.rolePermissions.findFirst as ReturnType<typeof mock>
			).mockResolvedValue(null);
			(
				mockPrisma.rolePermissions.create as ReturnType<typeof mock>
			).mockRejectedValue(new Error("DB error"));

			const result = await repository.addPermission("role-1", "p1", "user-1");

			expect(result.ok).toBe(false);
			if (!result.ok)
				expect(result.error.code).toBe("ROLE_PERMISSION_ADD_ERROR");
		});
	});

	describe("removePermission()", () => {
		test("should remove permission when valid input is provided", async () => {
			(
				mockPrisma.rolePermissions.updateMany as ReturnType<typeof mock>
			).mockResolvedValue({ count: 1 });

			const result = await repository.removePermission(
				"role-1",
				"p1",
				"user-1",
			);

			expect(result.ok).toBe(true);
		});

		test("should return error when Prisma throws", async () => {
			(
				mockPrisma.rolePermissions.updateMany as ReturnType<typeof mock>
			).mockRejectedValue(new Error("DB error"));

			const result = await repository.removePermission(
				"role-1",
				"p1",
				"user-1",
			);

			expect(result.ok).toBe(false);
			if (!result.ok)
				expect(result.error.code).toBe("ROLE_PERMISSION_REMOVE_ERROR");
		});
	});
});
