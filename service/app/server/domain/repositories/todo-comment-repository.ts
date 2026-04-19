import type { Result } from "@/server/use-cases/types";

export type TodoCommentDto = {
	id: string;
	content: string;
	todoId: string;
	userId: string;
	createdAt: Date;
	updatedAt: Date;
};

export type CreateTodoCommentInput = {
	content: string;
	todoId: string;
	userId: string;
};

export type UpdateTodoCommentInput = {
	content?: string;
	updatedBy: string;
};

export interface TodoCommentRepository {
	findAllByTodoId(
		todoId: string,
		userId: string,
	): Promise<Result<TodoCommentDto[]>>;
	findById(id: string, todoId: string): Promise<Result<TodoCommentDto | null>>;
	create(input: CreateTodoCommentInput): Promise<Result<TodoCommentDto>>;
	update(
		id: string,
		userId: string,
		input: UpdateTodoCommentInput,
	): Promise<Result<TodoCommentDto>>;
	softDelete(
		id: string,
		userId: string,
		deletedBy: string,
	): Promise<Result<void>>;
}
