import type { DomainError } from "@/server/domain/errors/domain-error";

export type Result<T, E extends DomainError = DomainError> =
	| { ok: true; value: T }
	| { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
	return { ok: true, value };
}

export function err<E extends DomainError>(error: E): Result<never, E> {
	return { ok: false, error };
}

export interface UseCase<TInput, TOutput> {
	execute(input: TInput): Promise<Result<TOutput>>;
}
