import type { MiddlewareHandler } from "hono";
import { UnauthorizedError } from "@/server/domain/errors/domain-error";
import type { AuthService } from "@/server/domain/repositories/auth-service";
import type { PermissionRepository } from "@/server/domain/repositories/permission-repository";
import type { UserRepository } from "@/server/domain/repositories/user-repository";
import type { AppEnv } from "@/server/types";

export function authMiddleware(
	authService: AuthService,
	permissionRepository: PermissionRepository,
	userRepository: UserRepository,
): MiddlewareHandler<AppEnv> {
	return async (c, next) => {
		const authHeader = c.req.header("Authorization");

		if (!authHeader?.startsWith("Bearer ")) {
			throw new UnauthorizedError("Authorization ヘッダーが必要です");
		}

		const token = authHeader.slice(7);

		const sessionResult = await authService.validateSession(token);
		if (!sessionResult.ok) {
			throw sessionResult.error;
		}

		const authUser = sessionResult.value;

		// JIT プロビジョニング: 初回アクセス時にユーザーを DB に登録
		const userResult = await userRepository.findById(authUser.identityId);
		if (!userResult.ok) {
			throw userResult.error;
		}
		if (!userResult.value) {
			const createResult = await userRepository.create(authUser);
			if (!createResult.ok) {
				throw createResult.error;
			}
		}

		const permResult = await permissionRepository.getPermissionsByUserId(
			authUser.identityId,
		);
		if (!permResult.ok) {
			throw permResult.error;
		}

		c.set("auth", {
			user: authUser,
			permissions: permResult.value,
		});

		await next();
	};
}
