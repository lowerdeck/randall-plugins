#!/usr/bin/env bash
# Syncs this repo as a submodule of an app: commits local changes (if given a message), pulls, pushes, then installs
# and builds the given packages in order, and stages the new submodule commit in the app.
#
# Usage: scripts/sync.sh "<install command>" <package dir>...   (WIDGETS_MESSAGE="..." to commit local changes)
set -euo pipefail

install_command=$1
shift
packages=("$@")

widgets_dir=$(cd "$(dirname "$0")/.." && pwd)
app_dir=$(git -C "$widgets_dir" rev-parse --show-superproject-working-tree)
if [ -z "$app_dir" ]; then
  echo "✗ $widgets_dir is not a submodule of an app" >&2
  exit 1
fi

cd "$widgets_dir"

# Submodule updates leave a detached head, which can't be pushed from.
if ! git symbolic-ref -q HEAD >/dev/null; then
  git checkout -q main
fi

if [ -n "$(git status --porcelain)" ]; then
  if [ -z "${WIDGETS_MESSAGE:-}" ]; then
    echo "✗ There are uncommitted changes in vendor/widgets. Commit them, or pass a message: just widgets \"<message>\"" >&2
    git status --short >&2
    exit 1
  fi
  git add -A
  git commit -q -m "$WIDGETS_MESSAGE"
  echo "✓ Committed: $WIDGETS_MESSAGE"
fi

git pull -q --rebase origin main
echo "✓ Pulled"

if [ -n "$(git log origin/main..HEAD --oneline)" ]; then
  git push -q origin HEAD:main
  echo "✓ Pushed"
fi

cd "$app_dir"
$install_command

for package in "${packages[@]}"; do
  echo "→ Building $package"
  (cd "$widgets_dir/$package" && npm run --silent build)
done
echo "✓ Built"

submodule_path=${widgets_dir#"$app_dir"/}
if [ -n "$(git diff --name-only -- "$submodule_path")" ]; then
  git add -- "$submodule_path"
  echo "✓ Staged the new widgets commit in $(basename "$app_dir"); commit it along with your changes"
fi
