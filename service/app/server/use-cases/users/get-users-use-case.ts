import type {
	UserDto,
	UserRepository,
} from "@/server/domain/repositories/user-repository";
import type { Result } from "@/server/use-cases/types";

export class GetUsersUseCase {
	constructor(private readonly userRepository: UserRepository) {}

	async execute(): Promise<Result<UserDto[]>> {
		return this.userRepository.findAll();
	}
}
