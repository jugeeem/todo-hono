import type { FrontendApi } from "@ory/client";
import type { AuthUser } from "@/server/domain/entities/auth";
import { UnauthorizedError } from "@/server/domain/errors/domain-error";
import type { AuthService } from "@/server/domain/repositories/auth-service";
import type { Result } from "@/server/use-cases/types";
import { err, ok } from "@/server/use-cases/types";

export class OryAuthService implements AuthService {
	constructor(private readonly frontendApi: FrontendApi) {}

	async validateSession(token: string): Promise<Result<AuthUser>> {
		try {
			const { data: session } = await this.frontendApi.toSession({
				xSessionToken: token,
			});

			if (!session.active || !session.identity) {
				return err(new UnauthorizedError("セッションが無効です"));
			}

			const { identity } = session;
			const traits = identity.traits as {
				email: string;
				username: string;
			};

			return ok({
				identityId: identity.id,
				email: traits.email,
				username: traits.username,
				sessionId: session.id,
			});
		} catch {
			return err(new UnauthorizedError("セッション検証に失敗しました"));
		}
	}

	async logout(token: string): Promise<Result<void>> {
		try {
			await this.frontendApi.performNativeLogout({
				performNativeLogoutBody: { session_token: token },
			});
			return ok(undefined);
		} catch {
			return err(new UnauthorizedError("ログアウトに失敗しました"));
		}
	}
}
