import type { Context } from "hono";
import {
	errorResponse,
	successResponse,
} from "@/server/adapters/presenters/api-response";
import type { AuthService } from "@/server/domain/repositories/auth-service";
import type { AppEnv } from "@/server/types";

export function createAuthHandlers(authService: AuthService) {
	return {
		getSession: (c: Context<AppEnv>) => {
			const auth = c.get("auth");
			return successResponse(c, {
				user: auth.user,
				permissions: auth.permissions,
			});
		},

		logout: async (c: Context<AppEnv>) => {
			const authHeader = c.req.header("Authorization");
			const token = authHeader?.slice(7) ?? "";
			const result = await authService.logout(token);
			if (!result.ok) {
				return errorResponse(
					c,
					result.error.code,
					result.error.message,
					result.error.statusCode as 401,
				);
			}
			return c.body(null, 204);
		},
	};
}
