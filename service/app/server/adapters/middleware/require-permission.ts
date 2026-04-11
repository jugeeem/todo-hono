import type { MiddlewareHandler } from "hono";
import {
	ForbiddenError,
	UnauthorizedError,
} from "@/server/domain/errors/domain-error";
import type { AppEnv } from "@/server/types";

export function requirePermission(
	...requiredPermissions: string[]
): MiddlewareHandler<AppEnv> {
	return async (c, next) => {
		const auth = c.get("auth");

		if (!auth) {
			throw new UnauthorizedError("認証が必要です");
		}

		const missing = requiredPermissions.filter(
			(p) => !auth.permissions.includes(p),
		);

		if (missing.length > 0) {
			throw new ForbiddenError(`権限が不足しています: ${missing.join(", ")}`);
		}

		await next();
	};
}
