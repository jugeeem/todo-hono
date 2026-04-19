import type {
	TagDto,
	TagRepository,
} from "@/server/domain/repositories/tag-repository";
import type { Result } from "@/server/use-cases/types";

export type UpdateTagUseCaseInput = {
	id: string;
	userId: string;
	name?: string;
};

export class UpdateTagUseCase {
	constructor(private readonly tagRepository: TagRepository) {}

	async execute(input: UpdateTagUseCaseInput): Promise<Result<TagDto>> {
		const { id, userId, ...updateData } = input;
		return this.tagRepository.update(id, userId, {
			...updateData,
			updatedBy: userId,
		});
	}
}
