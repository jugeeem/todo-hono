import type {
	TodoCommentDto,
	TodoCommentRepository,
} from "@/server/domain/repositories/todo-comment-repository";
import type { Result } from "@/server/use-cases/types";

export type CreateTodoCommentUseCaseInput = {
	content: string;
	todoId: string;
	userId: string;
};

export class CreateTodoCommentUseCase {
	constructor(private readonly todoCommentRepository: TodoCommentRepository) {}

	async execute(
		input: CreateTodoCommentUseCaseInput,
	): Promise<Result<TodoCommentDto>> {
		return this.todoCommentRepository.create(input);
	}
}
