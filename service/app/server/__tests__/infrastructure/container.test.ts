import { describe, expect, test } from "bun:test";
import type { PrismaClient } from "@/prisma/generated/prisma/client";
import { createContainer } from "@/server/infrastructure/di/container";

function createMockPrisma() {
	return {} as unknown as PrismaClient;
}

describe("infrastructure/di/container", () => {
	test("should return container with all required properties when called", () => {
		const container = createContainer(createMockPrisma());

		expect(container.prisma).toBeDefined();
		expect(container.authService).toBeDefined();
		expect(container.permissionRepository).toBeDefined();
		expect(container.userRepository).toBeDefined();
		expect(container.roleRepository).toBeDefined();
		expect(container.userRoleRepository).toBeDefined();
		expect(container.todoRepository).toBeDefined();
	});

	test("should use the provided prisma instance", () => {
		const mockPrisma = createMockPrisma();
		const container = createContainer(mockPrisma);

		expect(container.prisma).toBe(mockPrisma);
	});
});
