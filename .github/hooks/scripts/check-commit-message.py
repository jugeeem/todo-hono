#!/usr/bin/env python3
"""
Copilot PreToolUse フック: git commit 実行前にコミット規約のリマインダーを注入する。

受け取るJSON (stdin):
  { "tool_name": "...", "tool_input": { "command": "..." }, ... }

返すJSON (stdout):
  { "systemMessage": "..." }  ← エージェントのシステムコンテキストに追加される
"""

import json
import re
import sys


def main() -> None:
    try:
        data = json.load(sys.stdin)
    except (json.JSONDecodeError, EOFError):
        sys.exit(0)

    tool_name: str = data.get("tool_name", "")
    tool_input = data.get("tool_input", {})
    command: str = tool_input.get("command", "") if isinstance(tool_input, dict) else ""

    # run_in_terminal で git commit を実行しようとしている場合のみ介入
    if tool_name not in ("run_in_terminal",):
        sys.exit(0)

    if not re.search(r"\bgit\s+commit\b", command):
        sys.exit(0)

    reminder = {
        "systemMessage": (
            "【コミット規約リマインダー】\n"
            "コミットメッセージは Conventional Commits 形式に従うこと:\n\n"
            "  <type>(<scope>): <subject>\n\n"
            "type: feat | fix | docs | style | refactor | test | chore | ci | perf | revert\n"
            "scope: 変更対象のモジュール（任意）例: api, web, db\n"
            "subject: 命令形・日本語・72 文字以内・末尾ピリオドなし\n\n"
            "例: feat(api): todo 一覧取得エンドポイントを追加する\n"
            "    fix(web): ログイン後のリダイレクトを修正する"
        )
    }
    print(json.dumps(reminder, ensure_ascii=False))


if __name__ == "__main__":
    main()
