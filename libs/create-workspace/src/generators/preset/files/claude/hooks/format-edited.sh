#!/usr/bin/env bash
# PostToolUse hook (matcher: Edit|Write) — formats whatever file the tool
# call just touched.
#
# Why not jq: this workspace declares no jq dependency and it isn't
# guaranteed to be on an attendee's machine. Node is (package.json's own
# "engines" requires >=22), so the JSON-on-stdin event is parsed with
# `node -e` instead.
#
# Why not npx: resolving prettier/stylelint through npx pays their full
# resolution cost on *every* edit — a hook that slow is a hook people turn
# off. Both are devDependencies this preset installs, so the locally
# installed binary under node_modules/.bin is invoked directly.
#
# This is a formatter, not a gate: it must always exit 0, and must do
# nothing at all when the path is missing, outside the workspace, or of a
# type neither tool handles. Blocking an edit because Prettier disliked a
# file is the wrong failure mode — check:format and check:stylelint are the
# real gates (see /verify).
set -u

project_dir="${CLAUDE_PROJECT_DIR:-$PWD}"
cd "$project_dir" || exit 0

# The event arrives as JSON on stdin; the edited path is at
# `.tool_input.file_path`. Malformed/empty stdin, or a payload with no
# string there, prints nothing — handled as "no path" below, same as a
# missing key.
file_path="$(node -e '
let data = "";
process.stdin.on("data", (chunk) => { data += chunk; });
process.stdin.on("end", () => {
  try {
    const event = JSON.parse(data);
    const path = event && event.tool_input && event.tool_input.file_path;
    if (typeof path === "string") process.stdout.write(path);
  } catch {
    // Leave stdout empty — treated as "no path" below.
  }
});
' 2>/dev/null)"

[ -z "$file_path" ] && exit 0

# Edit/Write always report an absolute path. Anything not rooted at this
# workspace (a stray edit against some other tree opened in the same
# session) is out of scope for this hook.
case "$file_path" in
  "$project_dir"/*) ;;
  *) exit 0 ;;
esac

[ -f "$file_path" ] || exit 0

# Only extensions Prettier actually formats in this workspace — anything
# else (an image, a lockfile, a binary asset) is a type neither tool
# handles, and the hook does nothing rather than shell out for no reason.
case "$file_path" in
  *.ts | *.tsx | *.js | *.jsx | *.mjs | *.cjs | *.vue | *.json | *.css | *.md | *.html | *.yml | *.yaml) ;;
  *) exit 0 ;;
esac

prettier_bin="./node_modules/.bin/prettier"
if [ -x "$prettier_bin" ]; then
  "$prettier_bin" --write "$file_path" >/dev/null 2>&1
fi

case "$file_path" in
  *.css)
    stylelint_bin="./node_modules/.bin/stylelint"
    if [ -x "$stylelint_bin" ]; then
      "$stylelint_bin" --fix "$file_path" >/dev/null 2>&1
    fi
    ;;
esac

exit 0
