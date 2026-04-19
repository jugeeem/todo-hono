import type {
	TodoCommentDto,
	TodoCommentRepository,
} from "@/server/domain/repositories/todo-comment-repository";
import type { Result } from "@/server/use-cases/types";

export type UpdateTodoCommentUseCaseInput = {
	id: string;
	userId: string;
	content?: string;
};

export class UpdateTodoCommentUseCase {
	constructor(private readonly todoCommentRepository: TodoCommentRepository) {}

	async execute(
		input: UpdateTodoCommentUseCaseInput,
	): Promise<Result<TodoCommentDto>> {
		const { id, userId, ...updateData } = input;
		return this.todoCommentRepository.update(id, userId, {
			...updateData,
			updatedBy: userId,
		});
	}
}
