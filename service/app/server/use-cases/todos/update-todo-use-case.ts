import type {
	TodoDto,
	TodoRepository,
} from "@/server/domain/repositories/todo-repository";
import type { Result } from "@/server/use-cases/types";

export type UpdateTodoUseCaseInput = {
	id: string;
	userId: string;
	title?: string;
	description?: string | null;
	status?: string;
	priority?: number;
	dueDate?: Date | null;
	completedAt?: Date | null;
	categoryId?: string | null;
};

export class UpdateTodoUseCase {
	constructor(private readonly todoRepository: TodoRepository) {}

	async execute(input: UpdateTodoUseCaseInput): Promise<Result<TodoDto>> {
		const { id, userId, ...updateData } = input;
		return this.todoRepository.update(id, userId, {
			...updateData,
			updatedBy: userId,
		});
	}
}
