import { Configuration, IdentityApi } from "@ory/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL ?? "",
});
const prisma = new PrismaClient({ adapter });

const kratosAdminUrl = process.env.ORY_KRATOS_ADMIN_URL ?? "http://kratos:4434";
const identityApi = new IdentityApi(
	new Configuration({ basePath: kratosAdminUrl }),
);

const SYSTEM_ID = "00000000-0000-0000-0000-000000000000";
const COMMON_PASSWORD = "Password123!";

const PERMISSIONS = [
	{ name: "todos:read", description: "Todo の閲覧" },
	{ name: "todos:write", description: "Todo の作成・更新・削除" },
	{ name: "categories:read", description: "カテゴリの閲覧" },
	{ name: "categories:write", description: "カテゴリの作成・更新・削除" },
	{ name: "tags:read", description: "タグの閲覧" },
	{ name: "tags:write", description: "タグの作成・更新・削除" },
	{ name: "users:read", description: "ユーザー情報の閲覧" },
	{ name: "users:write", description: "ユーザー情報の更新・ロール割り当て" },
	{ name: "roles:read", description: "ロールの閲覧" },
	{ name: "roles:write", description: "ロールの作成・更新・削除" },
	{ name: "permissions:read", description: "パーミッションの閲覧" },
	{
		name: "permissions:write",
		description: "パーミッションの作成・更新・削除",
	},
] as const;

// ロール × パーミッション マトリクス
const ROLE_PERMISSIONS: Record<string, string[]> = {
	ADMIN: [
		"todos:read",
		"todos:write",
		"categories:read",
		"categories:write",
		"tags:read",
		"tags:write",
		"users:read",
		"users:write",
		"roles:read",
		"roles:write",
		"permissions:read",
		"permissions:write",
	],
	MANAGER: [
		"todos:read",
		"todos:write",
		"categories:read",
		"categories:write",
		"tags:read",
		"tags:write",
		"users:read",
		"users:write",
		"roles:read",
		"permissions:read",
	],
	USER: [
		"todos:read",
		"todos:write",
		"categories:read",
		"categories:write",
		"tags:read",
		"tags:write",
	],
	GUEST: ["todos:read", "categories:read", "tags:read"],
};

async function main() {
	console.log("🌱 シードデータの投入を開始します...");

	// パーミッションを upsert
	const permissionMap: Record<string, string> = {};
	for (const perm of PERMISSIONS) {
		const record = await prisma.permissions.upsert({
			where: { name: perm.name },
			update: {},
			create: {
				name: perm.name,
				description: perm.description,
				createdBy: SYSTEM_ID,
				updatedBy: SYSTEM_ID,
			},
		});
		permissionMap[perm.name] = record.id;
		console.log(`  ✓ Permission: ${perm.name}`);
	}

	// ロールを upsert し、パーミッションを割り当て
	const roleMap: Record<string, string> = {};
	for (const [roleName, permNames] of Object.entries(ROLE_PERMISSIONS)) {
		const role = await prisma.roles.upsert({
			where: { name: roleName },
			update: {},
			create: {
				name: roleName,
				description: getRoleDescription(roleName),
				createdBy: SYSTEM_ID,
				updatedBy: SYSTEM_ID,
			},
		});
		console.log(`  ✓ Role: ${roleName}`);
		roleMap[roleName] = role.id;

		for (const permName of permNames) {
			const permissionId = permissionMap[permName];
			if (!permissionId) continue;

			const existing = await prisma.rolePermissions.findFirst({
				where: { roleId: role.id, permissionId, deletedAt: null },
			});
			if (!existing) {
				await prisma.rolePermissions.create({
					data: {
						roleId: role.id,
						permissionId,
						createdBy: SYSTEM_ID,
						updatedBy: SYSTEM_ID,
					},
				});
			}
		}
		console.log(`    → ${permNames.length} 件のパーミッションを割り当てました`);
	}

	await seedUsers(roleMap);

	console.log("✅ シードデータの投入が完了しました");
}

function getRoleDescription(roleName: string): string {
	const descriptions: Record<string, string> = {
		ADMIN: "全権限を持つ管理者ロール",
		MANAGER: "ユーザー管理とロール閲覧が可能なマネージャーロール",
		USER: "自分のリソースを管理できる一般ユーザーロール",
		GUEST: "閲覧のみ可能なゲストロール",
	};
	return descriptions[roleName] ?? roleName;
}

type SeedUser = {
	username: string;
	email: string;
	role: string;
};

const SEED_USERS: SeedUser[] = [
	// ADMIN × 1
	{ username: "admin", email: "admin@example.com", role: "ADMIN" },
	// MANAGER × 2
	{ username: "manager1", email: "manager1@example.com", role: "MANAGER" },
	{ username: "manager2", email: "manager2@example.com", role: "MANAGER" },
	// USER × 8
	{ username: "user1", email: "user1@example.com", role: "USER" },
	{ username: "user2", email: "user2@example.com", role: "USER" },
	{ username: "user3", email: "user3@example.com", role: "USER" },
	{ username: "user4", email: "user4@example.com", role: "USER" },
	{ username: "user5", email: "user5@example.com", role: "USER" },
	{ username: "user6", email: "user6@example.com", role: "USER" },
	{ username: "user7", email: "user7@example.com", role: "USER" },
	{ username: "user8", email: "user8@example.com", role: "USER" },
	// GUEST × 8
	{ username: "guest1", email: "guest1@example.com", role: "GUEST" },
	{ username: "guest2", email: "guest2@example.com", role: "GUEST" },
	{ username: "guest3", email: "guest3@example.com", role: "GUEST" },
	{ username: "guest4", email: "guest4@example.com", role: "GUEST" },
	{ username: "guest5", email: "guest5@example.com", role: "GUEST" },
	{ username: "guest6", email: "guest6@example.com", role: "GUEST" },
	{ username: "guest7", email: "guest7@example.com", role: "GUEST" },
	{ username: "guest8", email: "guest8@example.com", role: "GUEST" },
];

async function seedUsers(roleMap: Record<string, string>) {
	console.log("\n👤 ユーザーのシードを開始します...");

	for (const seedUser of SEED_USERS) {
		// 既存 Kratos Identity を email で検索
		const { data: existingIdentities } = await identityApi.listIdentities({
			credentialsIdentifier: seedUser.email,
		});

		let identityId: string;

		if (existingIdentities.length > 0 && existingIdentities[0]) {
			identityId = existingIdentities[0].id;
			console.log(
				`  ↺ Kratos Identity 既存: ${seedUser.email} (${identityId})`,
			);
		} else {
			// Kratos Identity を新規作成
			const { data: identity } = await identityApi.createIdentity({
				createIdentityBody: {
					schema_id: "default",
					traits: {
						email: seedUser.email,
						username: seedUser.username,
					},
					credentials: {
						password: {
							config: { password: COMMON_PASSWORD },
						},
					},
				},
			});
			identityId = identity.id;
			console.log(
				`  ✓ Kratos Identity 作成: ${seedUser.email} (${identityId})`,
			);
		}

		// DB ユーザーを upsert（Kratos identity.id と同じ UUID を使用）
		await prisma.users.upsert({
			where: { id: identityId },
			update: {},
			create: {
				id: identityId,
				username: seedUser.username,
				email: seedUser.email,
				password: "MANAGED_BY_KRATOS",
				createdBy: SYSTEM_ID,
				updatedBy: SYSTEM_ID,
			},
		});

		// ロールを割り当て
		const roleId = roleMap[seedUser.role];
		if (roleId) {
			const existing = await prisma.userRoles.findFirst({
				where: { userId: identityId, roleId, deletedAt: null },
			});
			if (!existing) {
				await prisma.userRoles.create({
					data: {
						userId: identityId,
						roleId,
						createdBy: SYSTEM_ID,
						updatedBy: SYSTEM_ID,
					},
				});
			}
			console.log(`    → ロール割り当て: ${seedUser.role}`);
		}
	}
}

main()
	.catch((e) => {
		console.error("❌ シードデータの投入に失敗しました:", e);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
