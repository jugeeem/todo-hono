import type { TodoRepository } from "@/server/domain/repositories/todo-repository";
import type { Result } from "@/server/use-cases/types";

export class DeleteTodoUseCase {
	constructor(private readonly todoRepository: TodoRepository) {}

	async execute(id: string, userId: string): Promise<Result<void>> {
		return this.todoRepository.softDelete(id, userId, userId);
	}
}
