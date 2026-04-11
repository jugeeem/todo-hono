# 認証 API

認証済みセッションの管理を行うエンドポイントです。  
すべてのエンドポイントに `Authorization: Bearer <token>` ヘッダーが必要です。

---

## `GET /api/auth/session`

現在のセッション情報（ユーザー情報と権限一覧）を取得します。

### 認可

| 必要権限 |
|---|
| なし（認証のみ必要） |

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
  "data": {
    "user": {
      "identityId": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "username": "example_user",
      "sessionId": "session_abc123"
    },
    "permissions": [
      "todos:read",
      "todos:write",
      "roles:read"
    ]
  },
  "error": null
}
```

#### レスポンスフィールド

| フィールド | 型 | 説明 |
|---|---|---|
| `data.user.identityId` | `string` | ユーザーの一意識別子（UUID） |
| `data.user.email` | `string` | メールアドレス |
| `data.user.username` | `string` | ユーザー名 |
| `data.user.sessionId` | `string` | セッション ID |
| `data.permissions` | `string[]` | ユーザーが持つ権限名の一覧 |

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

---

## `DELETE /api/auth/session`

現在のセッションを無効化（ログアウト）します。

### 認可

| 必要権限 |
|---|
| なし（認証のみ必要） |

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

#### `204 No Content`

レスポンスボディなし。ログアウト成功。

#### `401 Unauthorized`

```json
{
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "認証が必要です"
  }
}
```
