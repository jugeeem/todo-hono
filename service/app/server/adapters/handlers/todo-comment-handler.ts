import type { Context } from "hono";
import { successResponse } from "@/server/adapters/presenters/api-response";
import {
	createTodoCommentSchema,
	updateTodoCommentSchema,
} from "@/server/adapters/validators/todo-comment-validator";
import { ValidationError } from "@/server/domain/errors/domain-error";
import type { TodoCommentRepository } from "@/server/domain/repositories/todo-comment-repository";
import type { AppEnv } from "@/server/types";
import { CreateTodoCommentUseCase } from "@/server/use-cases/todo-comments/create-todo-comment-use-case";
import { DeleteTodoCommentUseCase } from "@/server/use-cases/todo-comments/delete-todo-comment-use-case";
import { GetTodoCommentByIdUseCase } from "@/server/use-cases/todo-comments/get-todo-comment-by-id-use-case";
import { GetTodoCommentsUseCase } from "@/server/use-cases/todo-comments/get-todo-comments-use-case";
import { UpdateTodoCommentUseCase } from "@/server/use-cases/todo-comments/update-todo-comment-use-case";

export function createTodoCommentHandlers(
	todoCommentRepository: TodoCommentRepository,
) {
	return {
		getTodoComments: async (c: Context<AppEnv>) => {
			const todoId = c.req.param("todoId") ?? "";
			const auth = c.get("auth");
			const useCase = new GetTodoCommentsUseCase(todoCommentRepository);
			const result = await useCase.execute(todoId, auth.user.identityId);
			if (!result.ok) throw result.error;
			return successResponse(c, result.value);
		},

		getTodoCommentById: async (c: Context<AppEnv>) => {
			const todoId = c.req.param("todoId") ?? "";
			const id = c.req.param("id") ?? "";
			const useCase = new GetTodoCommentByIdUseCase(todoCommentRepository);
			const result = await useCase.execute(id, todoId);
			if (!result.ok) throw result.error;
			return successResponse(c, result.value);
		},

		createTodoComment: async (c: Context<AppEnv>) => {
			const todoId = c.req.param("todoId") ?? "";
			const body = await c.req.json();
			const parsed = createTodoCommentSchema.safeParse(body);
			if (!parsed.success) {
				throw new ValidationError(
					parsed.error.issues[0]?.message ?? "入力が無効です",
				);
			}
			const auth = c.get("auth");
			const useCase = new CreateTodoCommentUseCase(todoCommentRepository);
			const result = await useCase.execute({
				...parsed.data,
				todoId,
				userId: auth.user.identityId,
			});
			if (!result.ok) throw result.error;
			return successResponse(c, result.value, 201);
		},

		updateTodoComment: async (c: Context<AppEnv>) => {
			const id = c.req.param("id") ?? "";
			const body = await c.req.json();
			const parsed = updateTodoCommentSchema.safeParse(body);
			if (!parsed.success) {
				throw new ValidationError(
					parsed.error.issues[0]?.message ?? "入力が無効です",
				);
			}
			const auth = c.get("auth");
			const useCase = new UpdateTodoCommentUseCase(todoCommentRepository);
			const result = await useCase.execute({
				id,
				userId: auth.user.identityId,
				...parsed.data,
			});
			if (!result.ok) throw result.error;
			return successResponse(c, result.value);
		},

		deleteTodoComment: async (c: Context<AppEnv>) => {
			const id = c.req.param("id") ?? "";
			const auth = c.get("auth");
			const useCase = new DeleteTodoCommentUseCase(todoCommentRepository);
			const result = await useCase.execute(id, auth.user.identityId);
			if (!result.ok) throw result.error;
			return c.body(null, 204);
		},
	};
}
