import type { Context } from "hono";
import { successResponse } from "@/server/adapters/presenters/api-response";
import {
	createTagSchema,
	updateTagSchema,
} from "@/server/adapters/validators/tag-validator";
import { ValidationError } from "@/server/domain/errors/domain-error";
import type { TagRepository } from "@/server/domain/repositories/tag-repository";
import type { AppEnv } from "@/server/types";
import { CreateTagUseCase } from "@/server/use-cases/tags/create-tag-use-case";
import { DeleteTagUseCase } from "@/server/use-cases/tags/delete-tag-use-case";
import { GetTagByIdUseCase } from "@/server/use-cases/tags/get-tag-by-id-use-case";
import { GetTagsUseCase } from "@/server/use-cases/tags/get-tags-use-case";
import { UpdateTagUseCase } from "@/server/use-cases/tags/update-tag-use-case";

export function createTagHandlers(tagRepository: TagRepository) {
	return {
		getTags: async (c: Context<AppEnv>) => {
			const auth = c.get("auth");
			const useCase = new GetTagsUseCase(tagRepository);
			const result = await useCase.execute(auth.user.identityId);
			if (!result.ok) throw result.error;
			return successResponse(c, result.value);
		},

		getTagById: async (c: Context<AppEnv>) => {
			const id = c.req.param("id") ?? "";
			const auth = c.get("auth");
			const useCase = new GetTagByIdUseCase(tagRepository);
			const result = await useCase.execute(id, auth.user.identityId);
			if (!result.ok) throw result.error;
			return successResponse(c, result.value);
		},

		createTag: async (c: Context<AppEnv>) => {
			const body = await c.req.json();
			const parsed = createTagSchema.safeParse(body);
			if (!parsed.success) {
				throw new ValidationError(
					parsed.error.issues[0]?.message ?? "入力が無効です",
				);
			}
			const auth = c.get("auth");
			const useCase = new CreateTagUseCase(tagRepository);
			const result = await useCase.execute({
				...parsed.data,
				userId: auth.user.identityId,
			});
			if (!result.ok) throw result.error;
			return successResponse(c, result.value, 201);
		},

		updateTag: async (c: Context<AppEnv>) => {
			const id = c.req.param("id") ?? "";
			const body = await c.req.json();
			const parsed = updateTagSchema.safeParse(body);
			if (!parsed.success) {
				throw new ValidationError(
					parsed.error.issues[0]?.message ?? "入力が無効です",
				);
			}
			const auth = c.get("auth");
			const useCase = new UpdateTagUseCase(tagRepository);
			const result = await useCase.execute({
				id,
				userId: auth.user.identityId,
				...parsed.data,
			});
			if (!result.ok) throw result.error;
			return successResponse(c, result.value);
		},

		deleteTag: async (c: Context<AppEnv>) => {
			const id = c.req.param("id") ?? "";
			const auth = c.get("auth");
			const useCase = new DeleteTagUseCase(tagRepository);
			const result = await useCase.execute(id, auth.user.identityId);
			if (!result.ok) throw result.error;
			return c.body(null, 204);
		},
	};
}
