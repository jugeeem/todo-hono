import type { Context } from "hono";
import { successResponse } from "@/server/adapters/presenters/api-response";
import {
	createTodoSchema,
	updateTodoSchema,
} from "@/server/adapters/validators/todo-validator";
import { ValidationError } from "@/server/domain/errors/domain-error";
import type { TodoRepository } from "@/server/domain/repositories/todo-repository";
import type { AppEnv } from "@/server/types";
import { CreateTodoUseCase } from "@/server/use-cases/todos/create-todo-use-case";
import { DeleteTodoUseCase } from "@/server/use-cases/todos/delete-todo-use-case";
import { GetTodoByIdUseCase } from "@/server/use-cases/todos/get-todo-by-id-use-case";
import { GetTodosUseCase } from "@/server/use-cases/todos/get-todos-use-case";
import { UpdateTodoUseCase } from "@/server/use-cases/todos/update-todo-use-case";

export function createTodoHandlers(todoRepository: TodoRepository) {
	return {
		getTodos: async (c: Context<AppEnv>) => {
			const auth = c.get("auth");
			const useCase = new GetTodosUseCase(todoRepository);
			const result = await useCase.execute(auth.user.identityId);
			if (!result.ok) throw result.error;
			return successResponse(c, result.value);
		},

		getTodoById: async (c: Context<AppEnv>) => {
			const id = c.req.param("id") ?? "";
			const auth = c.get("auth");
			const useCase = new GetTodoByIdUseCase(todoRepository);
			const result = await useCase.execute(id, auth.user.identityId);
			if (!result.ok) throw result.error;
			return successResponse(c, result.value);
		},

		createTodo: async (c: Context<AppEnv>) => {
			const body = await c.req.json();
			const parsed = createTodoSchema.safeParse(body);
			if (!parsed.success) {
				throw new ValidationError(
					parsed.error.issues[0]?.message ?? "入力が無効です",
				);
			}
			const auth = c.get("auth");
			const useCase = new CreateTodoUseCase(todoRepository);
			const result = await useCase.execute({
				...parsed.data,
				dueDate: parsed.data.dueDate
					? new Date(parsed.data.dueDate)
					: undefined,
				userId: auth.user.identityId,
			});
			if (!result.ok) throw result.error;
			return successResponse(c, result.value, 201);
		},

		updateTodo: async (c: Context<AppEnv>) => {
			const id = c.req.param("id") ?? "";
			const body = await c.req.json();
			const parsed = updateTodoSchema.safeParse(body);
			if (!parsed.success) {
				throw new ValidationError(
					parsed.error.issues[0]?.message ?? "入力が無効です",
				);
			}
			const auth = c.get("auth");
			const useCase = new UpdateTodoUseCase(todoRepository);
			const result = await useCase.execute({
				id,
				userId: auth.user.identityId,
				...parsed.data,
				dueDate:
					parsed.data.dueDate != null
						? new Date(parsed.data.dueDate)
						: parsed.data.dueDate,
				completedAt:
					parsed.data.completedAt != null
						? new Date(parsed.data.completedAt)
						: parsed.data.completedAt,
			});
			if (!result.ok) throw result.error;
			return successResponse(c, result.value);
		},

		deleteTodo: async (c: Context<AppEnv>) => {
			const id = c.req.param("id") ?? "";
			const auth = c.get("auth");
			const useCase = new DeleteTodoUseCase(todoRepository);
			const result = await useCase.execute(id, auth.user.identityId);
			if (!result.ok) throw result.error;
			return c.body(null, 204);
		},
	};
}
