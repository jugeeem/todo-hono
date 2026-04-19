import type {
	TagDto,
	TagRepository,
} from "@/server/domain/repositories/tag-repository";
import type { Result } from "@/server/use-cases/types";

export type CreateTagUseCaseInput = {
	name: string;
	userId: string;
};

export class CreateTagUseCase {
	constructor(private readonly tagRepository: TagRepository) {}

	async execute(input: CreateTagUseCaseInput): Promise<Result<TagDto>> {
		return this.tagRepository.create(input);
	}
}
