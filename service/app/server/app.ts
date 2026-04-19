import { Hono } from "hono";
import { prisma } from "@/lib/prisma";
import { createAuthHandlers } from "@/server/adapters/handlers/auth-handler";
import { createCategoryHandlers } from "@/server/adapters/handlers/category-handler";
import { createPermissionHandlers } from "@/server/adapters/handlers/permission-handler";
import { createRoleHandlers } from "@/server/adapters/handlers/role-handler";
import { createTagHandlers } from "@/server/adapters/handlers/tag-handler";
import { createTodoCommentHandlers } from "@/server/adapters/handlers/todo-comment-handler";
import { createTodoHandlers } from "@/server/adapters/handlers/todo-handler";
import { createUserHandlers } from "@/server/adapters/handlers/user-handler";
import { createUserRoleHandlers } from "@/server/adapters/handlers/user-role-handler";
import { authMiddleware } from "@/server/adapters/middleware/auth-middleware";
import { errorHandler } from "@/server/adapters/middleware/error-handler";
import { requirePermission } from "@/server/adapters/middleware/require-permission";
import { createContainer } from "@/server/infrastructure/di/container";
import type { AppEnv } from "@/server/types";

export function createApp() {
	const app = new Hono<AppEnv>().basePath("/api");

	const container = createContainer(prisma);
	const {
		authService,
		permissionRepository,
		userRepository,
		roleRepository,
		userRoleRepository,
		todoRepository,
		todoCommentRepository,
		categoryRepository,
		tagRepository,
	} = container;

	app.onError(errorHandler);

	// 認証不要
	app.get("/hello", (c) => {
		return c.json({ message: "Hello from Hono!" });
	});

	// 認証済みルート共通ミドルウェア
	const auth = authMiddleware(
		authService,
		permissionRepository,
		userRepository,
	);

	// Auth
	const authHandlers = createAuthHandlers(authService);
	app.get("/auth/session", auth, authHandlers.getSession);
	app.delete("/auth/session", auth, authHandlers.logout);

	// Roles
	const roleHandlers = createRoleHandlers(roleRepository, permissionRepository);
	app.get(
		"/roles",
		auth,
		requirePermission("roles:read"),
		roleHandlers.getRoles,
	);
	app.get(
		"/roles/:id",
		auth,
		requirePermission("roles:read"),
		roleHandlers.getRoleById,
	);
	app.post(
		"/roles",
		auth,
		requirePermission("roles:write"),
		roleHandlers.createRole,
	);
	app.patch(
		"/roles/:id",
		auth,
		requirePermission("roles:write"),
		roleHandlers.updateRole,
	);
	app.delete(
		"/roles/:id",
		auth,
		requirePermission("roles:write"),
		roleHandlers.deleteRole,
	);
	app.post(
		"/roles/:id/permissions",
		auth,
		requirePermission("roles:write"),
		roleHandlers.addPermission,
	);
	app.delete(
		"/roles/:id/permissions/:permissionId",
		auth,
		requirePermission("roles:write"),
		roleHandlers.removePermission,
	);

	// Permissions
	const permissionHandlers = createPermissionHandlers(permissionRepository);
	app.get(
		"/permissions",
		auth,
		requirePermission("permissions:read"),
		permissionHandlers.getPermissions,
	);
	app.post(
		"/permissions",
		auth,
		requirePermission("permissions:write"),
		permissionHandlers.createPermission,
	);

	// User-Roles
	const userRoleHandlers = createUserRoleHandlers(userRoleRepository);
	app.get(
		"/users/:id/roles",
		auth,
		requirePermission("users:read"),
		userRoleHandlers.getUserRoles,
	);
	app.post(
		"/users/:id/roles",
		auth,
		requirePermission("users:write"),
		userRoleHandlers.assignRole,
	);
	app.delete(
		"/users/:id/roles/:roleId",
		auth,
		requirePermission("users:write"),
		userRoleHandlers.removeRole,
	);

	// Users
	const userHandlers = createUserHandlers(userRepository);
	app.get("/users/me", auth, userHandlers.getMe);
	app.patch("/users/me", auth, userHandlers.updateMe);
	app.get(
		"/users",
		auth,
		requirePermission("users:read"),
		userHandlers.getUsers,
	);
	app.get(
		"/users/:id",
		auth,
		requirePermission("users:read"),
		userHandlers.getUserById,
	);
	app.patch(
		"/users/:id",
		auth,
		requirePermission("users:write"),
		userHandlers.updateUser,
	);
	app.delete(
		"/users/:id",
		auth,
		requirePermission("users:write"),
		userHandlers.deleteUser,
	);

	// Todos
	const todoHandlers = createTodoHandlers(todoRepository);
	app.get(
		"/todos",
		auth,
		requirePermission("todos:read"),
		todoHandlers.getTodos,
	);
	app.get(
		"/todos/:id",
		auth,
		requirePermission("todos:read"),
		todoHandlers.getTodoById,
	);
	app.post(
		"/todos",
		auth,
		requirePermission("todos:write"),
		todoHandlers.createTodo,
	);
	app.patch(
		"/todos/:id",
		auth,
		requirePermission("todos:write"),
		todoHandlers.updateTodo,
	);
	app.delete(
		"/todos/:id",
		auth,
		requirePermission("todos:write"),
		todoHandlers.deleteTodo,
	);

	// Categories
	const categoryHandlers = createCategoryHandlers(categoryRepository);
	app.get(
		"/categories",
		auth,
		requirePermission("todos:read"),
		categoryHandlers.getCategories,
	);
	app.get(
		"/categories/:id",
		auth,
		requirePermission("todos:read"),
		categoryHandlers.getCategoryById,
	);
	app.post(
		"/categories",
		auth,
		requirePermission("todos:write"),
		categoryHandlers.createCategory,
	);
	app.patch(
		"/categories/:id",
		auth,
		requirePermission("todos:write"),
		categoryHandlers.updateCategory,
	);
	app.delete(
		"/categories/:id",
		auth,
		requirePermission("todos:write"),
		categoryHandlers.deleteCategory,
	);

	// Tags
	const tagHandlers = createTagHandlers(tagRepository);
	app.get("/tags", auth, requirePermission("todos:read"), tagHandlers.getTags);
	app.get(
		"/tags/:id",
		auth,
		requirePermission("todos:read"),
		tagHandlers.getTagById,
	);
	app.post(
		"/tags",
		auth,
		requirePermission("todos:write"),
		tagHandlers.createTag,
	);
	app.patch(
		"/tags/:id",
		auth,
		requirePermission("todos:write"),
		tagHandlers.updateTag,
	);
	app.delete(
		"/tags/:id",
		auth,
		requirePermission("todos:write"),
		tagHandlers.deleteTag,
	);

	// Todo Comments
	const todoCommentHandlers = createTodoCommentHandlers(todoCommentRepository);
	app.get(
		"/todos/:todoId/comments",
		auth,
		requirePermission("todos:read"),
		todoCommentHandlers.getTodoComments,
	);
	app.get(
		"/todos/:todoId/comments/:id",
		auth,
		requirePermission("todos:read"),
		todoCommentHandlers.getTodoCommentById,
	);
	app.post(
		"/todos/:todoId/comments",
		auth,
		requirePermission("todos:write"),
		todoCommentHandlers.createTodoComment,
	);
	app.patch(
		"/todos/:todoId/comments/:id",
		auth,
		requirePermission("todos:write"),
		todoCommentHandlers.updateTodoComment,
	);
	app.delete(
		"/todos/:todoId/comments/:id",
		auth,
		requirePermission("todos:write"),
		todoCommentHandlers.deleteTodoComment,
	);

	return { app, container };
}
