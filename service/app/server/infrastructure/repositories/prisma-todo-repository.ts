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

const todoWithRelationsSelect = {
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
	category: {
		select: { id: true, name: true },
	},
	todoTags: {
		where: { deletedAt: null },
		select: {
			tag: {
				select: { id: true, name: true },
			},
		},
	},
	todoComments: {
		where: { deletedAt: null },
		select: { id: true, content: true, userId: true, createdAt: true },
		orderBy: { createdAt: "asc" as const },
	},
} as const;

type TodoWithRelations = {
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
	category: { id: string; name: string } | null;
	todoTags: { tag: { id: string; name: string } }[];
	todoComments: {
		id: string;
		content: string;
		userId: string;
		createdAt: Date;
	}[];
};

function toTodoDto(raw: TodoWithRelations): TodoDto {
	const { todoTags, todoComments, category, ...rest } = raw;
	return {
		...rest,
		category: category ?? null,
		tags: todoTags.map((t) => t.tag),
		comments: todoComments,
	};
}

export class PrismaTodoRepository implements TodoRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async findAllByUserId(userId: string): Promise<Result<TodoDto[]>> {
		try {
			const todos = await this.prisma.todos.findMany({
				where: { userId, deletedAt: null },
				select: todoWithRelationsSelect,
				orderBy: { createdAt: "desc" },
			});
			return ok(todos.map(toTodoDto));
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
				select: todoWithRelationsSelect,
			});
			return ok(todo ? toTodoDto(todo) : null);
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
			const result = await this.prisma.$transaction(async (tx) => {
				const created = await tx.todos.create({
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
					select: { id: true },
				});

				if (input.tagIds?.length) {
					await tx.todoTags.createMany({
						data: input.tagIds.map((tagId) => ({
							todoId: created.id,
							tagId,
							createdBy: input.userId,
							updatedBy: input.userId,
						})),
					});
				}

				if (input.comments?.length) {
					await tx.todoComments.createMany({
						data: input.comments.map((content) => ({
							content,
							todoId: created.id,
							userId: input.userId,
							createdBy: input.userId,
							updatedBy: input.userId,
						})),
					});
				}

				return tx.todos.findFirstOrThrow({
					where: { id: created.id },
					select: todoWithRelationsSelect,
				});
			});

			return ok(toTodoDto(result));
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

			const result = await this.prisma.$transaction(async (tx) => {
				await tx.todos.update({
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
				});

				if (input.tagIds !== undefined) {
					await tx.todoTags.deleteMany({ where: { todoId: id } });
					if (input.tagIds && input.tagIds.length > 0) {
						await tx.todoTags.createMany({
							data: input.tagIds.map((tagId) => ({
								todoId: id,
								tagId,
								createdBy: input.updatedBy,
								updatedBy: input.updatedBy,
							})),
						});
					}
				}

				if (input.comments?.length) {
					await tx.todoComments.createMany({
						data: input.comments.map((content) => ({
							content,
							todoId: id,
							userId,
							createdBy: userId,
							updatedBy: userId,
						})),
					});
				}

				return tx.todos.findFirstOrThrow({
					where: { id },
					select: todoWithRelationsSelect,
				});
			});

			return ok(toTodoDto(result));
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
