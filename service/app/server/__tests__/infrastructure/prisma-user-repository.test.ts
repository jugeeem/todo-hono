import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { PrismaClient } from "@/prisma/generated/prisma/client";
import type { AuthUser } from "@/server/domain/entities/auth";
import { PrismaUserRepository } from "@/server/infrastructure/repositories/prisma-user-repository";

const mockAuthUser: AuthUser = {
	identityId: "identity-uuid-123",
	email: "test@example.com",
	username: "testuser",
	sessionId: "session-123",
};

function createMockPrisma() {
	return {
		users: {
			findFirst: mock(),
			findMany: mock(),
			create: mock(),
			update: mock(),
		},
	} as unknown as PrismaClient;
}

describe("infrastructure/repositories/prisma-user-repository", () => {
	let mockPrisma: PrismaClient;
	let repository: PrismaUserRepository;

	beforeEach(() => {
		mockPrisma = createMockPrisma();
		repository = new PrismaUserRepository(mockPrisma);
	});

	describe("findById()", () => {
		test("should return user when user exists", async () => {
			// Arrange
			const mockUser = { id: "identity-uuid-123", email: "test@example.com" };
			(mockPrisma.users.findFirst as ReturnType<typeof mock>).mockResolvedValue(
				mockUser,
			);

			// Act
			const result = await repository.findById("identity-uuid-123");

			// Assert
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value?.id).toBe(mockUser.id);
				expect(result.value?.email).toBe(mockUser.email);
			}
		});

		test("should return null when user does not exist", async () => {
			// Arrange
			(mockPrisma.users.findFirst as ReturnType<typeof mock>).mockResolvedValue(
				null,
			);

			// Act
			const result = await repository.findById("non-existent-id");

			// Assert
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBeNull();
			}
		});

		test("should return error when Prisma throws", async () => {
			// Arrange
			(mockPrisma.users.findFirst as ReturnType<typeof mock>).mockRejectedValue(
				new Error("DB connection error"),
			);

			// Act
			const result = await repository.findById("identity-uuid-123");

			// Assert
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.code).toBe("USER_FETCH_ERROR");
				expect(result.error.statusCode).toBe(500);
			}
		});
	});

	describe("create()", () => {
		test("should create user with identityId as id and MANAGED_BY_KRATOS as password", async () => {
			// Arrange
			const mockCreated = {
				id: mockAuthUser.identityId,
				email: mockAuthUser.email,
				username: mockAuthUser.username,
				password: "MANAGED_BY_KRATOS",
			};
			(mockPrisma.users.create as ReturnType<typeof mock>).mockResolvedValue(
				mockCreated,
			);

			// Act
			const result = await repository.create(mockAuthUser);

			// Assert
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.id).toBe(mockAuthUser.identityId);
				expect(result.value.password).toBe("MANAGED_BY_KRATOS");
			}
			const createCall = (mockPrisma.users.create as ReturnType<typeof mock>)
				.mock.calls[0][0];
			expect(createCall.data.id).toBe(mockAuthUser.identityId);
			expect(createCall.data.createdBy).toBe(mockAuthUser.identityId);
		});

		test("should return error when Prisma throws", async () => {
			// Arrange
			(mockPrisma.users.create as ReturnType<typeof mock>).mockRejectedValue(
				new Error("DB error"),
			);

			// Act
			const result = await repository.create(mockAuthUser);

			// Assert
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.code).toBe("USER_CREATE_ERROR");
			}
		});
	});

	describe("findAll()", () => {
		test("should return all active users", async () => {
			// Arrange
			const mockUsers = [
				{
					id: "uuid-1",
					username: "user1",
					email: "user1@example.com",
					createdAt: new Date("2025-01-01"),
					updatedAt: new Date("2025-01-01"),
				},
				{
					id: "uuid-2",
					username: "user2",
					email: "user2@example.com",
					createdAt: new Date("2025-01-02"),
					updatedAt: new Date("2025-01-02"),
				},
			];
			(mockPrisma.users.findMany as ReturnType<typeof mock>).mockResolvedValue(
				mockUsers,
			);

			// Act
			const result = await repository.findAll();

			// Assert
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toHaveLength(2);
				expect(result.value[0]?.username).toBe("user1");
				expect(result.value[1]?.username).toBe("user2");
			}
		});

		test("should return error when Prisma throws", async () => {
			// Arrange
			(mockPrisma.users.findMany as ReturnType<typeof mock>).mockRejectedValue(
				new Error("DB connection error"),
			);

			// Act
			const result = await repository.findAll();

			// Assert
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.code).toBe("USER_FETCH_ERROR");
				expect(result.error.statusCode).toBe(500);
			}
		});
	});

	describe("findDtoById()", () => {
		test("should return UserDto when user exists", async () => {
			// Arrange
			const mockUser = {
				id: "identity-uuid-123",
				username: "testuser",
				email: "test@example.com",
				createdAt: new Date("2025-01-01"),
				updatedAt: new Date("2025-01-01"),
			};
			(mockPrisma.users.findFirst as ReturnType<typeof mock>).mockResolvedValue(
				mockUser,
			);

			// Act
			const result = await repository.findDtoById("identity-uuid-123");

			// Assert
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value?.id).toBe("identity-uuid-123");
				expect(result.value?.username).toBe("testuser");
			}
		});

		test("should return null when user does not exist", async () => {
			// Arrange
			(mockPrisma.users.findFirst as ReturnType<typeof mock>).mockResolvedValue(
				null,
			);

			// Act
			const result = await repository.findDtoById("non-existent-id");

			// Assert
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBeNull();
			}
		});
	});

	describe("update()", () => {
		test("should update username and return UserDto when user exists", async () => {
			// Arrange
			const existingUser = {
				id: "uuid-1",
				username: "oldname",
				email: "test@example.com",
				password: "MANAGED_BY_KRATOS",
				createdAt: new Date("2025-01-01"),
				updatedAt: new Date("2025-01-01"),
				deletedAt: null,
				deletedBy: null,
				createdBy: "uuid-1",
				updatedBy: "uuid-1",
			};
			const updatedUser = {
				id: "uuid-1",
				username: "newname",
				email: "test@example.com",
				createdAt: new Date("2025-01-01"),
				updatedAt: new Date("2025-01-02"),
			};
			(mockPrisma.users.findFirst as ReturnType<typeof mock>)
				.mockResolvedValueOnce(existingUser) // existing check
				.mockResolvedValueOnce(null); // conflict check
			(mockPrisma.users.update as ReturnType<typeof mock>).mockResolvedValue(
				updatedUser,
			);

			// Act
			const result = await repository.update("uuid-1", {
				username: "newname",
				updatedBy: "uuid-1",
			});

			// Assert
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.username).toBe("newname");
			}
		});

		test("should return NotFoundError when user does not exist", async () => {
			// Arrange
			(mockPrisma.users.findFirst as ReturnType<typeof mock>).mockResolvedValue(
				null,
			);

			// Act
			const result = await repository.update("non-existent", {
				username: "newname",
				updatedBy: "uuid-1",
			});

			// Assert
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.code).toBe("NOT_FOUND");
				expect(result.error.statusCode).toBe(404);
			}
		});

		test("should return ConflictError when username is already taken", async () => {
			// Arrange
			const existingUser = {
				id: "uuid-1",
				username: "oldname",
				email: "test@example.com",
				deletedAt: null,
			};
			const conflictUser = { id: "uuid-2", username: "takenname" };
			(mockPrisma.users.findFirst as ReturnType<typeof mock>)
				.mockResolvedValueOnce(existingUser)
				.mockResolvedValueOnce(conflictUser);

			// Act
			const result = await repository.update("uuid-1", {
				username: "takenname",
				updatedBy: "uuid-1",
			});

			// Assert
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.code).toBe("CONFLICT");
				expect(result.error.statusCode).toBe(409);
			}
		});
	});

	describe("softDelete()", () => {
		test("should soft delete user when user exists", async () => {
			// Arrange
			const existingUser = {
				id: "uuid-1",
				username: "testuser",
				deletedAt: null,
			};
			(mockPrisma.users.findFirst as ReturnType<typeof mock>).mockResolvedValue(
				existingUser,
			);
			(mockPrisma.users.update as ReturnType<typeof mock>).mockResolvedValue(
				existingUser,
			);

			// Act
			const result = await repository.softDelete("uuid-1", "admin-uuid");

			// Assert
			expect(result.ok).toBe(true);
			const updateCall = (mockPrisma.users.update as ReturnType<typeof mock>)
				.mock.calls[0][0];
			expect(updateCall.data.deletedBy).toBe("admin-uuid");
			expect(updateCall.data.deletedAt).toBeInstanceOf(Date);
		});

		test("should return NotFoundError when user does not exist", async () => {
			// Arrange
			(mockPrisma.users.findFirst as ReturnType<typeof mock>).mockResolvedValue(
				null,
			);

			// Act
			const result = await repository.softDelete("non-existent", "admin-uuid");

			// Assert
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.code).toBe("NOT_FOUND");
				expect(result.error.statusCode).toBe(404);
			}
		});
	});
});
