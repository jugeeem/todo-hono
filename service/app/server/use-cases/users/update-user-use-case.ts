import type {
	UpdateUserInput,
	UserDto,
	UserRepository,
} from "@/server/domain/repositories/user-repository";
import type { Result } from "@/server/use-cases/types";

export class UpdateUserUseCase {
	constructor(private readonly userRepository: UserRepository) {}

	async execute(id: string, input: UpdateUserInput): Promise<Result<UserDto>> {
		return this.userRepository.update(id, input);
	}
}
