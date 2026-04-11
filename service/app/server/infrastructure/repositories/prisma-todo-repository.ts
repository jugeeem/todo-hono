import type { PrismaClient } from "@/prisma/generated/prisma/client";
import {
	DomainError,
	NotFoundError,
} from "@/server/domain/errors/domain-error";
import type {
	CreateTodoInput,
	TodoDto,
	TodoRepository,
	UpdateTodoInput,
} from "@/server/domain/repositories/todo-repository";
import type { Result } from "@/server/use-cases/types";
import { err, ok } from "@/server/use-cases/types";

const todoSelect = {
	id: true,
	title: true,
	description: true,
	status: true,
	priority: true,
	dueDate: true,
	completedAt: true,
	userId: true,
	categoryId: true,
	parentTodoId: true,
	createdAt: true,
	updatedAt: true,
} as const;

export class PrismaTodoRepository implements TodoRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async findAllByUserId(userId: string): Promise<Result<TodoDto[]>> {
		try {
			const todos = await this.prisma.todos.findMany({
				where: { userId, deletedAt: null },
				select: todoSelect,
				orderBy: { createdAt: "desc" },
			});
			return ok(todos);
		} catch {
			return err(
				new DomainError(
					"TODO_FETCH_ERROR",
					"Todo 情報の取得に失敗しました",
					500,
				),
			);
		}
	}

	async findByIdAndUserId(
		id: string,
		userId: string,
	): Promise<Result<TodoDto | null>> {
		try {
			const todo = await this.prisma.todos.findFirst({
				where: { id, userId, deletedAt: null },
				select: todoSelect,
			});
			return ok(todo);
		} catch {
			return err(
				new DomainError(
					"TODO_FETCH_ERROR",
					"Todo 情報の取得に失敗しました",
					500,
				),
			);
		}
	}

	async create(input: CreateTodoInput): Promise<Result<TodoDto>> {
		try {
			const todo = await this.prisma.todos.create({
				data: {
					title: input.title,
					description: input.description,
					status: input.status,
					priority: input.priority,
					dueDate: input.dueDate,
					categoryId: input.categoryId,
					parentTodoId: input.parentTodoId,
					userId: input.userId,
					createdBy: input.userId,
					updatedBy: input.userId,
				},
				select: todoSelect,
			});
			return ok(todo);
		} catch {
			return err(
				new DomainError("TODO_CREATE_ERROR", "Todo の作成に失敗しました", 500),
			);
		}
	}

	async update(
		id: string,
		userId: string,
		input: UpdateTodoInput,
	): Promise<Result<TodoDto>> {
		try {
			const existing = await this.prisma.todos.findFirst({
				where: { id, userId, deletedAt: null },
			});
			if (!existing) {
				return err(new NotFoundError("Todo が見つかりません"));
			}
			const todo = await this.prisma.todos.update({
				where: { id },
				data: {
					...(input.title !== undefined && { title: input.title }),
					...(input.description !== undefined && {
						description: input.description,
					}),
					...(input.status !== undefined && { status: input.status }),
					...(input.priority !== undefined && { priority: input.priority }),
					...(input.dueDate !== undefined && { dueDate: input.dueDate }),
					...(input.completedAt !== undefined && {
						completedAt: input.completedAt,
					}),
					...(input.categoryId !== undefined && {
						categoryId: input.categoryId,
					}),
					updatedBy: input.updatedBy,
					updatedAt: new Date(),
				},
				select: todoSelect,
			});
			return ok(todo);
		} catch (e) {
			if (e instanceof DomainError) return err(e);
			return err(
				new DomainError("TODO_UPDATE_ERROR", "Todo の更新に失敗しました", 500),
			);
		}
	}

	async softDelete(
		id: string,
		userId: string,
		deletedBy: string,
	): Promise<Result<void>> {
		try {
			const existing = await this.prisma.todos.findFirst({
				where: { id, userId, deletedAt: null },
			});
			if (!existing) {
				return err(new NotFoundError("Todo が見つかりません"));
			}
			await this.prisma.todos.update({
				where: { id },
				data: {
					deletedAt: new Date(),
					deletedBy,
					updatedAt: new Date(),
					updatedBy: deletedBy,
				},
			});
			return ok(undefined);
		} catch (e) {
			if (e instanceof DomainError) return err(e);
			return err(
				new DomainError("TODO_DELETE_ERROR", "Todo の削除に失敗しました", 500),
			);
		}
	}
}
