#!/usr/bin/env bash
# Dynamically detects and executes CREATE DATABASE SQL files from all DB submodules.
#
# Convention: each DB submodule places CREATE DATABASE statements ONLY (no schemas/tables)
# under:  service/<submodule>/src/DDL/database/*.sql
#
# Schema and table creation is delegated to each application's migration framework.
#
# Adding a new DB submodule requires no changes here — just place the SQL files
# in the expected path and rebuild the Dev Container.

set -euo pipefail

echo "=== Initializing databases from service submodules ==="

found=0
for sql_file in /workspace/service/*/src/DDL/database/*.sql; do
    if [ -f "$sql_file" ]; then
        echo "  → Executing: $sql_file"
        psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -f "$sql_file"
        found=$((found + 1))
    fi
done

if [ "$found" -eq 0 ]; then
    echo "  (no SQL files found under /workspace/service/*/src/DDL/database/ — skipping)"
else
    echo "=== $found file(s) processed ==="
fi
