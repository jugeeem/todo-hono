import type { ErrorHandler } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { errorResponse } from "@/server/adapters/presenters/api-response";
import { DomainError } from "@/server/domain/errors/domain-error";

export const errorHandler: ErrorHandler = (error, c) => {
	if (error instanceof DomainError) {
		return errorResponse(
			c,
			error.code,
			error.message,
			error.statusCode as ContentfulStatusCode,
		);
	}

	console.error("Unhandled error:", error);
	return errorResponse(c, "INTERNAL_SERVER_ERROR", "内部サーバーエラー", 500);
};
