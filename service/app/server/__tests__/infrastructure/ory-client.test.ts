import { describe, expect, test } from "bun:test";
import { FrontendApi } from "@ory/client";
import { createOryClient } from "@/server/infrastructure/auth/ory-client";

describe("infrastructure/auth/ory-client", () => {
	test("should return FrontendApi instance when called", () => {
		const client = createOryClient();
		expect(client).toBeInstanceOf(FrontendApi);
	});
});
