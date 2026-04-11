import type { Result } from "@/server/use-cases/types";

export type TodoDto = {
	id: string;
	title: string;
	description: string | null;
	status: string;
	priority: number;
	dueDate: Date | null;
	completedAt: Date | null;
	userId: string;
	categoryId: string | null;
	parentTodoId: string | null;
	createdAt: Date;
	updatedAt: Date;
};

export type CreateTodoInput = {
	title: string;
	description?: string;
	status: string;
	priority: number;
	dueDate?: Date;
	categoryId?: string;
	parentTodoId?: string;
	userId: string;
};

export type UpdateTodoInput = {
	title?: string;
	description?: string | null;
	status?: string;
	priority?: number;
	dueDate?: Date | null;
	completedAt?: Date | null;
	categoryId?: string | null;
	updatedBy: string;
};

export interface TodoRepository {
	findAllByUserId(userId: string): Promise<Result<TodoDto[]>>;
	findByIdAndUserId(
		id: string,
		userId: string,
	): Promise<Result<TodoDto | null>>;
	create(input: CreateTodoInput): Promise<Result<TodoDto>>;
	update(
		id: string,
		userId: string,
		input: UpdateTodoInput,
	): Promise<Result<TodoDto>>;
	softDelete(
		id: string,
		userId: string,
		deletedBy: string,
	): Promise<Result<void>>;
}
