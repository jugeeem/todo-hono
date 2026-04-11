import { describe, expect, test } from "bun:test";
import { DomainError } from "@/server/domain/errors/domain-error";
import type { PermissionRepository } from "@/server/domain/repositories/permission-repository";
import { CreatePermissionUseCase } from "@/server/use-cases/permissions/create-permission-use-case";
import { GetPermissionsUseCase } from "@/server/use-cases/permissions/get-permissions-use-case";
import { err, ok } from "@/server/use-cases/types";

function createMockPermissionRepository(
	overrides?: Partial<PermissionRepository>,
): PermissionRepository {
	return {
		getPermissionsByUserId: async () => ok([]),
		findAll: async () => ok([]),
		findById: async () => ok(null),
		create: async () =>
			ok({ id: "perm-1", name: "todo:read", description: null }),
		...overrides,
	};
}

describe("use-cases/permissions", () => {
	describe("GetPermissionsUseCase", () => {
		test("should return permissions list when repository succeeds", async () => {
			const permissions = [
				{ id: "p1", name: "todo:read", description: null },
				{ id: "p2", name: "todo:write", description: "書き込み" },
			];
			const repo = createMockPermissionRepository({
				findAll: async () => ok(permissions),
			});
			const useCase = new GetPermissionsUseCase(repo);

			const result = await useCase.execute();

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toHaveLength(2);
				expect(result.value[0]?.name).toBe("todo:read");
			}
		});

		test("should return error when repository fails", async () => {
			const repo = createMockPermissionRepository({
				findAll: async () =>
					err(new DomainError("PERMISSION_FETCH_ERROR", "取得失敗", 500)),
			});
			const useCase = new GetPermissionsUseCase(repo);

			const result = await useCase.execute();

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.code).toBe("PERMISSION_FETCH_ERROR");
			}
		});
	});

	describe("CreatePermissionUseCase", () => {
		test("should create permission when valid input is provided", async () => {
			const created = {
				id: "perm-new",
				name: "roles:read",
				description: "ロール参照",
			};
			const repo = createMockPermissionRepository({
				create: async () => ok(created),
			});
			const useCase = new CreatePermissionUseCase(repo);

			const result = await useCase.execute({
				name: "roles:read",
				description: "ロール参照",
				createdBy: "user-1",
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.name).toBe("roles:read");
			}
		});

		test("should return error when repository fails", async () => {
			const repo = createMockPermissionRepository({
				create: async () =>
					err(new DomainError("PERMISSION_CREATE_ERROR", "作成失敗", 500)),
			});
			const useCase = new CreatePermissionUseCase(repo);

			const result = await useCase.execute({
				name: "roles:read",
				createdBy: "user-1",
			});

			expect(result.ok).toBe(false);
		});
	});
});
