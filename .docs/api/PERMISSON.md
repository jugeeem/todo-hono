# パーミッション API

パーミッションの管理を行うエンドポイントです。  
すべてのエンドポイントに `Authorization: Bearer <token>` ヘッダーが必要です。

---

## `GET /api/permissions`

パーミッション一覧を取得します（名前の昇順）。

### 認可

| 必要権限 |
|---|
| `permissions:read` |

### リクエスト

#### ヘッダー

| ヘッダー | 必須 | 説明 |
|---|---|---|
| `Authorization` | ✅ | `Bearer <token>` 形式のセッショントークン |

#### パラメータ

なし

#### リクエストボディ

なし

### レスポンス

#### `200 OK`

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "todos:read",
      "description": "Todo の閲覧権限"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "todos:write",
      "description": "Todo の編集権限"
    }
  ],
  "error": null
}
```

#### レスポンスフィールド（Permission オブジェクト）

| フィールド | 型 | 説明 |
|---|---|---|
| `id` | `string` | パーミッションの一意識別子（UUID） |
| `name` | `string` | パーミッション名 |
| `description` | `string \| null` | 説明 |

#### `401 Unauthorized`

```json
{
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authorization ヘッダーが必要です"
  }
}
```

#### `403 Forbidden`

```json
{
  "data": null,
  "error": {
    "code": "FORBIDDEN",
    "message": "アクセスが拒否されました"
  }
}
```

---

## `POST /api/permissions`

新しいパーミッションを作成します。同名のパーミッションが既に存在する場合は `409 Conflict` を返します。

### 認可

| 必要権限 |
|---|
| `permissions:write` |

### リクエスト

#### ヘッダー

| ヘッダー | 必須 | 説明 |
|---|---|---|
| `Authorization` | ✅ | `Bearer <token>` 形式のセッショントークン |
| `Content-Type` | ✅ | `application/json` |

#### パラメータ

なし

#### リクエストボディ

```json
{
  "name": "reports:read",
  "description": "レポートの閲覧権限"
}
```

| フィールド | 型 | 必須 | バリデーション | 説明 |
|---|---|---|---|---|
| `name` | `string` | ✅ | 1〜256 文字 | パーミッション名 |
| `description` | `string` | — | — | 説明 |

### レスポンス

#### `201 Created`

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "reports:read",
    "description": "レポートの閲覧権限"
  },
  "error": null
}
```

#### `409 Conflict`

```json
{
  "data": null,
  "error": {
    "code": "CONFLICT",
    "message": "パーミッション \"reports:read\" は既に存在します"
  }
}
```

#### `422 Unprocessable Entity`

```json
{
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力が無効です"
  }
}
```
