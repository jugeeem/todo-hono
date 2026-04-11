import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

type ApiSuccessResponse<T> = {
	data: T;
	error: null;
};

type ApiErrorResponse = {
	data: null;
	error: {
		code: string;
		message: string;
	};
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function successResponse<T>(
	c: Context,
	data: T,
	statusCode: ContentfulStatusCode = 200,
) {
	return c.json<ApiSuccessResponse<T>>(
		{
			data,
			error: null,
		},
		statusCode,
	);
}

export function errorResponse(
	c: Context,
	code: string,
	message: string,
	statusCode: ContentfulStatusCode = 500,
) {
	return c.json<ApiErrorResponse>(
		{
			data: null,
			error: { code, message },
		},
		statusCode,
	);
}
