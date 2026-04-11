import { describe, expect, test } from "bun:test";
import { DomainError } from "@/server/domain/errors/domain-error";
import type { UserRoleRepository } from "@/server/domain/repositories/user-role-repository";
import { err, ok } from "@/server/use-cases/types";
import { AssignRoleToUserUseCase } from "@/server/use-cases/user-roles/assign-role-to-user-use-case";
import { GetUserRolesUseCase } from "@/server/use-cases/user-roles/get-user-roles-use-case";
import { RemoveRoleFromUserUseCase } from "@/server/use-cases/user-roles/remove-role-from-user-use-case";

function createMockUserRoleRepository(
	overrides?: Partial<UserRoleRepository>,
): UserRoleRepository {
	return {
		findByUserId: async () =>
			ok([
				{
					id: "ur-1",
					roleId: "role-1",
					roleName: "ADMIN",
					roleDescription: "管理者",
					assignedAt: new Date("2025-01-01"),
				},
			]),
		assign: async () => ok(undefined),
		remove: async () => ok(undefined),
		...overrides,
	};
}

describe("use-cases/user-roles", () => {
	describe("GetUserRolesUseCase", () => {
		test("should return user roles when repository succeeds", async () => {
			const repo = createMockUserRoleRepository();
			const result = await new GetUserRolesUseCase(repo).execute("user-1");

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toHaveLength(1);
				expect(result.value[0]?.roleName).toBe("ADMIN");
			}
		});

		test("should return error when repository fails", async () => {
			const repo = createMockUserRoleRepository({
				findByUserId: async () =>
					err(new DomainError("USER_ROLE_FETCH_ERROR", "取得失敗", 500)),
			});
			const result = await new GetUserRolesUseCase(repo).execute("user-1");

			expect(result.ok).toBe(false);
		});
	});

	describe("AssignRoleToUserUseCase", () => {
		test("should assign role when valid input is provided", async () => {
			const repo = createMockUserRoleRepository();
			const result = await new AssignRoleToUserUseCase(repo).execute(
				"user-1",
				"role-1",
				"admin-1",
			);

			expect(result.ok).toBe(true);
		});

		test("should return error when repository fails", async () => {
			const repo = createMockUserRoleRepository({
				assign: async () =>
					err(new DomainError("USER_ROLE_ASSIGN_ERROR", "割当失敗", 500)),
			});
			const result = await new AssignRoleToUserUseCase(repo).execute(
				"user-1",
				"role-1",
				"admin-1",
			);

			expect(result.ok).toBe(false);
		});
	});

	describe("RemoveRoleFromUserUseCase", () => {
		test("should remove role when valid input is provided", async () => {
			const repo = createMockUserRoleRepository();
			const result = await new RemoveRoleFromUserUseCase(repo).execute(
				"user-1",
				"role-1",
				"admin-1",
			);

			expect(result.ok).toBe(true);
		});

		test("should return error when repository fails", async () => {
			const repo = createMockUserRoleRepository({
				remove: async () =>
					err(new DomainError("USER_ROLE_REMOVE_ERROR", "削除失敗", 500)),
			});
			const result = await new RemoveRoleFromUserUseCase(repo).execute(
				"user-1",
				"role-1",
				"admin-1",
			);

			expect(result.ok).toBe(false);
		});
	});
});
