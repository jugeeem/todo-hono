import type { CategoryRepository } from "@/server/domain/repositories/category-repository";
import type { Result } from "@/server/use-cases/types";

export class DeleteCategoryUseCase {
	constructor(private readonly categoryRepository: CategoryRepository) {}

	async execute(id: string, userId: string): Promise<Result<void>> {
		return this.categoryRepository.softDelete(id, userId, userId);
	}
}
