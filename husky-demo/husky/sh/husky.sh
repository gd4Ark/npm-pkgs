gitParams="$*"
hookName="$(basename "$0")"

npx husky-run $hookName "$gitParams" --no-install
