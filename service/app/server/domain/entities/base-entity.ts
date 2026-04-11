export type BaseEntityProps = {
	id: string;
	createdAt: Date;
	createdBy: string;
	updatedAt: Date;
	updatedBy: string;
	deletedAt: Date | null;
	deletedBy: string | null;
};
