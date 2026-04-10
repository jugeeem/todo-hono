---
description: "Use when writing new features, reviewing code quality, refactoring, or working with shared utilities in this project. Covers naming conventions, security policy, DB submodule structure, and cross-service contracts."
---

# General Project Guidelines

## Project Overview

マイクロサービス構成の todo アプリケーション。各サービスは `service/` 配下に独立して配置される。

- `service/todo-db` — 共有 PostgreSQL スキーマ定義（Git サブモジュール）
- `service/api` — バックエンド REST API
- `service/web` — フロントエンド SPA

## データベース規約

- スキーマ・テーブルの作成は各アプリケーションのマイグレーションフレームワークが担当する
- Dev Container はデータベースの **空のプロビジョニングのみ** 行う（CREATE DATABASE のみ）
- DB サブモジュールは `service/*/src/DDL/database/*.sql` に CREATE DATABASE 文のみ配置する
- PostgreSQL ホスト（Dev Container 内）: `postgres:5432`、ユーザー/パスワード: `postgres`

## 命名規約

| 対象 | 規約 | 例 |
|---|---|---|
| ファイル名 | `kebab-case` | `todo-service.ts` |
| DB 識別子 | `lower_snake_case` | `todo_items` |
| 環境変数 | `UPPER_SNAKE_CASE` | `DATABASE_URL` |

## セキュリティ

- シークレット・認証情報をソースコードにコミットしない（`.env` を使用し `.gitignore` に追加）
- ユーザー入力は必ずサービス境界でバリデーション・サニタイズする
- パラメータ化クエリを使用すること（SQL インジェクション防止）
- OWASP Top 10 に準拠したコードを記述すること

## 応答言語

GitHub Copilot は **日本語** で応答すること。
