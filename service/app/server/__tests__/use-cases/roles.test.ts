import { describe, expect, test } from "bun:test";
import {
	DomainError,
	NotFoundError,
} from "@/server/domain/errors/domain-error";
import type { PermissionRepository } from "@/server/domain/repositories/permission-repository";
import type {
	RoleDto,
	RoleRepository,
} from "@/server/domain/repositories/role-repository";
import { AddPermissionToRoleUseCase } from "@/server/use-cases/roles/add-permission-to-role-use-case";
import { CreateRoleUseCase } from "@/server/use-cases/roles/create-role-use-case";
import { DeleteRoleUseCase } from "@/server/use-cases/roles/delete-role-use-case";
import { GetRoleByIdUseCase } from "@/server/use-cases/roles/get-role-by-id-use-case";
import { GetRolesUseCase } from "@/server/use-cases/roles/get-roles-use-case";
import { RemovePermissionFromRoleUseCase } from "@/server/use-cases/roles/remove-permission-from-role-use-case";
import { UpdateRoleUseCase } from "@/server/use-cases/roles/update-role-use-case";
import { err, ok } from "@/server/use-cases/types";

const sampleRole: RoleDto = {
	id: "role-1",
	name: "ADMIN",
	description: "管理者",
	createdAt: new Date("2025-01-01"),
	updatedAt: new Date("2025-01-01"),
	permissions: [{ id: "p1", name: "todo:read", description: null }],
};

function createMockRoleRepository(
	overrides?: Partial<RoleRepository>,
): RoleRepository {
	return {
		findAll: async () => ok([sampleRole]),
		findById: async () => ok(sampleRole),
		create: async () => ok(sampleRole),
		update: async () => ok(sampleRole),
		softDelete: async () => ok(undefined),
		addPermission: async () => ok(undefined),
		removePermission: async () => ok(undefined),
		...overrides,
	};
}

function createMockPermissionRepository(
	overrides?: Partial<PermissionRepository>,
): PermissionRepository {
	return {
		getPermissionsByUserId: async () => ok([]),
		findAll: async () => ok([]),
		findById: async () =>
			ok({ id: "p1", name: "todo:read", description: null }),
		create: async () => ok({ id: "p1", name: "todo:read", description: null }),
		...overrides,
	};
}

describe("use-cases/roles", () => {
	describe("GetRolesUseCase", () => {
		test("should return roles list when repository succeeds", async () => {
			const repo = createMockRoleRepository();
			const result = await new GetRolesUseCase(repo).execute();

			expect(result.ok).toBe(true);
			if (result.ok) expect(result.value).toHaveLength(1);
		});

		test("should return error when repository fails", async () => {
			const repo = createMockRoleRepository({
				findAll: async () =>
					err(new DomainError("ROLE_FETCH_ERROR", "取得失敗", 500)),
			});
			const result = await new GetRolesUseCase(repo).execute();

			expect(result.ok).toBe(false);
		});
	});

	describe("GetRoleByIdUseCase", () => {
		test("should return role when found", async () => {
			const repo = createMockRoleRepository();
			const result = await new GetRoleByIdUseCase(repo).execute("role-1");

			expect(result.ok).toBe(true);
			if (result.ok) expect(result.value.name).toBe("ADMIN");
		});

		test("should return NotFoundError when role is null", async () => {
			const repo = createMockRoleRepository({
				findById: async () => ok(null),
			});
			const result = await new GetRoleByIdUseCase(repo).execute("not-found");

			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error).toBeInstanceOf(NotFoundError);
		});

		test("should return error when repository fails", async () => {
			const repo = createMockRoleRepository({
				findById: async () =>
					err(new DomainError("ROLE_FETCH_ERROR", "取得失敗", 500)),
			});
			const result = await new GetRoleByIdUseCase(repo).execute("role-1");

			expect(result.ok).toBe(false);
		});
	});

	describe("CreateRoleUseCase", () => {
		test("should create role when valid input is provided", async () => {
			const repo = createMockRoleRepository();
			const result = await new CreateRoleUseCase(repo).execute({
				name: "ADMIN",
				createdBy: "user-1",
			});

			expect(result.ok).toBe(true);
		});

		test("should return error when repository fails", async () => {
			const repo = createMockRoleRepository({
				create: async () =>
					err(new DomainError("ROLE_CREATE_ERROR", "作成失敗", 500)),
			});
			const result = await new CreateRoleUseCase(repo).execute({
				name: "ADMIN",
				createdBy: "user-1",
			});

			expect(result.ok).toBe(false);
		});
	});

	describe("UpdateRoleUseCase", () => {
		test("should update role when valid input is provided", async () => {
			const repo = createMockRoleRepository();
			const result = await new UpdateRoleUseCase(repo).execute({
				id: "role-1",
				name: "SUPER_ADMIN",
				updatedBy: "user-1",
			});

			expect(result.ok).toBe(true);
		});

		test("should return error when repository fails", async () => {
			const repo = createMockRoleRepository({
				update: async () =>
					err(new DomainError("ROLE_UPDATE_ERROR", "更新失敗", 500)),
			});
			const result = await new UpdateRoleUseCase(repo).execute({
				id: "role-1",
				name: "NEW",
				updatedBy: "user-1",
			});

			expect(result.ok).toBe(false);
		});
	});

	describe("DeleteRoleUseCase", () => {
		test("should delete role when id and deletedBy are provided", async () => {
			const repo = createMockRoleRepository();
			const result = await new DeleteRoleUseCase(repo).execute(
				"role-1",
				"user-1",
			);

			expect(result.ok).toBe(true);
		});

		test("should return error when repository fails", async () => {
			const repo = createMockRoleRepository({
				softDelete: async () =>
					err(new NotFoundError("ロールが見つかりません")),
			});
			const result = await new DeleteRoleUseCase(repo).execute(
				"not-found",
				"user-1",
			);

			expect(result.ok).toBe(false);
		});
	});

	describe("AddPermissionToRoleUseCase", () => {
		test("should add permission when role and permission exist", async () => {
			const roleRepo = createMockRoleRepository();
			const permRepo = createMockPermissionRepository();
			const useCase = new AddPermissionToRoleUseCase(roleRepo, permRepo);

			const result = await useCase.execute("role-1", "p1", "user-1");

			expect(result.ok).toBe(true);
		});

		test("should return NotFoundError when role does not exist", async () => {
			const roleRepo = createMockRoleRepository({
				findById: async () => ok(null),
			});
			const permRepo = createMockPermissionRepository();
			const useCase = new AddPermissionToRoleUseCase(roleRepo, permRepo);

			const result = await useCase.execute("not-found", "p1", "user-1");

			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error).toBeInstanceOf(NotFoundError);
		});

		test("should return NotFoundError when permission does not exist", async () => {
			const roleRepo = createMockRoleRepository();
			const permRepo = createMockPermissionRepository({
				findById: async () => ok(null),
			});
			const useCase = new AddPermissionToRoleUseCase(roleRepo, permRepo);

			const result = await useCase.execute("role-1", "not-found", "user-1");

			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error).toBeInstanceOf(NotFoundError);
		});

		test("should return error when role repository findById fails", async () => {
			const roleRepo = createMockRoleRepository({
				findById: async () =>
					err(new DomainError("ROLE_FETCH_ERROR", "取得失敗", 500)),
			});
			const permRepo = createMockPermissionRepository();
			const useCase = new AddPermissionToRoleUseCase(roleRepo, permRepo);

			const result = await useCase.execute("role-1", "p1", "user-1");

			expect(result.ok).toBe(false);
		});
	});

	describe("RemovePermissionFromRoleUseCase", () => {
		test("should remove permission when valid input is provided", async () => {
			const repo = createMockRoleRepository();
			const useCase = new RemovePermissionFromRoleUseCase(repo);

			const result = await useCase.execute("role-1", "p1", "user-1");

			expect(result.ok).toBe(true);
		});

		test("should return error when repository fails", async () => {
			const repo = createMockRoleRepository({
				removePermission: async () =>
					err(new DomainError("ROLE_PERMISSION_REMOVE_ERROR", "削除失敗", 500)),
			});
			const useCase = new RemovePermissionFromRoleUseCase(repo);

			const result = await useCase.execute("role-1", "p1", "user-1");

			expect(result.ok).toBe(false);
		});
	});
});
