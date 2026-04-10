---
description: "Generate a pull request description following the project's PR template, based on the current branch changes."
agent: agent
tools: [read, search, execute]
argument-hint: "任意: PR の変更内容の要約（省略するとブランチの差分から自動生成）"
---

現在のブランチの変更内容をもとに、プロジェクトの PR テンプレートに沿った PR 説明文を日本語で作成してください。

## 手順

1. PR テンプレートを確認する: [.github/PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md)
2. 現在のブランチ名から type・Issue 番号・変更概要を読み取る（例: `feature/42-add-todo-filter`）
3. 変更されたファイル一覧を確認して変更内容を把握する
4. テンプレートの各項目を埋める:
   - **概要**: 1〜3 文で変更内容を要約する
   - **関連 Issue**: ブランチ名または diff から Issue 番号を特定する（`Closes #番号`）
   - **変更内容**: 主な変更点を箇条書きで列挙する
   - **動作確認**: 実施済みの確認事項を反映する
5. PR タイトルを提案する（Conventional Commits 形式: `<type>(<scope>): <subject>`）

## 出力形式

以下の形式で出力してください:

**PR タイトル（案）**: `<タイトル>`

**PR 本文**:
```
<PR 本文（テンプレートに沿って記入済み）>
```
