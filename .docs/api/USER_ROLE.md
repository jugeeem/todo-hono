# ユーザー・ロール API

ユーザーとロールの関連付けを管理するエンドポイントです。  
すべてのエンドポイントに `Authorization: Bearer <token>` ヘッダーが必要です。

---

## `GET /api/users/:id/roles`

指定したユーザーに割り当てられたロール一覧を取得します（割り当て日時の昇順）。

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
  "data": [
    {
      "id": "ur-uuid-001",
      "roleId": "role-uuid-001",
      "roleName": "admin",
      "roleDescription": "管理者ロール",
      "assignedAt": "2026-04-10T10:00:00.000Z"
    }
  ],
  "error": null
}
```

#### レスポンスフィールド（UserRole オブジェクト）

| フィールド | 型 | 説明 |
|---|---|---|
| `id` | `string` | ユーザー・ロール関連付けの一意識別子（UUID） |
| `roleId` | `string` | ロール ID（UUID） |
| `roleName` | `string` | ロール名 |
| `roleDescription` | `string \| null` | ロールの説明 |
| `assignedAt` | `string` | 割り当て日時（ISO 8601 形式） |

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

## `POST /api/users/:id/roles`

指定したユーザーにロールを割り当てます。既に同じロールが割り当てられている場合は `409 Conflict` を返します。

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
  "roleId": "role-uuid-001"
}
```

| フィールド | 型 | 必須 | バリデーション | 説明 |
|---|---|---|---|---|
| `roleId` | `string` | ✅ | UUID 形式 | 割り当てるロールの ID |

### レスポンス

#### `204 No Content`

レスポンスボディなし。割り当て成功。

#### `409 Conflict`

```json
{
  "data": null,
  "error": {
    "code": "CONFLICT",
    "message": "このロールは既にユーザーに割り当てられています"
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

## `DELETE /api/users/:id/roles/:roleId`

指定したユーザーからロールを削除します（論理削除）。

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
| `roleId` | `string` | ✅ | ロールの UUID |

#### リクエストボディ

なし

### レスポンス

#### `204 No Content`

レスポンスボディなし。削除成功。
