import type { Users } from "@/prisma/generated/prisma/client";
import type { AuthUser } from "@/server/domain/entities/auth";
import type { Result } from "@/server/use-cases/types";

export type UserDto = {
	id: string;
	username: string;
	email: string;
	createdAt: Date;
	updatedAt: Date;
};

export type UpdateUserInput = {
	username?: string;
	email?: string;
	updatedBy: string;
};

export interface UserRepository {
	findAll(): Promise<Result<UserDto[]>>;
	findById(id: string): Promise<Result<Users | null>>;
	findDtoById(id: string): Promise<Result<UserDto | null>>;
	create(authUser: AuthUser): Promise<Result<Users>>;
	update(id: string, input: UpdateUserInput): Promise<Result<UserDto>>;
	softDelete(id: string, deletedBy: string): Promise<Result<void>>;
}
