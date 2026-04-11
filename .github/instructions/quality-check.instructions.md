---
description: "Use after completing any code changes in service/app. Enforces running format, lint, and type-check before considering the task done."
applyTo: "service/app/**"
---

# コード品質チェック（必須）

## 実行タイミング

`service/app/` 配下のファイル（Hono バックエンド・Next.js フロントエンド問わず）を新規作成・修正した場合、**タスク完了前に必ず以下のコマンドを実行すること**。

## 実行コマンド

```bash
cd service/app && bun run format && bun run check && bun run type-check
```

| コマンド | 目的 |
|---|---|
| `bun run format` | Biome によるコードフォーマット |
| `bun run check` | Biome による lint + フォーマットチェック |
| `bun run type-check` | TypeScript 型チェック（`tsc --noEmit`） |

## ルール

- 3 つのコマンドが **すべてエラー 0・警告 0** で通るまで修正を繰り返すこと
- warning が残っている場合は `--unsafe` フラグを使わず、コードを手動で修正すること
- フォーマットや lint の自動修正でファイルが変更された場合、変更内容を確認してから次に進むこと
