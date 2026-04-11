import type {
	TodoDto,
	TodoRepository,
} from "@/server/domain/repositories/todo-repository";
import type { Result } from "@/server/use-cases/types";

export class GetTodosUseCase {
	constructor(private readonly todoRepository: TodoRepository) {}

	async execute(userId: string): Promise<Result<TodoDto[]>> {
		return this.todoRepository.findAllByUserId(userId);
	}
}
