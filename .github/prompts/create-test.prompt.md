---
description: "Generate unit or integration test cases for a given function, class, module, or API endpoint. Follows project testing conventions."
agent: agent
tools: [read, edit, search]
argument-hint: "テスト対象の関数・クラス・ファイルを指定（例: 'TodoService.createTodo' または 'src/services/todo.service.ts'）"
---

指定されたコードに対して包括的なテストケースを生成してください。

## 手順

1. 対象コードを読み込んで入力・出力・副作用を把握する
2. 同ディレクトリの既存テストファイルを確認してテストフレームワークとスタイルを合わせる
3. 以下のシナリオを洗い出す:
   - ハッピーパス（有効な入力 → 期待する出力）
   - バリデーションエラー（無効/必須フィールド欠損）
   - 境界条件（空リスト、最大長文字列、null 値）
   - エラーパス（DB 障害、Not Found、Unauthorized）
4. Arrange-Act-Assert パターンでテストを記述する
5. インテグレーションテストの場合: `todo_db_test` を使用し `todo_db` は使わない

## 出力

ソースファイルと同じ階層（または最寄りの `test/` ディレクトリ）にテストファイルを作成または更新してください。
カバーしたシナリオの一覧と手動セットアップが必要な事項をまとめてください。
