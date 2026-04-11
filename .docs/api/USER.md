# ユーザー API

ユーザーの管理を行うエンドポイントです。  
すべてのエンドポイントに `Authorization: Bearer <token>` ヘッダーが必要です。  
ユーザーの作成は JIT プロビジョニング（初回認証アクセス時に自動登録）で行われるため、作成用エンドポイントはありません。

---

## `GET /api/users`

ユーザー一覧を取得します（作成日時の昇順）。

### 認可

| 必要権限 |
|---|
| `users:read` |

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
      "username": "example_user",
      "email": "user@example.com",
      "createdAt": "2026-04-10T10:00:00.000Z",
      "updatedAt": "2026-04-10T10:00:00.000Z"
    }
  ],
  "error": null
}
```

#### レスポンスフィールド（User オブジェクト）

| フィールド | 型 | 説明 |
|---|---|---|
| `id` | `string` | ユーザーの一意識別子（UUID） |
| `username` | `string` | ユーザー名 |
| `email` | `string` | メールアドレス |
| `createdAt` | `string` | 作成日時（ISO 8601 形式） |
| `updatedAt` | `string` | 更新日時（ISO 8601 形式） |

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

## `GET /api/users/:id`

指定したユーザーの詳細を取得します。

### 認可

| 必要権限 |
|---|
| `users:read` |

### リクエスト

#### ヘッダー

| ヘッダー | 必須 | 説明 |
|---|---|---|
| `Authorization` | ✅ | `Bearer <token>` 形式のセッショントークン |

#### パスパラメータ

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `id` | `string` | ✅ | ユーザーの UUID |

#### リクエストボディ

なし

### レスポンス

#### `200 OK`

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "example_user",
    "email": "user@example.com",
    "createdAt": "2026-04-10T10:00:00.000Z",
    "updatedAt": "2026-04-10T10:00:00.000Z"
  },
  "error": null
}
```

#### `404 Not Found`

```json
{
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "ユーザーが見つかりません"
  }
}
```

---

## `PATCH /api/users/:id`

指定したユーザーの情報を更新します。リクエストボディに含まれたフィールドのみ更新されます。  
ユーザー名・メールアドレスの重複チェックが行われます。

### 認可

| 必要権限 |
|---|
| `users:write` |

### リクエスト

#### ヘッダー

| ヘッダー | 必須 | 説明 |
|---|---|---|
| `Authorization` | ✅ | `Bearer <token>` 形式のセッショントークン |
| `Content-Type` | ✅ | `application/json` |

#### パスパラメータ

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `id` | `string` | ✅ | ユーザーの UUID |

#### リクエストボディ

```json
{
  "username": "new_username",
  "email": "new_email@example.com"
}
```

| フィールド | 型 | 必須 | バリデーション | 説明 |
|---|---|---|---|---|
| `username` | `string` | — | 1〜256 文字 | ユーザー名 |
| `email` | `string` | — | メールアドレス形式、最大 256 文字 | メールアドレス |

### レスポンス

#### `200 OK`

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "new_username",
    "email": "new_email@example.com",
    "createdAt": "2026-04-10T10:00:00.000Z",
    "updatedAt": "2026-04-11T08:30:00.000Z"
  },
  "error": null
}
```

#### `404 Not Found`

```json
{
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "ユーザーが見つかりません"
  }
}
```

#### `409 Conflict`

```json
{
  "data": null,
  "error": {
    "code": "CONFLICT",
    "message": "ユーザー名 \"new_username\" は既に使用されています"
  }
}
```

```json
{
  "data": null,
  "error": {
    "code": "CONFLICT",
    "message": "メールアドレス \"new_email@example.com\" は既に使用されています"
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

---

## `DELETE /api/users/:id`

指定したユーザーを削除します（論理削除）。

### 認可

| 必要権限 |
|---|
| `users:write` |

### リクエスト

#### ヘッダー

| ヘッダー | 必須 | 説明 |
|---|---|---|
| `Authorization` | ✅ | `Bearer <token>` 形式のセッショントークン |

#### パスパラメータ

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `id` | `string` | ✅ | ユーザーの UUID |

#### リクエストボディ

なし

### レスポンス

#### `204 No Content`

レスポンスボディなし。削除成功。

#### `404 Not Found`

```json
{
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "ユーザーが見つかりません"
  }
}
```
