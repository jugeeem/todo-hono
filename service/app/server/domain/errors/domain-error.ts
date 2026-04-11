export class DomainError extends Error {
	constructor(
		public readonly code: string,
		message: string,
		public readonly statusCode: number,
	) {
		super(message);
		this.name = this.constructor.name;
	}
}

export class NotFoundError extends DomainError {
	constructor(message = "リソースが見つかりません") {
		super("NOT_FOUND", message, 404);
	}
}

export class ValidationError extends DomainError {
	constructor(message = "入力が無効です") {
		super("VALIDATION_ERROR", message, 422);
	}
}

export class UnauthorizedError extends DomainError {
	constructor(message = "認証が必要です") {
		super("UNAUTHORIZED", message, 401);
	}
}

export class ForbiddenError extends DomainError {
	constructor(message = "アクセスが拒否されました") {
		super("FORBIDDEN", message, 403);
	}
}

export class ConflictError extends DomainError {
	constructor(message = "リソースが競合しています") {
		super("CONFLICT", message, 409);
	}
}
