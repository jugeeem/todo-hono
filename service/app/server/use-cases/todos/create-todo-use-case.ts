import type {
	TodoDto,
	TodoRepository,
} from "@/server/domain/repositories/todo-repository";
import type { Result } from "@/server/use-cases/types";

export type CreateTodoUseCaseInput = {
	title: string;
	description?: string;
	status: string;
	priority: number;
	dueDate?: Date;
	categoryId?: string;
	parentTodoId?: string;
	userId: string;
};

export class CreateTodoUseCase {
	constructor(private readonly todoRepository: TodoRepository) {}

	async execute(input: CreateTodoUseCaseInput): Promise<Result<TodoDto>> {
		return this.todoRepository.create(input);
	}
}
