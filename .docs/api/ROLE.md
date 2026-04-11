# ロール API

ロールの管理を行うエンドポイントです。  
すべてのエンドポイントに `Authorization: Bearer <token>` ヘッダーが必要です。  
ロールにはパーミッションを関連付けることができます。

---

## `GET /api/roles`

ロール一覧を取得します（作成日時の昇順）。各ロールに紐づくパーミッション情報も含まれます。

### 認可

| 必要権限 |
|---|
| `roles:read` |

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
      "name": "admin",
      "description": "管理者ロール",
      "createdAt": "2026-04-10T10:00:00.000Z",
      "updatedAt": "2026-04-10T10:00:00.000Z",
      "permissions": [
        {
          "id": "perm-uuid-001",
          "name": "todos:read",
          "description": "Todo の閲覧権限"
        },
        {
          "id": "perm-uuid-002",
          "name": "todos:write",
          "description": "Todo の編集権限"
        }
      ]
    }
  ],
  "error": null
}
```

#### レスポンスフィールド（Role オブジェクト）

| フィールド | 型 | 説明 |
|---|---|---|
| `id` | `string` | ロールの一意識別子（UUID） |
| `name` | `string` | ロール名 |
| `description` | `string \| null` | 説明 |
| `createdAt` | `string` | 作成日時（ISO 8601 形式） |
| `updatedAt` | `string` | 更新日時（ISO 8601 形式） |
| `permissions` | `PermissionSummary[]` | 関連付けられたパーミッション一覧 |

#### PermissionSummary オブジェクト

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

## `GET /api/roles/:id`

指定したロールの詳細を取得します。

### 認可

| 必要権限 |
|---|
| `roles:read` |

### リクエスト

#### ヘッダー

| ヘッダー | 必須 | 説明 |
|---|---|---|
| `Authorization` | ✅ | `Bearer <token>` 形式のセッショントークン |

#### パスパラメータ

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `id` | `string` | ✅ | ロールの UUID |

#### リクエストボディ

なし

### レスポンス

#### `200 OK`

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "admin",
    "description": "管理者ロール",
    "createdAt": "2026-04-10T10:00:00.000Z",
    "updatedAt": "2026-04-10T10:00:00.000Z",
    "permissions": [
      {
        "id": "perm-uuid-001",
        "name": "todos:read",
        "description": "Todo の閲覧権限"
      }
    ]
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
    "message": "ロールが見つかりません"
  }
}
```

---

## `POST /api/roles`

新しいロールを作成します。同名のロールが既に存在する場合は `409 Conflict` を返します。

### 認可

| 必要権限 |
|---|
| `roles:write` |

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
  "name": "editor",
  "description": "編集者ロール"
}
```

| フィールド | 型 | 必須 | バリデーション | 説明 |
|---|---|---|---|---|
| `name` | `string` | ✅ | 1〜256 文字 | ロール名 |
| `description` | `string` | — | — | 説明 |

### レスポンス

#### `201 Created`

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "editor",
    "description": "編集者ロール",
    "createdAt": "2026-04-10T10:00:00.000Z",
    "updatedAt": "2026-04-10T10:00:00.000Z",
    "permissions": []
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
    "message": "ロール \"editor\" は既に存在します"
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

## `PATCH /api/roles/:id`

指定したロールを更新します。リクエストボディに含まれたフィールドのみ更新されます。

### 認可

| 必要権限 |
|---|
| `roles:write` |

### リクエスト

#### ヘッダー

| ヘッダー | 必須 | 説明 |
|---|---|---|
| `Authorization` | ✅ | `Bearer <token>` 形式のセッショントークン |
| `Content-Type` | ✅ | `application/json` |

#### パスパラメータ

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `id` | `string` | ✅ | ロールの UUID |

#### リクエストボディ

```json
{
  "name": "senior_editor",
  "description": "上級編集者ロール"
}
```

| フィールド | 型 | 必須 | バリデーション | 説明 |
|---|---|---|---|---|
| `name` | `string` | — | 1〜256 文字 | ロール名 |
| `description` | `string` | — | — | 説明 |

### レスポンス

#### `200 OK`

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "senior_editor",
    "description": "上級編集者ロール",
    "createdAt": "2026-04-10T10:00:00.000Z",
    "updatedAt": "2026-04-11T08:30:00.000Z",
    "permissions": []
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
    "message": "ロールが見つかりません"
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

## `DELETE /api/roles/:id`

指定したロールを削除します（論理削除）。

### 認可

| 必要権限 |
|---|
| `roles:write` |

### リクエスト

#### ヘッダー

| ヘッダー | 必須 | 説明 |
|---|---|---|
| `Authorization` | ✅ | `Bearer <token>` 形式のセッショントークン |

#### パスパラメータ

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `id` | `string` | ✅ | ロールの UUID |

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
    "message": "ロールが見つかりません"
  }
}
```

---

## `POST /api/roles/:id/permissions`

指定したロールにパーミッションを追加します。

### 認可

| 必要権限 |
|---|
| `roles:write` |

### リクエスト

#### ヘッダー

| ヘッダー | 必須 | 説明 |
|---|---|---|
| `Authorization` | ✅ | `Bearer <token>` 形式のセッショントークン |
| `Content-Type` | ✅ | `application/json` |

#### パスパラメータ

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `id` | `string` | ✅ | ロールの UUID |

#### リクエストボディ

```json
{
  "permissionId": "perm-uuid-001"
}
```

| フィールド | 型 | 必須 | バリデーション | 説明 |
|---|---|---|---|---|
| `permissionId` | `string` | ✅ | UUID 形式 | 追加するパーミッションの ID |

### レスポンス

#### `204 No Content`

レスポンスボディなし。追加成功。

#### `404 Not Found`

ロールまたはパーミッションが見つからない場合:

```json
{
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "ロールが見つかりません"
  }
}
```

```json
{
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "パーミッションが見つかりません"
  }
}
```

#### `409 Conflict`

```json
{
  "data": null,
  "error": {
    "code": "CONFLICT",
    "message": "このパーミッションは既にロールに割り当てられています"
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

## `DELETE /api/roles/:id/permissions/:permissionId`

指定したロールからパーミッションを削除します（論理削除）。

### 認可

| 必要権限 |
|---|
| `roles:write` |

### リクエスト

#### ヘッダー

| ヘッダー | 必須 | 説明 |
|---|---|---|
| `Authorization` | ✅ | `Bearer <token>` 形式のセッショントークン |

#### パスパラメータ

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `id` | `string` | ✅ | ロールの UUID |
| `permissionId` | `string` | ✅ | パーミッションの UUID |

#### リクエストボディ

なし

### レスポンス

#### `204 No Content`

レスポンスボディなし。削除成功。
