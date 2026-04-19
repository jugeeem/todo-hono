import type { PrismaClient } from "@/prisma/generated/prisma/client";
import type { AuthService } from "@/server/domain/repositories/auth-service";
import type { CategoryRepository } from "@/server/domain/repositories/category-repository";
import type { PermissionRepository } from "@/server/domain/repositories/permission-repository";
import type { RoleRepository } from "@/server/domain/repositories/role-repository";
import type { TagRepository } from "@/server/domain/repositories/tag-repository";
import type { TodoCommentRepository } from "@/server/domain/repositories/todo-comment-repository";
import type { TodoRepository } from "@/server/domain/repositories/todo-repository";
import type { UserRepository } from "@/server/domain/repositories/user-repository";
import type { UserRoleRepository } from "@/server/domain/repositories/user-role-repository";
import { OryAuthService } from "@/server/infrastructure/auth/ory-auth-service";
import { createOryClient } from "@/server/infrastructure/auth/ory-client";
import { PrismaCategoryRepository } from "@/server/infrastructure/repositories/prisma-category-repository";
import { PrismaPermissionRepository } from "@/server/infrastructure/repositories/prisma-permission-repository";
import { PrismaRoleRepository } from "@/server/infrastructure/repositories/prisma-role-repository";
import { PrismaTagRepository } from "@/server/infrastructure/repositories/prisma-tag-repository";
import { PrismaTodoCommentRepository } from "@/server/infrastructure/repositories/prisma-todo-comment-repository";
import { PrismaTodoRepository } from "@/server/infrastructure/repositories/prisma-todo-repository";
import { PrismaUserRepository } from "@/server/infrastructure/repositories/prisma-user-repository";
import { PrismaUserRoleRepository } from "@/server/infrastructure/repositories/prisma-user-role-repository";

export type Container = {
	prisma: PrismaClient;
	authService: AuthService;
	permissionRepository: PermissionRepository;
	userRepository: UserRepository;
	roleRepository: RoleRepository;
	userRoleRepository: UserRoleRepository;
	todoRepository: TodoRepository;
	todoCommentRepository: TodoCommentRepository;
	categoryRepository: CategoryRepository;
	tagRepository: TagRepository;
};

export function createContainer(prisma: PrismaClient): Container {
	const frontendApi = createOryClient();
	const authService = new OryAuthService(frontendApi);
	const permissionRepository = new PrismaPermissionRepository(prisma);
	const userRepository = new PrismaUserRepository(prisma);
	const roleRepository = new PrismaRoleRepository(prisma);
	const userRoleRepository = new PrismaUserRoleRepository(prisma);
	const todoRepository = new PrismaTodoRepository(prisma);
	const todoCommentRepository = new PrismaTodoCommentRepository(prisma);
	const categoryRepository = new PrismaCategoryRepository(prisma);
	const tagRepository = new PrismaTagRepository(prisma);

	return {
		prisma,
		authService,
		permissionRepository,
		userRepository,
		roleRepository,
		userRoleRepository,
		todoRepository,
		todoCommentRepository,
		categoryRepository,
		tagRepository,
	};
}
