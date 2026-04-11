import type { Env } from "hono";
import type { AuthContext } from "@/server/domain/entities/auth";

export interface AppEnv extends Env {
	Variables: {
		auth: AuthContext;
	};
}
