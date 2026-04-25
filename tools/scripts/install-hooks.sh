#!/bin/sh
#
# Install the project's git hooks into .git/hooks. Idempotent — safe to
# rerun. Run once after cloning the repo.
#
# Why a copy instead of `git config core.hooksPath`? So existing project
# hooks (if any) keep working alongside this one without surprising
# anyone's local config.
#

set -e

ROOT=$(git rev-parse --show-toplevel)
SOURCE="$ROOT/tools/git-hooks"
TARGET="$ROOT/.git/hooks"

if [ ! -d "$SOURCE" ]; then
  echo "✗ source directory $SOURCE does not exist" >&2
  exit 1
fi

if [ ! -d "$TARGET" ]; then
  echo "✗ target directory $TARGET does not exist (not a git checkout?)" >&2
  exit 1
fi

installed=0
for hook in "$SOURCE"/*; do
  [ -f "$hook" ] || continue
  name=$(basename "$hook")
  cp "$hook" "$TARGET/$name"
  chmod +x "$TARGET/$name"
  echo "✓ installed $name"
  installed=$((installed + 1))
done

if [ "$installed" -eq 0 ]; then
  echo "  no hooks to install"
fi
