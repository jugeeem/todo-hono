# Project Guidelines

## Overview

`service-template` はマイクロサービス構成で todo アプリケーションを構築するためのモノレポテンプレートです。
各サービスは `service/` 配下に独立して配置されます。

| ディレクトリ | 種別 | 役割 |
|---|---|---|
| `service/todo-db` | Git サブモジュール | 共有 PostgreSQL スキーマ定義（DDL） |
| `service/api` | サービス | バックエンド REST API（追加予定） |
| `service/web` | サービス | フロントエンド SPA（追加予定） |

## 開発環境

Docker Compose ベースの Dev Container 構成:

- **`app`** — Ubuntu 24.04 開発コンテナ（コードを書く場所）
- **`postgres`** — PostgreSQL 16（`ja_JP.UTF-8` ロケール）

### Dev Container の起動

1. VS Code コマンドパレット → `Dev Containers: Reopen in Container`
2. 起動後、以下のデータベースが自動プロビジョニングされます:
   - `todo_db` — 開発用
   - `todo_db_test` — テスト用
3. SQLTools で `host: postgres / port: 5432 / user: postgres / password: postgres` に接続可能

### DB サブモジュールの規約

`service/` 配下の任意の Git サブモジュールが以下のレイアウトに従っていれば、Dev Container 起動時に自動でデータベースが作成されます:

```
service/<submodule>/
└── src/DDL/database/
    └── *.sql   ← CREATE DATABASE 文のみ（スキーマ・テーブルは記載しない）
```

スキーマとテーブルの作成は各アプリケーションのマイグレーションフレームワークが担当します。

### DB サブモジュールの追加方法

```bash
git submodule add https://github.com/<org>/<repo> service/<name>
git submodule update --init --recursive
```

追加後、Dev Container をリビルドすると新しいデータベースが自動で作成されます。

## Git ワークフロー規約

詳細は `.github/instructions/git-conventions.instructions.md` を参照。

### ブランチ命名規則

```
<type>/<issue-number>-<kebab-case-description>
```

type: `feature` / `fix` / `hotfix` / `chore` / `docs` / `ci` / `release`

例: `feature/42-add-todo-filter`, `fix/57-fix-login-redirect`

### コミットメッセージ（Conventional Commits）

```
<type>(<scope>): <subject>
```

type: `feat` / `fix` / `docs` / `style` / `refactor` / `test` / `chore` / `ci` / `perf` / `revert`

subject: 命令形・日本語・72 文字以内

`.gitmessage` をコミットテンプレートとして使用する:

```bash
git config commit.template .gitmessage
```

### 自動検証（GitHub Actions）

| ワークフロー | ファイル | トリガー | 検証内容 |
|---|---|---|---|
| コミットメッセージ検証 | `.github/workflows/commit-lint.yml` | push / PR | Conventional Commits 準拠チェック |
| ブランチ名検証 | `.github/workflows/branch-name.yml` | PR | ブランチ命名規則チェック |

### Issue / PR テンプレート

| ファイル | 用途 |
|---|---|
| `.github/ISSUE_TEMPLATE/bug_report.yml` | バグ報告 Issue |
| `.github/ISSUE_TEMPLATE/feature_request.yml` | 機能要望 Issue |
| `.github/PULL_REQUEST_TEMPLATE.md` | Pull Request 説明文 |

> **注意**: 空白 Issue の作成は無効化済み（`config.yml`）。必ずテンプレートを使用すること。

## GitHub Copilot カスタマイズ

| ファイル | 種別 | 用途 |
|---|---|---|
| `.github/instructions/general.instructions.md` | Instructions | プロジェクト全体の規約 |
| `.github/instructions/git-conventions.instructions.md` | Instructions | Git ワークフロー規約 |
| `.github/instructions/testing.instructions.md` | Instructions | テスト作成ガイドライン（テストファイルに自動適用） |
| `.github/instructions/api.instructions.md` | Instructions | API 開発規約（`service/api/**` に自動適用） |
| `.github/instructions/web.instructions.md` | Instructions | Web フロントエンド規約（`service/web/**` に自動適用） |
| `.github/agents/api-developer.agent.md` | Agent | バックエンド API 開発専門エージェント |
| `.github/agents/web-developer.agent.md` | Agent | フロントエンド開発専門エージェント |
| `.github/prompts/code-review.prompt.md` | Prompt | `/code-review` — コードレビュー実施 |
| `.github/prompts/create-test.prompt.md` | Prompt | `/create-test` — テストコード生成 |
| `.github/prompts/create-api-endpoint.prompt.md` | Prompt | `/create-api-endpoint` — API エンドポイント雛形生成 |
| `.github/prompts/create-issue.prompt.md` | Prompt | `/create-issue` — Issue 本文の生成 |
| `.github/prompts/create-pr-description.prompt.md` | Prompt | `/create-pr-description` — PR 説明文の生成 |
| `.github/hooks/commit-convention.json` | Hook | `git commit` 実行前にコミット規約リマインダーを注入 |

## 共通規約

- GitHub Copilot の応答言語: **日本語**
- シークレット・認証情報はソースコードにコミットしない（`.env` ファイルを使用し `.gitignore` に追加）
- データベース: PostgreSQL 16、エンコーディング `UTF-8`、タイムゾーン `Asia/Tokyo`
- セキュリティ: OWASP Top 10 に準拠したコードを記述すること
