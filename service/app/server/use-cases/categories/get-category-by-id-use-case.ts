import { NotFoundError } from "@/server/domain/errors/domain-error";
import type {
	CategoryDto,
	CategoryRepository,
} from "@/server/domain/repositories/category-repository";
import type { Result } from "@/server/use-cases/types";
import { err } from "@/server/use-cases/types";

export class GetCategoryByIdUseCase {
	constructor(private readonly categoryRepository: CategoryRepository) {}

	async execute(id: string, userId: string): Promise<Result<CategoryDto>> {
		const result = await this.categoryRepository.findByIdAndUserId(id, userId);
		if (!result.ok) return result;
		if (!result.value)
			return err(new NotFoundError("カテゴリが見つかりません"));
		return result as Result<CategoryDto>;
	}
}
