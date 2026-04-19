import type { TodoCommentRepository } from "@/server/domain/repositories/todo-comment-repository";
import type { Result } from "@/server/use-cases/types";

export class DeleteTodoCommentUseCase {
	constructor(private readonly todoCommentRepository: TodoCommentRepository) {}

	async execute(id: string, userId: string): Promise<Result<void>> {
		return this.todoCommentRepository.softDelete(id, userId, userId);
	}
}
