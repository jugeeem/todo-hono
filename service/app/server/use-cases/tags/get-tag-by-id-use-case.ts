import { NotFoundError } from "@/server/domain/errors/domain-error";
import type {
	TagDto,
	TagRepository,
} from "@/server/domain/repositories/tag-repository";
import type { Result } from "@/server/use-cases/types";
import { err } from "@/server/use-cases/types";

export class GetTagByIdUseCase {
	constructor(private readonly tagRepository: TagRepository) {}

	async execute(id: string, userId: string): Promise<Result<TagDto>> {
		const result = await this.tagRepository.findByIdAndUserId(id, userId);
		if (!result.ok) return result;
		if (!result.value) return err(new NotFoundError("タグが見つかりません"));
		return result as Result<TagDto>;
	}
}
