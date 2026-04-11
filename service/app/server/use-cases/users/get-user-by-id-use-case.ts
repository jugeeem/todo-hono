import { NotFoundError } from "@/server/domain/errors/domain-error";
import type {
	UserDto,
	UserRepository,
} from "@/server/domain/repositories/user-repository";
import type { Result } from "@/server/use-cases/types";
import { err } from "@/server/use-cases/types";

export class GetUserByIdUseCase {
	constructor(private readonly userRepository: UserRepository) {}

	async execute(id: string): Promise<Result<UserDto>> {
		const result = await this.userRepository.findDtoById(id);
		if (!result.ok) return result;
		if (!result.value)
			return err(new NotFoundError("ユーザーが見つかりません"));
		return { ok: true, value: result.value };
	}
}
