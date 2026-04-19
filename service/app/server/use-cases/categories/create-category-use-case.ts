import type {
	CategoryDto,
	CategoryRepository,
} from "@/server/domain/repositories/category-repository";
import type { Result } from "@/server/use-cases/types";

export type CreateCategoryUseCaseInput = {
	name: string;
	description?: string;
	userId: string;
};

export class CreateCategoryUseCase {
	constructor(private readonly categoryRepository: CategoryRepository) {}

	async execute(
		input: CreateCategoryUseCaseInput,
	): Promise<Result<CategoryDto>> {
		return this.categoryRepository.create(input);
	}
}
