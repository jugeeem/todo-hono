import { NotFoundError } from "@/server/domain/errors/domain-error";
import type {
	TodoCommentDto,
	TodoCommentRepository,
} from "@/server/domain/repositories/todo-comment-repository";
import type { Result } from "@/server/use-cases/types";
import { err } from "@/server/use-cases/types";

export class GetTodoCommentByIdUseCase {
	constructor(private readonly todoCommentRepository: TodoCommentRepository) {}

	async execute(id: string, todoId: string): Promise<Result<TodoCommentDto>> {
		const result = await this.todoCommentRepository.findById(id, todoId);
		if (!result.ok) return result;
		if (!result.value)
			return err(new NotFoundError("コメントが見つかりません"));
		return result as Result<TodoCommentDto>;
	}
}
