import type {
	CategoryDto,
	CategoryRepository,
} from "@/server/domain/repositories/category-repository";
import type { Result } from "@/server/use-cases/types";

export class GetCategoriesUseCase {
	constructor(private readonly categoryRepository: CategoryRepository) {}

	async execute(userId: string): Promise<Result<CategoryDto[]>> {
		return this.categoryRepository.findAllByUserId(userId);
	}
}
