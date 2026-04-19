import type { Result } from "@/server/use-cases/types";

export type TodoTagInfo = {
	id: string;
	name: string;
};

export type TodoCategoryInfo = {
	id: string;
	name: string;
};

export type TodoCommentInfo = {
	id: string;
	content: string;
	userId: string;
	createdAt: Date;
};

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
	category: TodoCategoryInfo | null;
	tags: TodoTagInfo[];
	comments: TodoCommentInfo[];
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
	tagIds?: string[];
	comments?: string[];
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
	tagIds?: string[] | null;
	comments?: string[];
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
