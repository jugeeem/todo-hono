import type { Result } from "@/server/use-cases/types";

export type CategoryDto = {
	id: string;
	name: string;
	description: string | null;
	userId: string;
	createdAt: Date;
	updatedAt: Date;
};

export type CreateCategoryInput = {
	name: string;
	description?: string;
	userId: string;
};

export type UpdateCategoryInput = {
	name?: string;
	description?: string | null;
	updatedBy: string;
};

export interface CategoryRepository {
	findAllByUserId(userId: string): Promise<Result<CategoryDto[]>>;
	findByIdAndUserId(
		id: string,
		userId: string,
	): Promise<Result<CategoryDto | null>>;
	create(input: CreateCategoryInput): Promise<Result<CategoryDto>>;
	update(
		id: string,
		userId: string,
		input: UpdateCategoryInput,
	): Promise<Result<CategoryDto>>;
	softDelete(
		id: string,
		userId: string,
		deletedBy: string,
	): Promise<Result<void>>;
}
