import type { Context } from "hono";
import { successResponse } from "@/server/adapters/presenters/api-response";
import {
	createCategorySchema,
	updateCategorySchema,
} from "@/server/adapters/validators/category-validator";
import { ValidationError } from "@/server/domain/errors/domain-error";
import type { CategoryRepository } from "@/server/domain/repositories/category-repository";
import type { AppEnv } from "@/server/types";
import { CreateCategoryUseCase } from "@/server/use-cases/categories/create-category-use-case";
import { DeleteCategoryUseCase } from "@/server/use-cases/categories/delete-category-use-case";
import { GetCategoriesUseCase } from "@/server/use-cases/categories/get-categories-use-case";
import { GetCategoryByIdUseCase } from "@/server/use-cases/categories/get-category-by-id-use-case";
import { UpdateCategoryUseCase } from "@/server/use-cases/categories/update-category-use-case";

export function createCategoryHandlers(categoryRepository: CategoryRepository) {
	return {
		getCategories: async (c: Context<AppEnv>) => {
			const auth = c.get("auth");
			const useCase = new GetCategoriesUseCase(categoryRepository);
			const result = await useCase.execute(auth.user.identityId);
			if (!result.ok) throw result.error;
			return successResponse(c, result.value);
		},

		getCategoryById: async (c: Context<AppEnv>) => {
			const id = c.req.param("id") ?? "";
			const auth = c.get("auth");
			const useCase = new GetCategoryByIdUseCase(categoryRepository);
			const result = await useCase.execute(id, auth.user.identityId);
			if (!result.ok) throw result.error;
			return successResponse(c, result.value);
		},

		createCategory: async (c: Context<AppEnv>) => {
			const body = await c.req.json();
			const parsed = createCategorySchema.safeParse(body);
			if (!parsed.success) {
				throw new ValidationError(
					parsed.error.issues[0]?.message ?? "入力が無効です",
				);
			}
			const auth = c.get("auth");
			const useCase = new CreateCategoryUseCase(categoryRepository);
			const result = await useCase.execute({
				...parsed.data,
				userId: auth.user.identityId,
			});
			if (!result.ok) throw result.error;
			return successResponse(c, result.value, 201);
		},

		updateCategory: async (c: Context<AppEnv>) => {
			const id = c.req.param("id") ?? "";
			const body = await c.req.json();
			const parsed = updateCategorySchema.safeParse(body);
			if (!parsed.success) {
				throw new ValidationError(
					parsed.error.issues[0]?.message ?? "入力が無効です",
				);
			}
			const auth = c.get("auth");
			const useCase = new UpdateCategoryUseCase(categoryRepository);
			const result = await useCase.execute({
				id,
				userId: auth.user.identityId,
				...parsed.data,
			});
			if (!result.ok) throw result.error;
			return successResponse(c, result.value);
		},

		deleteCategory: async (c: Context<AppEnv>) => {
			const id = c.req.param("id") ?? "";
			const auth = c.get("auth");
			const useCase = new DeleteCategoryUseCase(categoryRepository);
			const result = await useCase.execute(id, auth.user.identityId);
			if (!result.ok) throw result.error;
			return c.body(null, 204);
		},
	};
}
