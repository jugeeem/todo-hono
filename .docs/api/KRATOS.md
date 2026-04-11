# Ory Kratos 認証 API

本プロジェクトでは [Ory Kratos](https://www.ory.sh/kratos/) v1.3.0 を認証基盤として使用しています。  
アカウント登録・ログイン・ログアウト・パスワードリカバリーなどの認証フローは、すべて Kratos の Public API を通じて行います。

## 概要

| 項目 | 値 |
|---|---|
| Kratos バージョン | `v1.3.0` |
| Public API ベース URL | `http://kratos:4433` |
| Admin API ベース URL | `http://kratos:4434`（サーバー内部のみ） |
| セッション有効期限 | 24 時間 |
| パスワードハッシュ | Argon2（128MB / 2 iterations） |
| Cookie SameSite | `Lax` |

## Identity スキーマ

ユーザー登録時に必要な traits は以下の通りです。

| フィールド | 型 | 必須 | バリデーション | 説明 |
|---|---|---|---|---|
| `email` | `string` | ✅ | メールアドレス形式 | メールアドレス（ログイン識別子） |
| `username` | `string` | ✅ | 1〜256 文字 | ユーザー名 |

`email` はパスワード認証の識別子（identifier）、メール検証・パスワードリカバリーの宛先として使用されます。

---

## 認証フロー

Kratos は **セルフサービスフロー** 方式を採用しています。  
各フローは「フロー初期化 → フロー情報取得 → フロー送信」の 2〜3 ステップで構成されます。

### 対応フロー

| フロー | 状態 | UI URL | 有効期限 |
|---|---|---|---|
| アカウント登録 | ✅ 有効 | `http://localhost:3000/auth/registration` | 10 分 |
| ログイン | ✅ 有効 | `http://localhost:3000/auth/login` | 10 分 |
| ログアウト | ✅ 有効 | — | — |
| アカウント設定 | ✅ 有効 | `http://localhost:3000/auth/settings` | — |
| パスワードリカバリー | ✅ 有効 | `http://localhost:3000/auth/recovery` | — |
| メール検証 | ✅ 有効 | `http://localhost:3000/auth/verification` | — |

---

## エンドポイント一覧

### アカウント登録

| メソッド | パス | 説明 |
|---|---|---|
| `GET` | `/self-service/registration/api` | ネイティブ登録フローの初期化 |
| `GET` | `/self-service/registration/flows?id={flow_id}` | 登録フロー情報の取得 |
| `POST` | `/self-service/registration?flow={flow_id}` | 登録フローの送信 |

### ログイン

| メソッド | パス | 説明 |
|---|---|---|
| `GET` | `/self-service/login/api` | ネイティブログインフローの初期化 |
| `GET` | `/self-service/login/flows?id={flow_id}` | ログインフロー情報の取得 |
| `POST` | `/self-service/login?flow={flow_id}` | ログインフローの送信 |

### ログアウト

| メソッド | パス | 説明 |
|---|---|---|
| `DELETE` | `/self-service/logout/api` | ネイティブログアウト |

### セッション

| メソッド | パス | 説明 |
|---|---|---|
| `GET` | `/sessions/whoami` | セッション情報の取得 |

### アカウント設定

| メソッド | パス | 説明 |
|---|---|---|
| `GET` | `/self-service/settings/api` | ネイティブ設定フローの初期化 |
| `GET` | `/self-service/settings/flows?id={flow_id}` | 設定フロー情報の取得 |
| `POST` | `/self-service/settings?flow={flow_id}` | 設定フローの送信 |

### パスワードリカバリー

| メソッド | パス | 説明 |
|---|---|---|
| `GET` | `/self-service/recovery/api` | ネイティブリカバリーフローの初期化 |
| `GET` | `/self-service/recovery/flows?id={flow_id}` | リカバリーフロー情報の取得 |
| `POST` | `/self-service/recovery?flow={flow_id}` | リカバリーフローの送信 |

### メール検証

| メソッド | パス | 説明 |
|---|---|---|
| `GET` | `/self-service/verification/api` | ネイティブ検証フローの初期化 |
| `GET` | `/self-service/verification/flows?id={flow_id}` | 検証フロー情報の取得 |
| `POST` | `/self-service/verification?flow={flow_id}` | 検証フローの送信 |

---

## アカウント登録

### Step 1: フローの初期化

#### `GET /self-service/registration/api`

登録フローを開始し、フロー ID と UI ノード情報を取得します。

##### リクエスト

パラメータ・ボディなし。

##### レスポンス `200 OK`

```json
{
  "id": "flow-uuid",
  "type": "api",
  "expires_at": "2026-04-11T10:10:00.000Z",
  "issued_at": "2026-04-11T10:00:00.000Z",
  "request_url": "http://kratos:4433/self-service/registration/api",
  "ui": {
    "action": "http://kratos:4433/self-service/registration?flow=flow-uuid",
    "method": "POST",
    "nodes": [
      {
        "type": "input",
        "group": "password",
        "attributes": {
          "name": "traits.email",
          "type": "email",
          "required": true
        }
      },
      {
        "type": "input",
        "group": "password",
        "attributes": {
          "name": "traits.username",
          "type": "text",
          "required": true
        }
      },
      {
        "type": "input",
        "group": "password",
        "attributes": {
          "name": "password",
          "type": "password",
          "required": true
        }
      },
      {
        "type": "input",
        "group": "password",
        "attributes": {
          "name": "method",
          "type": "submit",
          "value": "password"
        }
      }
    ]
  }
}
```

### Step 2: フローの送信

#### `POST /self-service/registration?flow={flow_id}`

##### リクエスト

###### クエリパラメータ

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `flow` | `string` | ✅ | Step 1 で取得したフロー ID |

###### リクエストボディ

```json
{
  "method": "password",
  "traits.email": "user@example.com",
  "traits.username": "example_user",
  "password": "SecurePassword123!"
}
```

| フィールド | 型 | 必須 | バリデーション | 説明 |
|---|---|---|---|---|
| `method` | `string` | ✅ | `"password"` 固定 | 認証メソッド |
| `traits.email` | `string` | ✅ | メールアドレス形式 | メールアドレス |
| `traits.username` | `string` | ✅ | 1〜256 文字 | ユーザー名 |
| `password` | `string` | ✅ | Kratos ポリシーに準拠 | パスワード |

##### レスポンス `200 OK`（登録成功）

```json
{
  "session_token": "ory_st_...",
  "session": {
    "id": "session-uuid",
    "active": true,
    "expires_at": "2026-04-12T10:00:00.000Z",
    "authenticated_at": "2026-04-11T10:00:00.000Z",
    "identity": {
      "id": "identity-uuid",
      "schema_id": "default",
      "traits": {
        "email": "user@example.com",
        "username": "example_user"
      },
      "verifiable_addresses": [
        {
          "id": "addr-uuid",
          "value": "user@example.com",
          "verified": false,
          "via": "email",
          "status": "sent"
        }
      ]
    }
  },
  "identity": {
    "id": "identity-uuid",
    "schema_id": "default",
    "traits": {
      "email": "user@example.com",
      "username": "example_user"
    }
  }
}
```

> **`session_token`** を保存し、本 API（Hono）へのリクエスト時に `Authorization: Bearer <session_token>` ヘッダーとして使用します。

##### レスポンス `400 Bad Request`（バリデーションエラー）

```json
{
  "id": "flow-uuid",
  "type": "api",
  "ui": {
    "action": "http://kratos:4433/self-service/registration?flow=flow-uuid",
    "method": "POST",
    "messages": [
      {
        "id": 4000001,
        "text": "メールアドレスは既に使用されています",
        "type": "error"
      }
    ],
    "nodes": [...]
  }
}
```

##### レスポンス `410 Gone`（フロー期限切れ）

```json
{
  "error": {
    "id": "self-service-flow-expired",
    "code": 410,
    "status": "Gone",
    "message": "Self-service flow expired 0.00 minutes ago, initialize a new one."
  }
}
```

---

## ログイン

### Step 1: フローの初期化

#### `GET /self-service/login/api`

ログインフローを開始します。

##### リクエスト

パラメータ・ボディなし。

##### レスポンス `200 OK`

```json
{
  "id": "flow-uuid",
  "type": "api",
  "expires_at": "2026-04-11T10:10:00.000Z",
  "issued_at": "2026-04-11T10:00:00.000Z",
  "request_url": "http://kratos:4433/self-service/login/api",
  "ui": {
    "action": "http://kratos:4433/self-service/login?flow=flow-uuid",
    "method": "POST",
    "nodes": [
      {
        "type": "input",
        "group": "password",
        "attributes": {
          "name": "identifier",
          "type": "text",
          "required": true
        }
      },
      {
        "type": "input",
        "group": "password",
        "attributes": {
          "name": "password",
          "type": "password",
          "required": true
        }
      },
      {
        "type": "input",
        "group": "password",
        "attributes": {
          "name": "method",
          "type": "submit",
          "value": "password"
        }
      }
    ]
  }
}
```

### Step 2: フローの送信

#### `POST /self-service/login?flow={flow_id}`

##### リクエスト

###### クエリパラメータ

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `flow` | `string` | ✅ | Step 1 で取得したフロー ID |

###### リクエストボディ

```json
{
  "method": "password",
  "identifier": "user@example.com",
  "password": "SecurePassword123!"
}
```

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `method` | `string` | ✅ | `"password"` 固定 |
| `identifier` | `string` | ✅ | メールアドレス（ログイン識別子） |
| `password` | `string` | ✅ | パスワード |

##### レスポンス `200 OK`（ログイン成功）

```json
{
  "session_token": "ory_st_...",
  "session": {
    "id": "session-uuid",
    "active": true,
    "expires_at": "2026-04-12T10:00:00.000Z",
    "authenticated_at": "2026-04-11T10:00:00.000Z",
    "identity": {
      "id": "identity-uuid",
      "schema_id": "default",
      "traits": {
        "email": "user@example.com",
        "username": "example_user"
      }
    }
  }
}
```

> **`session_token`** を保存し、以降のリクエストに使用します。

##### レスポンス `400 Bad Request`（認証失敗）

```json
{
  "id": "flow-uuid",
  "type": "api",
  "ui": {
    "messages": [
      {
        "id": 4000006,
        "text": "The provided credentials are invalid, check for spelling mistakes in your password or username, email address, or phone number.",
        "type": "error"
      }
    ],
    "nodes": [...]
  }
}
```

##### レスポンス `410 Gone`（フロー期限切れ）

```json
{
  "error": {
    "id": "self-service-flow-expired",
    "code": 410,
    "status": "Gone",
    "message": "Self-service flow expired 0.00 minutes ago, initialize a new one."
  }
}
```

---

## ログアウト

#### `DELETE /self-service/logout/api`

ネイティブセッションを無効化します。

##### リクエスト

###### リクエストボディ

```json
{
  "session_token": "ory_st_..."
}
```

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `session_token` | `string` | ✅ | 無効化するセッショントークン |

##### レスポンス `204 No Content`

レスポンスボディなし。ログアウト成功。

##### レスポンス `400 Bad Request`

```json
{
  "error": {
    "code": 400,
    "message": "No active session was found in this request."
  }
}
```

---

## セッション情報取得

#### `GET /sessions/whoami`

現在のセッション情報を取得します。

##### リクエスト

###### ヘッダー

| ヘッダー | 必須 | 説明 |
|---|---|---|
| `X-Session-Token` | ✅ | セッショントークン |

##### レスポンス `200 OK`

```json
{
  "id": "session-uuid",
  "active": true,
  "expires_at": "2026-04-12T10:00:00.000Z",
  "authenticated_at": "2026-04-11T10:00:00.000Z",
  "identity": {
    "id": "identity-uuid",
    "schema_id": "default",
    "state": "active",
    "traits": {
      "email": "user@example.com",
      "username": "example_user"
    },
    "verifiable_addresses": [
      {
        "id": "addr-uuid",
        "value": "user@example.com",
        "verified": true,
        "via": "email",
        "status": "completed"
      }
    ]
  }
}
```

##### レスポンス `401 Unauthorized`

```json
{
  "error": {
    "code": 401,
    "status": "Unauthorized",
    "message": "No valid session credentials found in the request."
  }
}
```

---

## パスワードリカバリー

リカバリーはメールコード方式で行います。

### Step 1: フローの初期化

#### `GET /self-service/recovery/api`

##### レスポンス `200 OK`

```json
{
  "id": "flow-uuid",
  "type": "api",
  "state": "choose_method",
  "ui": {
    "action": "http://kratos:4433/self-service/recovery?flow=flow-uuid",
    "method": "POST",
    "nodes": [
      {
        "type": "input",
        "group": "code",
        "attributes": {
          "name": "email",
          "type": "email",
          "required": true
        }
      },
      {
        "type": "input",
        "group": "code",
        "attributes": {
          "name": "method",
          "type": "submit",
          "value": "code"
        }
      }
    ]
  }
}
```

### Step 2: メールアドレス送信

#### `POST /self-service/recovery?flow={flow_id}`

##### リクエストボディ

```json
{
  "method": "code",
  "email": "user@example.com"
}
```

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `method` | `string` | ✅ | `"code"` 固定 |
| `email` | `string` | ✅ | 登録済みメールアドレス |

##### レスポンス `200 OK`

フローの `state` が `sent_email` に変わり、コード入力用の UI ノードが返されます。

### Step 3: コード入力

#### `POST /self-service/recovery?flow={flow_id}`

##### リクエストボディ

```json
{
  "method": "code",
  "code": "123456"
}
```

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `method` | `string` | ✅ | `"code"` 固定 |
| `code` | `string` | ✅ | メールで受信した確認コード |

##### レスポンス `200 OK`（検証成功）

セッショントークンが発行され、設定フロー（パスワード変更）にリダイレクトされます。

---

## メール検証

メール検証もコード方式で行います。

### Step 1: フローの初期化

#### `GET /self-service/verification/api`

##### レスポンス `200 OK`

```json
{
  "id": "flow-uuid",
  "type": "api",
  "state": "choose_method",
  "ui": {
    "action": "http://kratos:4433/self-service/verification?flow=flow-uuid",
    "method": "POST",
    "nodes": [
      {
        "type": "input",
        "group": "code",
        "attributes": {
          "name": "email",
          "type": "email",
          "required": true
        }
      },
      {
        "type": "input",
        "group": "code",
        "attributes": {
          "name": "method",
          "type": "submit",
          "value": "code"
        }
      }
    ]
  }
}
```

### Step 2: メールアドレス送信

#### `POST /self-service/verification?flow={flow_id}`

##### リクエストボディ

```json
{
  "method": "code",
  "email": "user@example.com"
}
```

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `method` | `string` | ✅ | `"code"` 固定 |
| `email` | `string` | ✅ | 検証するメールアドレス |

### Step 3: コード入力

#### `POST /self-service/verification?flow={flow_id}`

##### リクエストボディ

```json
{
  "method": "code",
  "code": "123456"
}
```

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `method` | `string` | ✅ | `"code"` 固定 |
| `code` | `string` | ✅ | メールで受信した確認コード |

##### レスポンス `200 OK`（検証成功）

フローの `state` が `passed_challenge` に変わります。

---

## アカウント設定

パスワード変更やプロフィール更新を行います。

### Step 1: フローの初期化

#### `GET /self-service/settings/api`

##### ヘッダー

| ヘッダー | 必須 | 説明 |
|---|---|---|
| `X-Session-Token` | ✅ | セッショントークン |

##### レスポンス `200 OK`

```json
{
  "id": "flow-uuid",
  "type": "api",
  "state": "show_form",
  "identity": {
    "id": "identity-uuid",
    "traits": {
      "email": "user@example.com",
      "username": "example_user"
    }
  },
  "ui": {
    "action": "http://kratos:4433/self-service/settings?flow=flow-uuid",
    "method": "POST",
    "nodes": [
      {
        "type": "input",
        "group": "profile",
        "attributes": {
          "name": "traits.email",
          "type": "email",
          "value": "user@example.com"
        }
      },
      {
        "type": "input",
        "group": "profile",
        "attributes": {
          "name": "traits.username",
          "type": "text",
          "value": "example_user"
        }
      },
      {
        "type": "input",
        "group": "password",
        "attributes": {
          "name": "password",
          "type": "password"
        }
      }
    ]
  }
}
```

### Step 2: プロフィール更新

#### `POST /self-service/settings?flow={flow_id}`

##### ヘッダー

| ヘッダー | 必須 | 説明 |
|---|---|---|
| `X-Session-Token` | ✅ | セッショントークン |

##### リクエストボディ（プロフィール変更）

```json
{
  "method": "profile",
  "traits.email": "new_email@example.com",
  "traits.username": "new_username"
}
```

##### リクエストボディ（パスワード変更）

```json
{
  "method": "password",
  "password": "NewSecurePassword456!"
}
```

##### レスポンス `200 OK`（更新成功）

フローの `state` が `success` に変わります。

---

## 本 API との連携フロー

```
┌──────────────┐     1. 登録/ログイン     ┌──────────────┐
│              │ ──────────────────────▶  │              │
│  クライアント  │                          │  Ory Kratos  │
│              │ ◀──────────────────────  │  :4433       │
└──────┬───────┘   session_token 発行     └──────────────┘
       │
       │ 2. Authorization: Bearer <session_token>
       ▼
┌──────────────┐     3. toSession()       ┌──────────────┐
│              │ ──────────────────────▶  │              │
│  本 API      │                          │  Ory Kratos  │
│  (Hono)      │ ◀──────────────────────  │  :4433       │
│  :3000       │   セッション検証結果       └──────────────┘
│              │
│  4. JIT プロビジョニング（初回のみ DB にユーザー作成）
│  5. パーミッション取得 → レスポンス返却
└──────────────┘
```

## エラーレスポンス共通形式

Kratos のエラーレスポンスは以下の形式です。

```json
{
  "error": {
    "id": "error-id",
    "code": 400,
    "status": "Bad Request",
    "reason": "エラーの理由",
    "message": "エラーメッセージ"
  }
}
```

| HTTP ステータス | 説明 |
|---|---|
| `400` | バリデーションエラー・認証失敗 |
| `401` | セッションが無効または未認証 |
| `403` | アクセス拒否 |
| `410` | フロー期限切れ（再初期化が必要） |
| `422` | リダイレクトが必要（ブラウザフロー） |
