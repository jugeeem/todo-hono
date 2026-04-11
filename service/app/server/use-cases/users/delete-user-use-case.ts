import type { UserRepository } from "@/server/domain/repositories/user-repository";
import type { Result } from "@/server/use-cases/types";

export class DeleteUserUseCase {
	constructor(private readonly userRepository: UserRepository) {}

	async execute(id: string, deletedBy: string): Promise<Result<void>> {
		return this.userRepository.softDelete(id, deletedBy);
	}
}
