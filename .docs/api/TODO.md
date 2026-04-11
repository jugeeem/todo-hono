# Todo API

Todo の CRUD 操作を行うエンドポイントです。  
すべてのエンドポイントに `Authorization: Bearer <token>` ヘッダーが必要です。  
Todo はユーザーごとにスコープされ、自分の Todo のみ操作可能です。

---

## `GET /api/todos`

認証ユーザーの Todo 一覧を取得します（作成日時の降順）。

### 認可

| 必要権限 |
|---|
| `todos:read` |

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
      "title": "買い物に行く",
      "description": "牛乳と卵を買う",
      "status": "pending",
      "priority": 2,
      "dueDate": "2026-04-15T09:00:00.000Z",
      "completedAt": null,
      "userId": "user-uuid-001",
      "categoryId": null,
      "parentTodoId": null,
      "createdAt": "2026-04-10T10:00:00.000Z",
      "updatedAt": "2026-04-10T10:00:00.000Z"
    }
  ],
  "error": null
}
```

#### レスポンスフィールド（Todo オブジェクト）

| フィールド | 型 | 説明 |
|---|---|---|
| `id` | `string` | Todo の一意識別子（UUID） |
| `title` | `string` | タイトル |
| `description` | `string \| null` | 説明 |
| `status` | `string` | ステータス（`pending` / `in_progress` / `done` / `cancelled`） |
| `priority` | `number` | 優先度（1〜5） |
| `dueDate` | `string \| null` | 期限（ISO 8601 形式） |
| `completedAt` | `string \| null` | 完了日時（ISO 8601 形式） |
| `userId` | `string` | 所有ユーザー ID（UUID） |
| `categoryId` | `string \| null` | カテゴリ ID（UUID） |
| `parentTodoId` | `string \| null` | 親 Todo ID（UUID） |
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

## `GET /api/todos/:id`

指定した Todo の詳細を取得します。

### 認可

| 必要権限 |
|---|
| `todos:read` |

### リクエスト

#### ヘッダー

| ヘッダー | 必須 | 説明 |
|---|---|---|
| `Authorization` | ✅ | `Bearer <token>` 形式のセッショントークン |

#### パスパラメータ

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `id` | `string` | ✅ | Todo の UUID |

#### リクエストボディ

なし

### レスポンス

#### `200 OK`

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "買い物に行く",
    "description": "牛乳と卵を買う",
    "status": "pending",
    "priority": 2,
    "dueDate": "2026-04-15T09:00:00.000Z",
    "completedAt": null,
    "userId": "user-uuid-001",
    "categoryId": null,
    "parentTodoId": null,
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
    "message": "Todo が見つかりません"
  }
}
```

---

## `POST /api/todos`

新しい Todo を作成します。

### 認可

| 必要権限 |
|---|
| `todos:write` |

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
  "title": "買い物に行く",
  "description": "牛乳と卵を買う",
  "status": "pending",
  "priority": 2,
  "dueDate": "2026-04-15T09:00:00.000Z",
  "categoryId": "category-uuid-001",
  "parentTodoId": "parent-todo-uuid-001"
}
```

| フィールド | 型 | 必須 | デフォルト | バリデーション | 説明 |
|---|---|---|---|---|---|
| `title` | `string` | ✅ | — | 1〜256 文字 | タイトル |
| `description` | `string` | — | `undefined` | — | 説明 |
| `status` | `string` | — | `"pending"` | `pending` / `in_progress` / `done` / `cancelled` | ステータス |
| `priority` | `number` | — | `2` | 1〜5（整数） | 優先度 |
| `dueDate` | `string` | — | `undefined` | ISO 8601 datetime | 期限 |
| `categoryId` | `string` | — | `undefined` | UUID 形式 | カテゴリ ID |
| `parentTodoId` | `string` | — | `undefined` | UUID 形式 | 親 Todo ID |

### レスポンス

#### `201 Created`

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "買い物に行く",
    "description": "牛乳と卵を買う",
    "status": "pending",
    "priority": 2,
    "dueDate": "2026-04-15T09:00:00.000Z",
    "completedAt": null,
    "userId": "user-uuid-001",
    "categoryId": "category-uuid-001",
    "parentTodoId": "parent-todo-uuid-001",
    "createdAt": "2026-04-10T10:00:00.000Z",
    "updatedAt": "2026-04-10T10:00:00.000Z"
  },
  "error": null
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

## `PATCH /api/todos/:id`

指定した Todo を更新します。リクエストボディに含まれたフィールドのみ更新されます。

### 認可

| 必要権限 |
|---|
| `todos:write` |

### リクエスト

#### ヘッダー

| ヘッダー | 必須 | 説明 |
|---|---|---|
| `Authorization` | ✅ | `Bearer <token>` 形式のセッショントークン |
| `Content-Type` | ✅ | `application/json` |

#### パスパラメータ

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `id` | `string` | ✅ | Todo の UUID |

#### リクエストボディ

```json
{
  "title": "買い物に行く（更新）",
  "description": null,
  "status": "in_progress",
  "priority": 3,
  "dueDate": "2026-04-20T09:00:00.000Z",
  "completedAt": null,
  "categoryId": null
}
```

| フィールド | 型 | 必須 | バリデーション | 説明 |
|---|---|---|---|---|
| `title` | `string` | — | 1〜256 文字 | タイトル |
| `description` | `string \| null` | — | — | 説明（`null` でクリア） |
| `status` | `string` | — | `pending` / `in_progress` / `done` / `cancelled` | ステータス |
| `priority` | `number` | — | 1〜5（整数） | 優先度 |
| `dueDate` | `string \| null` | — | ISO 8601 datetime / `null` | 期限（`null` でクリア） |
| `completedAt` | `string \| null` | — | ISO 8601 datetime / `null` | 完了日時（`null` でクリア） |
| `categoryId` | `string \| null` | — | UUID 形式 / `null` | カテゴリ ID（`null` でクリア） |

### レスポンス

#### `200 OK`

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "買い物に行く（更新）",
    "description": null,
    "status": "in_progress",
    "priority": 3,
    "dueDate": "2026-04-20T09:00:00.000Z",
    "completedAt": null,
    "userId": "user-uuid-001",
    "categoryId": null,
    "parentTodoId": null,
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
    "message": "Todo が見つかりません"
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

## `DELETE /api/todos/:id`

指定した Todo を削除します（論理削除）。

### 認可

| 必要権限 |
|---|
| `todos:write` |

### リクエスト

#### ヘッダー

| ヘッダー | 必須 | 説明 |
|---|---|---|
| `Authorization` | ✅ | `Bearer <token>` 形式のセッショントークン |

#### パスパラメータ

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `id` | `string` | ✅ | Todo の UUID |

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
    "message": "Todo が見つかりません"
  }
}
```
