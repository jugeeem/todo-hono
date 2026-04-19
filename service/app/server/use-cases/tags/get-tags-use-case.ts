import type {
	TagDto,
	TagRepository,
} from "@/server/domain/repositories/tag-repository";
import type { Result } from "@/server/use-cases/types";

export class GetTagsUseCase {
	constructor(private readonly tagRepository: TagRepository) {}

	async execute(userId: string): Promise<Result<TagDto[]>> {
		return this.tagRepository.findAllByUserId(userId);
	}
}
