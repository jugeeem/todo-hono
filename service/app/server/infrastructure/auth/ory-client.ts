import { Configuration, FrontendApi } from "@ory/client";

export function createOryClient(): FrontendApi {
	const basePath = process.env.ORY_KRATOS_PUBLIC_URL || "http://kratos:4433";

	const config = new Configuration({ basePath });
	return new FrontendApi(config);
}
