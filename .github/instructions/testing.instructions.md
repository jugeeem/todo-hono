---
description: "Use when writing, reviewing, or generating test cases. Covers unit tests, integration tests, test database usage, and test data management."
applyTo: ["**/*.test.*", "**/*.spec.*", "**/test/**", "**/tests/**"]
---

# Testing Guidelines

## テスト戦略

- **ユニットテスト**: 単一の関数/メソッドを外部依存をモックして独立してテストする
- **インテグレーションテスト**: サービス境界・DB 操作を `todo_db_test` を使ってテストする
- **E2E テスト**: 重要なユーザーフローのみに限定する

## テスト用データベース

- インテグレーションテストでは必ず `todo_db_test` を使用し、`todo_db` は使わない
- テスト間で状態をリセットし、実行順序に依存しないようにする
- 可能な限りトランザクションとロールバックでテストを分離する

## テスト記述規約

- テスト名は `should <期待する振る舞い> when <条件>` の形式で記述する
- `describe` / `context` ブロックで関連テストをグループ化する
- Arrange-Act-Assert (AAA) に従って各テストケースを構造化する
- エッジケースを必ずカバーする: null/空文字、境界値、エラーパス

## カバレッジ目標

- 重要なビジネスロジック: 行カバレッジ 80% 以上
- DB クエリ: ハッピーパス + 制約違反をカバーする
- 認証/認可: 境界条件を明示的にテストする
