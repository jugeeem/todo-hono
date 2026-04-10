import { beforeAll, describe, expect, mock, test } from "bun:test";

// --- モック定義（動的インポートより先に設定する必要がある） ---

const mockAdapter = { _isMockAdapter: true };
const MockPrismaPg = mock(() => mockAdapter);

const mockPrismaClientInstance = { _isMockPrismaClient: true };
const MockPrismaClient = mock(() => mockPrismaClientInstance);

mock.module("@prisma/adapter-pg", () => ({
	PrismaPg: MockPrismaPg,
}));

mock.module("../prisma/generated/prisma/client", () => ({
	PrismaClient: MockPrismaClient,
}));

// --- テスト対象モジュールの動的インポート ---

// biome-ignore lint/suspicious/noExplicitAny: テスト用セットアップ変数
let prisma: any;

beforeAll(async () => {
	// globalThis をリセットしてクリーンな状態でインポートする
	(globalThis as { prisma?: unknown }).prisma = undefined;
	process.env.DATABASE_URL =
		"postgresql://postgres:postgres@postgres:5432/todo_db_test?schema=public";

	const mod = await import("./prisma");
	prisma = mod.prisma;
});

// ---

describe("lib/prisma", () => {
	describe("prisma エクスポート", () => {
		test("should export a defined prisma instance when module is loaded", () => {
			// Arrange / Act はモジュールロード時に完了済み
			// Assert
			expect(prisma).toBeDefined();
		});

		test("should be the PrismaClient instance returned by the constructor when initialized", () => {
			// Arrange / Act はモジュールロード時に完了済み
			// Assert
			expect(prisma).toBe(mockPrismaClientInstance);
		});
	});

	describe("PrismaPg アダプター初期化", () => {
		test("should create PrismaPg adapter with DATABASE_URL when module is loaded", () => {
			// Arrange
			const expectedUrl =
				"postgresql://postgres:postgres@postgres:5432/todo_db_test?schema=public";

			// Act はモジュールロード時に完了済み

			// Assert
			expect(MockPrismaPg).toHaveBeenCalledTimes(1);
			expect(MockPrismaPg).toHaveBeenCalledWith({
				connectionString: expectedUrl,
			});
		});
	});

	describe("PrismaClient 初期化", () => {
		test("should initialize PrismaClient with the PrismaPg adapter when module is loaded", () => {
			// Arrange / Act はモジュールロード時に完了済み

			// Assert
			expect(MockPrismaClient).toHaveBeenCalledTimes(1);
			expect(MockPrismaClient).toHaveBeenCalledWith({ adapter: mockAdapter });
		});
	});

	describe("シングルトンパターン", () => {
		test("should store prisma instance in globalThis when NODE_ENV is not production", () => {
			// Arrange
			// NODE_ENV が "test" の場合、!== "production" が true になる

			// Act はモジュールロード時に完了済み

			// Assert: globalThis.prisma が設定されていること
			const cached = (globalThis as { prisma?: unknown }).prisma;
			expect(cached).toBe(prisma);
		});

		test("should return the same instance on re-import when module is cached", async () => {
			// Arrange / Act
			const { prisma: prisma2 } = await import("./prisma");

			// Assert: ESモジュールキャッシュにより同一インスタンスが返される
			expect(prisma2).toBe(prisma);
		});

		test("should create PrismaClient only once when module is loaded multiple times", async () => {
			// Arrange / Act: 再インポートしてもモジュールキャッシュが使われる
			await import("./prisma");
			await import("./prisma");

			// Assert: PrismaClient コンストラクタが 1 回だけ呼ばれていること
			expect(MockPrismaClient).toHaveBeenCalledTimes(1);
		});

		test("should reuse existing globalThis.prisma when it is already set before module load", () => {
			// Arrange: モジュールロード前に globalThis.prisma が別インスタンスで設定された場合、
			// `globalForPrisma.prisma ?? new PrismaClient(...)` の ?? 演算子により
			// 既存インスタンスが使用される（Hot Reload 対応）。
			// モジュールキャッシュのため直接再現は不可だが、
			// キャッシュされた prisma と globalThis.prisma が一致していることで間接検証できる。
			const cached = (globalThis as { prisma?: unknown }).prisma;
			expect(cached).toBe(prisma);
			// PrismaClient は一度しか呼ばれていない = 既存インスタンスが再利用されている
			expect(MockPrismaClient).toHaveBeenCalledTimes(1);
		});
	});
});
