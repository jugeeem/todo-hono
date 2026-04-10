---
description: "Draft a GitHub Issue for a bug report or feature request following the project's issue template."
agent: agent
tools: [read, search]
argument-hint: "作成したい Issue の内容（例: 'todo 削除時に画面が白くなるバグ' または 'カテゴリ絞り込み機能の追加'）"
---

ユーザーの説明をもとに、プロジェクトの Issue テンプレートに沿った Issue 本文を日本語で作成してください。

## 手順

1. ユーザーの説明がバグ報告か機能要望かを判断する
2. 対応するテンプレートを参照する:
   - バグ報告: [.github/ISSUE_TEMPLATE/bug_report.yml](.github/ISSUE_TEMPLATE/bug_report.yml)
   - 機能要望: [.github/ISSUE_TEMPLATE/feature_request.yml](.github/ISSUE_TEMPLATE/feature_request.yml)
3. テンプレートの各項目を埋めた Issue 本文を生成する
4. Issue タイトルを提案する（`fix: ` または `feat: ` プレフィックス付き）
5. 付与すべきラベルを提案する（`bug` / `enhancement` / 優先度ラベル）

## 出力形式

以下の形式で出力してください:

**タイトル（案）**: `<タイトル>`

**ラベル**: `<ラベル名>`

**本文**:
```
<Issue 本文>
```
