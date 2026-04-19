import type {
	TodoCommentDto,
	TodoCommentRepository,
} from "@/server/domain/repositories/todo-comment-repository";
import type { Result } from "@/server/use-cases/types";

export class GetTodoCommentsUseCase {
	constructor(private readonly todoCommentRepository: TodoCommentRepository) {}

	async execute(
		todoId: string,
		userId: string,
	): Promise<Result<TodoCommentDto[]>> {
		return this.todoCommentRepository.findAllByTodoId(todoId, userId);
	}
}
