---
description: "Use when implementing or reviewing API endpoints, middleware, authentication, request validation, or backend business logic in service/api."
applyTo: "service/api/**"
---

# API 開発規約

## レイヤードアーキテクチャ

Clean Architecture / レイヤード構成を採用する:

```
Handler / Controller  →  Service / Use Case  →  Repository / DAO
```

- **Handler**: リクエストのパース・バリデーション、サービス呼び出し、レスポンス整形
- **Service**: ビジネスロジックのみ（HTTP・DB の関心を持たない）
- **Repository**: DB クエリのみ（ドメインオブジェクトを返す）

## REST 設計規約

- リソース名: 複数形の名詞（例: `/todos`、`/users`）
- HTTP メソッド: `GET`（取得）、`POST`（作成）、`PUT`/`PATCH`（更新）、`DELETE`（削除）
- HTTP ステータスコード:
  - `200 OK`, `201 Created`, `204 No Content`
  - `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`
  - `422 Unprocessable Entity`（バリデーションエラー）, `500 Internal Server Error`
- レスポンス形式: `{ "data": ..., "error": null }` / `{ "data": null, "error": { "code": "...", "message": "..." } }`

## データベース

- `todo_db`（本番/開発用）、`todo_db_test`（テスト用）に接続する
- アプリケーションコードから DDL（CREATE TABLE, ALTER TABLE 等）を実行しない — マイグレーションツールを使用する
- Dev Container 内の PostgreSQL ホスト: `postgres:5432`

## セキュリティ

- ハンドラー境界ですべての入力をバリデーション・サニタイズする
- パラメータ化クエリを使用する（ユーザー入力を SQL に直接埋め込まない）
- 認証は JWT またはセッショントークンで実施し、保護されたすべてのルートで検証する
