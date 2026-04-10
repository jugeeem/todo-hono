---
description: "Scaffold a new REST API endpoint with all required layers: route definition, request validation, handler, service, and repository. Follows the project layered architecture in service/api."
agent: agent
tools: [read, edit, search]
argument-hint: "エンドポイントの説明（例: 'POST /todos — 認証済みユーザーの新しい todo を作成する'）"
---

`service/api` に新しい API エンドポイントを雛形生成してください。

## 手順

1. `service/api/` を読み込んで既存のプロジェクト構造・フレームワーク・パターンを把握する
2. 提供された説明からリソースと HTTP メソッドを特定する
3. 以下の各レイヤーを作成・更新する（実際のフレームワーク構造に合わせて調整する）:

   | レイヤー | 責務 |
   |---|---|
   | Route | パスと HTTP メソッドを登録する |
   | Handler / Controller | リクエストのパース・バリデーション、サービス呼び出し、レスポンス整形 |
   | Service / Use Case | ビジネスロジック、Repository 呼び出しのオーケストレーション |
   | Repository / DAO | パラメータ化クエリによる DB 操作 |

4. ハンドラー境界で入力バリデーションを追加する
5. REST 規約に従った適切な HTTP ステータスコードを返す
6. サービスレイヤーのテストファイルを雛形生成する

## 出力

作成・変更したファイルを列挙し、各ファイルの役割を簡潔に説明してください。
フレームワークや DB スキーマについて仮定した事項があれば明記してください。
