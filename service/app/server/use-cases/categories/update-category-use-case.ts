import type {
	CategoryDto,
	CategoryRepository,
} from "@/server/domain/repositories/category-repository";
import type { Result } from "@/server/use-cases/types";

export type UpdateCategoryUseCaseInput = {
	id: string;
	userId: string;
	name?: string;
	description?: string | null;
};

export class UpdateCategoryUseCase {
	constructor(private readonly categoryRepository: CategoryRepository) {}

	async execute(
		input: UpdateCategoryUseCaseInput,
	): Promise<Result<CategoryDto>> {
		const { id, userId, ...updateData } = input;
		return this.categoryRepository.update(id, userId, {
			...updateData,
			updatedBy: userId,
		});
	}
}
