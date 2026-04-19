import type { Result } from "@/server/use-cases/types";

export type TagDto = {
	id: string;
	name: string;
	userId: string;
	createdAt: Date;
	updatedAt: Date;
};

export type CreateTagInput = {
	name: string;
	userId: string;
};

export type UpdateTagInput = {
	name?: string;
	updatedBy: string;
};

export interface TagRepository {
	findAllByUserId(userId: string): Promise<Result<TagDto[]>>;
	findByIdAndUserId(id: string, userId: string): Promise<Result<TagDto | null>>;
	create(input: CreateTagInput): Promise<Result<TagDto>>;
	update(
		id: string,
		userId: string,
		input: UpdateTagInput,
	): Promise<Result<TagDto>>;
	softDelete(
		id: string,
		userId: string,
		deletedBy: string,
	): Promise<Result<void>>;
}
