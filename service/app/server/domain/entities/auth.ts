export type AuthUser = {
	identityId: string;
	email: string;
	username: string;
	sessionId: string;
};

export type AuthContext = {
	user: AuthUser;
	permissions: string[];
};
