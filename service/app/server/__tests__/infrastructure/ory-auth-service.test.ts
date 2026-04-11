import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { FrontendApi } from "@ory/client";
import { UnauthorizedError } from "@/server/domain/errors/domain-error";
import { OryAuthService } from "@/server/infrastructure/auth/ory-auth-service";

function createMockFrontendApi() {
	return {
		toSession: mock(),
		performNativeLogout: mock(),
	} as unknown as FrontendApi;
}

describe("infrastructure/auth/ory-auth-service", () => {
	let mockFrontendApi: FrontendApi;
	let service: OryAuthService;

	beforeEach(() => {
		mockFrontendApi = createMockFrontendApi();
		service = new OryAuthService(mockFrontendApi);
	});

	test("should return AuthUser when session is valid", async () => {
		// Arrange
		const mockSession = {
			id: "session-123",
			active: true,
			identity: {
				id: "identity-uuid-456",
				traits: {
					email: "test@example.com",
					username: "testuser",
				},
			},
		};
		(mockFrontendApi.toSession as ReturnType<typeof mock>).mockResolvedValue({
			data: mockSession,
		});

		// Act
		const result = await service.validateSession("valid-token");

		// Assert
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value).toEqual({
				identityId: "identity-uuid-456",
				email: "test@example.com",
				username: "testuser",
				sessionId: "session-123",
			});
		}
		expect(mockFrontendApi.toSession).toHaveBeenCalledWith({
			xSessionToken: "valid-token",
		});
	});

	test("should return UnauthorizedError when session is inactive", async () => {
		// Arrange
		(mockFrontendApi.toSession as ReturnType<typeof mock>).mockResolvedValue({
			data: {
				id: "session-123",
				active: false,
				identity: {
					id: "identity-uuid-456",
					traits: { email: "test@example.com", username: "testuser" },
				},
			},
		});

		// Act
		const result = await service.validateSession("inactive-token");

		// Assert
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toBeInstanceOf(UnauthorizedError);
			expect(result.error.message).toBe("セッションが無効です");
		}
	});

	test("should return UnauthorizedError when identity is missing", async () => {
		// Arrange
		(mockFrontendApi.toSession as ReturnType<typeof mock>).mockResolvedValue({
			data: {
				id: "session-123",
				active: true,
				identity: null,
			},
		});

		// Act
		const result = await service.validateSession("no-identity-token");

		// Assert
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toBeInstanceOf(UnauthorizedError);
		}
	});

	test("should return UnauthorizedError when Ory API throws", async () => {
		// Arrange
		(mockFrontendApi.toSession as ReturnType<typeof mock>).mockRejectedValue(
			new Error("Network error"),
		);

		// Act
		const result = await service.validateSession("error-token");

		// Assert
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toBeInstanceOf(UnauthorizedError);
			expect(result.error.message).toBe("セッション検証に失敗しました");
		}
	});

	describe("logout()", () => {
		test("should return ok when logout succeeds", async () => {
			// Arrange
			(
				mockFrontendApi.performNativeLogout as ReturnType<typeof mock>
			).mockResolvedValue({});

			// Act
			const result = await service.logout("valid-token");

			// Assert
			expect(result.ok).toBe(true);
			expect(mockFrontendApi.performNativeLogout).toHaveBeenCalledWith({
				performNativeLogoutBody: { session_token: "valid-token" },
			});
		});

		test("should return UnauthorizedError when logout fails", async () => {
			// Arrange
			(
				mockFrontendApi.performNativeLogout as ReturnType<typeof mock>
			).mockRejectedValue(new Error("Logout failed"));

			// Act
			const result = await service.logout("invalid-token");

			// Assert
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toBeInstanceOf(UnauthorizedError);
				expect(result.error.message).toBe("ログアウトに失敗しました");
			}
		});
	});
});
