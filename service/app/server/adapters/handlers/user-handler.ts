import type { Context } from "hono";
import { successResponse } from "@/server/adapters/presenters/api-response";
import { updateUserSchema } from "@/server/adapters/validators/user-validator";
import { ValidationError } from "@/server/domain/errors/domain-error";
import type { UserRepository } from "@/server/domain/repositories/user-repository";
import type { AppEnv } from "@/server/types";
import { DeleteUserUseCase } from "@/server/use-cases/users/delete-user-use-case";
import { GetUserByIdUseCase } from "@/server/use-cases/users/get-user-by-id-use-case";
import { GetUsersUseCase } from "@/server/use-cases/users/get-users-use-case";
import { UpdateUserUseCase } from "@/server/use-cases/users/update-user-use-case";

export function createUserHandlers(userRepository: UserRepository) {
	return {
		getUsers: async (c: Context<AppEnv>) => {
			const useCase = new GetUsersUseCase(userRepository);
			const result = await useCase.execute();
			if (!result.ok) throw result.error;
			return successResponse(c, result.value);
		},

		getUserById: async (c: Context<AppEnv>) => {
			const id = c.req.param("id") ?? "";
			const useCase = new GetUserByIdUseCase(userRepository);
			const result = await useCase.execute(id);
			if (!result.ok) throw result.error;
			return successResponse(c, result.value);
		},

		updateUser: async (c: Context<AppEnv>) => {
			const id = c.req.param("id") ?? "";
			const body = await c.req.json();
			const parsed = updateUserSchema.safeParse(body);
			if (!parsed.success) {
				throw new ValidationError(
					parsed.error.issues[0]?.message ?? "入力が無効です",
				);
			}
			const auth = c.get("auth");
			const useCase = new UpdateUserUseCase(userRepository);
			const result = await useCase.execute(id, {
				...parsed.data,
				updatedBy: auth.user.identityId,
			});
			if (!result.ok) throw result.error;
			return successResponse(c, result.value);
		},

		deleteUser: async (c: Context<AppEnv>) => {
			const id = c.req.param("id") ?? "";
			const auth = c.get("auth");
			const useCase = new DeleteUserUseCase(userRepository);
			const result = await useCase.execute(id, auth.user.identityId);
			if (!result.ok) throw result.error;
			return c.body(null, 204);
		},
	};
}
