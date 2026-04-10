---
description: "Use when writing commit messages, naming branches, creating or reviewing issues and pull requests, or following the project's Git workflow conventions."
---

# Git ワークフロー規約

## ブランチ戦略（GitHub Flow ベース）

`main` ブランチは常にデプロイ可能な状態を保つ。作業は必ず専用ブランチで行い、Pull Request を経由してマージする。

### ブランチ命名規則

```
<type>/<issue-number>-<kebab-case-description>
```

| type | 用途 |
|---|---|
| `feature` | 新機能の追加 |
| `fix` | バグ修正 |
| `hotfix` | 本番環境の緊急修正 |
| `chore` | 依存関係更新・設定変更 |
| `docs` | ドキュメントのみの変更 |
| `ci` | CI / CD 設定の変更 |
| `release` | リリース準備（`release/v1.2.3`） |

**例:**
- `feature/42-add-todo-filter`
- `fix/57-fix-login-redirect`
- `chore/update-dependencies`

## コミットメッセージ（Conventional Commits）

```
<type>[(<scope>)]: <subject>

[optional body]

[optional footer]
```

### type 一覧

| type | 用途 |
|---|---|
| `feat` | 新機能の追加 |
| `fix` | バグ修正 |
| `docs` | ドキュメントのみの変更 |
| `style` | コードの意味に影響しない変更（空白・フォーマット等） |
| `refactor` | バグ修正でも新機能追加でもないコード変更 |
| `test` | テストの追加・修正 |
| `chore` | ビルドや補助ツールの変更 |
| `ci` | CI 設定ファイルの変更 |
| `perf` | パフォーマンス改善 |
| `revert` | 以前のコミットのリバート |

### scope（任意）

変更対象のサービスやモジュールを括弧内に記述する。例: `feat(api)`, `fix(web)`, `chore(db)`

### subject

- 命令形で記述する（「追加する」「修正する」等）
- 日本語で記述する
- 72 文字以内
- 末尾にピリオドをつけない

### 例

```
feat(api): todo 一覧取得エンドポイントを追加する

カテゴリとステータスでフィルタリングできるようにする。
ページネーションは後続のタスクで対応。

Closes #42
```

### Breaking Change

後方互換性のない変更は footer に明記する:

```
feat(api)!: 認証ヘッダーの形式を変更する

BREAKING CHANGE: Authorization ヘッダーが Bearer から Token に変わります。
クライアント側の変更が必要です。
```

## Pull Request 規約

- PR タイトルはコミットメッセージの `<type>(<scope>): <subject>` 形式に従う（スクワッシュマージ時にコミット履歴になるため）
- レビュアーを必ず 1 名以上アサインする
- スクリーンショット・動作確認結果をできるだけ添付する
- `main` への直接プッシュは禁止（ブランチ保護ルールで強制）
- PR のコミュニケーションはすべて **日本語** で行う
- 関連する Issue を PR 本文でリンクする（`Closes #<number>` / `Refs #<number>`）

## Issue 規約

- バグ報告・機能要望は必ず Issue テンプレートを使用する
- Issue タイトルは「何が問題か / 何をしたいか」を端的に記述する（日本語）
- 優先度ラベルを付与する: `priority: high` / `priority: medium` / `priority: low`
