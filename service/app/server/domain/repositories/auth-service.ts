import type { AuthUser } from "@/server/domain/entities/auth";
import type { Result } from "@/server/use-cases/types";

export interface AuthService {
	validateSession(token: string): Promise<Result<AuthUser>>;
	logout(token: string): Promise<Result<void>>;
}
