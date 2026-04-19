import type { PrismaClient } from "@/prisma/generated/prisma/client";
import {
	DomainError,
	NotFoundError,
} from "@/server/domain/errors/domain-error";
import type {
	CreateTodoCommentInput,
	TodoCommentDto,
	TodoCommentRepository,
	UpdateTodoCommentInput,
} from "@/server/domain/repositories/todo-comment-repository";
import type { Result } from "@/server/use-cases/types";
import { err, ok } from "@/server/use-cases/types";

const todoCommentSelect = {
	id: true,
	content: true,
	todoId: true,
	userId: true,
	createdAt: true,
	updatedAt: true,
} as const;

export class PrismaTodoCommentRepository implements TodoCommentRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async findAllByTodoId(
		todoId: string,
		userId: string,
	): Promise<Result<TodoCommentDto[]>> {
		try {
			const comments = await this.prisma.todoComments.findMany({
				where: {
					todoId,
					deletedAt: null,
					todo: { userId, deletedAt: null },
				},
				select: todoCommentSelect,
				orderBy: { createdAt: "asc" },
			});
			return ok(comments);
		} catch {
			return err(
				new DomainError(
					"TODO_COMMENT_FETCH_ERROR",
					"コメントの取得に失敗しました",
					500,
				),
			);
		}
	}

	async findById(
		id: string,
		todoId: string,
	): Promise<Result<TodoCommentDto | null>> {
		try {
			const comment = await this.prisma.todoComments.findFirst({
				where: { id, todoId, deletedAt: null },
				select: todoCommentSelect,
			});
			return ok(comment);
		} catch {
			return err(
				new DomainError(
					"TODO_COMMENT_FETCH_ERROR",
					"コメントの取得に失敗しました",
					500,
				),
			);
		}
	}

	async create(input: CreateTodoCommentInput): Promise<Result<TodoCommentDto>> {
		try {
			const comment = await this.prisma.todoComments.create({
				data: {
					content: input.content,
					todoId: input.todoId,
					userId: input.userId,
					createdBy: input.userId,
					updatedBy: input.userId,
				},
				select: todoCommentSelect,
			});
			return ok(comment);
		} catch {
			return err(
				new DomainError(
					"TODO_COMMENT_CREATE_ERROR",
					"コメントの作成に失敗しました",
					500,
				),
			);
		}
	}

	async update(
		id: string,
		userId: string,
		input: UpdateTodoCommentInput,
	): Promise<Result<TodoCommentDto>> {
		try {
			const existing = await this.prisma.todoComments.findFirst({
				where: { id, userId, deletedAt: null },
			});
			if (!existing) {
				return err(new NotFoundError("コメントが見つかりません"));
			}
			const comment = await this.prisma.todoComments.update({
				where: { id },
				data: {
					...(input.content !== undefined && { content: input.content }),
					updatedBy: input.updatedBy,
					updatedAt: new Date(),
				},
				select: todoCommentSelect,
			});
			return ok(comment);
		} catch (e) {
			if (e instanceof DomainError) return err(e);
			return err(
				new DomainError(
					"TODO_COMMENT_UPDATE_ERROR",
					"コメントの更新に失敗しました",
					500,
				),
			);
		}
	}

	async softDelete(
		id: string,
		userId: string,
		deletedBy: string,
	): Promise<Result<void>> {
		try {
			const existing = await this.prisma.todoComments.findFirst({
				where: { id, userId, deletedAt: null },
			});
			if (!existing) {
				return err(new NotFoundError("コメントが見つかりません"));
			}
			await this.prisma.todoComments.update({
				where: { id },
				data: { deletedAt: new Date(), deletedBy },
			});
			return ok(undefined);
		} catch (e) {
			if (e instanceof DomainError) return err(e);
			return err(
				new DomainError(
					"TODO_COMMENT_DELETE_ERROR",
					"コメントの削除に失敗しました",
					500,
				),
			);
		}
	}
}
