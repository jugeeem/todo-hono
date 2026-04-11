# API 仕様書

## 概要

本プロジェクトは [Hono](https://hono.dev/) フレームワークで構築された REST API です。Next.js の catch-all ルート (`/api/[...route]`) 経由で配信されます。

**ベースパス**: `/api`

## 目次

| ドキュメント | 説明 |
|---|---|
| [KRATOS.md](KRATOS.md) | Ory Kratos 認証基盤（アカウント登録・ログイン・リカバリー） |
| [AUTH.md](AUTH.md) | 認証（セッション管理・ログアウト） |
| [TODO.md](TODO.md) | Todo 管理 |
| [USER.md](USER.md) | ユーザー管理 |
| [ROLE.md](ROLE.md) | ロール管理 |
| [PERMISSON.md](PERMISSON.md) | パーミッション管理 |
| [USER_ROLE.md](USER_ROLE.md) | ユーザー・ロール関連付け |

## エンドポイント一覧

### 公開エンドポイント

| メソッド | パス | 説明 |
|---|---|---|
| `GET` | `/api/hello` | ヘルスチェック |

### 認証エンドポイント

| メソッド | パス | 必要権限 | 説明 |
|---|---|---|---|
| `GET` | `/api/auth/session` | — | セッション情報取得 |
| `DELETE` | `/api/auth/session` | — | ログアウト |

### Todo エンドポイント

| メソッド | パス | 必要権限 | 説明 |
|---|---|---|---|
| `GET` | `/api/todos` | `todos:read` | Todo 一覧取得 |
| `GET` | `/api/todos/:id` | `todos:read` | Todo 詳細取得 |
| `POST` | `/api/todos` | `todos:write` | Todo 作成 |
| `PATCH` | `/api/todos/:id` | `todos:write` | Todo 更新 |
| `DELETE` | `/api/todos/:id` | `todos:write` | Todo 削除 |

### ユーザーエンドポイント

| メソッド | パス | 必要権限 | 説明 |
|---|---|---|---|
| `GET` | `/api/users` | `users:read` | ユーザー一覧取得 |
| `GET` | `/api/users/:id` | `users:read` | ユーザー詳細取得 |
| `PATCH` | `/api/users/:id` | `users:write` | ユーザー更新 |
| `DELETE` | `/api/users/:id` | `users:write` | ユーザー削除 |

### ロールエンドポイント

| メソッド | パス | 必要権限 | 説明 |
|---|---|---|---|
| `GET` | `/api/roles` | `roles:read` | ロール一覧取得 |
| `GET` | `/api/roles/:id` | `roles:read` | ロール詳細取得 |
| `POST` | `/api/roles` | `roles:write` | ロール作成 |
| `PATCH` | `/api/roles/:id` | `roles:write` | ロール更新 |
| `DELETE` | `/api/roles/:id` | `roles:write` | ロール削除 |
| `POST` | `/api/roles/:id/permissions` | `roles:write` | ロールにパーミッション追加 |
| `DELETE` | `/api/roles/:id/permissions/:permissionId` | `roles:write` | ロールからパーミッション削除 |

### パーミッションエンドポイント

| メソッド | パス | 必要権限 | 説明 |
|---|---|---|---|
| `GET` | `/api/permissions` | `permissions:read` | パーミッション一覧取得 |
| `POST` | `/api/permissions` | `permissions:write` | パーミッション作成 |

### ユーザー・ロールエンドポイント

| メソッド | パス | 必要権限 | 説明 |
|---|---|---|---|
| `GET` | `/api/users/:id/roles` | `users:read` | ユーザーのロール一覧取得 |
| `POST` | `/api/users/:id/roles` | `users:write` | ユーザーにロール割り当て |
| `DELETE` | `/api/users/:id/roles/:roleId` | `users:write` | ユーザーからロール削除 |

## 認証

すべての認証済みエンドポイントは `Authorization` ヘッダーに Bearer トークンが必要です。

```
Authorization: Bearer <token>
```

初回アクセス時に JIT（Just-In-Time）プロビジョニングにより、ユーザーが自動的にデータベースに登録されます。

## 共通レスポンス形式

### 成功レスポンス

```json
{
  "data": <T>,
  "error": null
}
```

### エラーレスポンス

```json
{
  "data": null,
  "error": {
    "code": "<エラーコード>",
    "message": "<エラーメッセージ>"
  }
}
```

### 204 No Content

削除操作など、レスポンスボディが不要な場合はボディなしで `204` を返します。

## エラーコード一覧

| HTTP ステータス | コード | デフォルトメッセージ |
|---|---|---|
| `401` | `UNAUTHORIZED` | 認証が必要です |
| `403` | `FORBIDDEN` | アクセスが拒否されました |
| `404` | `NOT_FOUND` | リソースが見つかりません |
| `409` | `CONFLICT` | リソースが競合しています |
| `422` | `VALIDATION_ERROR` | 入力が無効です |
| `500` | `INTERNAL_SERVER_ERROR` | 内部サーバーエラー |

## ヘルスチェック

### `GET /api/hello`

認証不要のヘルスチェックエンドポイントです。

**レスポンス**

- ステータス: `200 OK`

```json
{
  "message": "Hello from Hono!"
}
```
