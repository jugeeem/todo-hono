import { NotFoundError } from "@/server/domain/errors/domain-error";
import type {
	TodoDto,
	TodoRepository,
} from "@/server/domain/repositories/todo-repository";
import type { Result } from "@/server/use-cases/types";
import { err } from "@/server/use-cases/types";

export class GetTodoByIdUseCase {
	constructor(private readonly todoRepository: TodoRepository) {}

	async execute(id: string, userId: string): Promise<Result<TodoDto>> {
		const result = await this.todoRepository.findByIdAndUserId(id, userId);
		if (!result.ok) return result;
		if (!result.value) return err(new NotFoundError("Todo が見つかりません"));
		return result as Result<TodoDto>;
	}
}
