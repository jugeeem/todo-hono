import { describe, expect, test } from "bun:test";
import {
	DomainError,
	NotFoundError,
} from "@/server/domain/errors/domain-error";
import type { UserRepository } from "@/server/domain/repositories/user-repository";
import { err, ok } from "@/server/use-cases/types";
import { DeleteUserUseCase } from "@/server/use-cases/users/delete-user-use-case";
import { GetUserByIdUseCase } from "@/server/use-cases/users/get-user-by-id-use-case";
import { GetUsersUseCase } from "@/server/use-cases/users/get-users-use-case";
import { UpdateUserUseCase } from "@/server/use-cases/users/update-user-use-case";

function createMockUserRepository(
	overrides?: Partial<UserRepository>,
): UserRepository {
	return {
		findAll: async () =>
			ok([
				{
					id: "u1",
					username: "user1",
					email: "user1@example.com",
					userInfo: null,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			]),
		findById: async () => ok(null),
		findDtoById: async () =>
			ok({
				id: "u1",
				username: "user1",
				email: "user1@example.com",
				userInfo: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			}),
		create: async () => ({ id: "u1" }) as never,
		update: async () =>
			ok({
				id: "u1",
				username: "updated",
				email: "user1@example.com",
				userInfo: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			}),
		softDelete: async () => ok(undefined),
		...overrides,
	};
}

describe("use-cases/users", () => {
	describe("GetUsersUseCase", () => {
		test("should return users list when repository succeeds", async () => {
			const repo = createMockUserRepository();
			const result = await new GetUsersUseCase(repo).execute();

			expect(result.ok).toBe(true);
			if (result.ok) expect(result.value).toHaveLength(1);
		});

		test("should return error when repository fails", async () => {
			const repo = createMockUserRepository({
				findAll: async () =>
					err(new DomainError("USER_FETCH_ERROR", "取得失敗", 500)),
			});
			const result = await new GetUsersUseCase(repo).execute();

			expect(result.ok).toBe(false);
		});
	});

	describe("GetUserByIdUseCase", () => {
		test("should return user when found", async () => {
			const repo = createMockUserRepository();
			const result = await new GetUserByIdUseCase(repo).execute("u1");

			expect(result.ok).toBe(true);
			if (result.ok) expect(result.value.username).toBe("user1");
		});

		test("should return NotFoundError when user is null", async () => {
			const repo = createMockUserRepository({
				findDtoById: async () => ok(null),
			});
			const result = await new GetUserByIdUseCase(repo).execute("not-found");

			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error).toBeInstanceOf(NotFoundError);
		});

		test("should return error when repository fails", async () => {
			const repo = createMockUserRepository({
				findDtoById: async () =>
					err(new DomainError("USER_FETCH_ERROR", "取得失敗", 500)),
			});
			const result = await new GetUserByIdUseCase(repo).execute("u1");

			expect(result.ok).toBe(false);
		});
	});

	describe("UpdateUserUseCase", () => {
		test("should update user when valid input is provided", async () => {
			const repo = createMockUserRepository();
			const result = await new UpdateUserUseCase(repo).execute("u1", {
				username: "updated",
				updatedBy: "admin",
			});

			expect(result.ok).toBe(true);
		});

		test("should return error when repository fails", async () => {
			const repo = createMockUserRepository({
				update: async () => err(new NotFoundError("ユーザーが見つかりません")),
			});
			const result = await new UpdateUserUseCase(repo).execute("not-found", {
				username: "updated",
				updatedBy: "admin",
			});

			expect(result.ok).toBe(false);
		});
	});

	describe("DeleteUserUseCase", () => {
		test("should delete user when valid id is provided", async () => {
			const repo = createMockUserRepository();
			const result = await new DeleteUserUseCase(repo).execute("u1", "admin");

			expect(result.ok).toBe(true);
		});

		test("should return error when repository fails", async () => {
			const repo = createMockUserRepository({
				softDelete: async () =>
					err(new NotFoundError("ユーザーが見つかりません")),
			});
			const result = await new DeleteUserUseCase(repo).execute(
				"not-found",
				"admin",
			);

			expect(result.ok).toBe(false);
		});
	});
});
