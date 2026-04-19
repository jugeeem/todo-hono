import type { TagRepository } from "@/server/domain/repositories/tag-repository";
import type { Result } from "@/server/use-cases/types";

export class DeleteTagUseCase {
	constructor(private readonly tagRepository: TagRepository) {}

	async execute(id: string, userId: string): Promise<Result<void>> {
		return this.tagRepository.softDelete(id, userId, userId);
	}
}
