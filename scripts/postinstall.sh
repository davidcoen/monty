#!/usr/bin/env sh
# Postinstall helper: generate Prisma client if prisma is installed
echo "Running postinstall tasks..."
if command -v pnpm >/dev/null 2>&1; then
  if [ -d "packages/db" ]; then
    echo "Running prisma generate for packages/db"
    (cd packages/db && pnpm prisma generate) || true
  fi
fi
