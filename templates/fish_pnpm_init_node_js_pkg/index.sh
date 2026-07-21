# desc: 快速初始化 Node.js pnpm 项目
# usage: fish_pnpm_init_node_js_pkg [文件夹名]

# desc.en: Quickly initialize a Node.js pnpm project
# usage.en: fish_pnpm_init_node_js_pkg [folder_name]

GREEN='\033[0;32m'
BOLD_GREEN='\033[1;32m'
NC='\033[0m'

__fish_echo_green() {
  echo -e "${GREEN}$1${NC}"
}

dirname=''

# @public
fish_pnpm_init_node_js_pkg() {
  __fish_md_and_cd "$@" && __fish_pnpm_init_in_folder
}

# mkdir and cd into the folder
# Usage：mcd [folder_name]
__fish_md_and_cd() {
  dirname="$1"

  # If no argument provided, prompt for input
  if [ -z "$dirname" ]; then
    echo ''

    echo -n "Enter folder name (will also be used as \`name\` in package.json):"
    read dirname

    if [ -z "$dirname" ]; then
      echo "❌ Error: Folder name cannot be empty"
      return 1
    fi
  fi

  # Check if the folder already exists
  if [ -d "$dirname" ]; then
    echo "❌ Error: Folder '$dirname' already exists"
    return 1
  fi

  # Check if the folder name contains invalid characters
  if [[ "$dirname" =~ [/:*?\"\<\>\|] ]]; then
    echo "❌ Error: Folder name contains invalid characters"
    return 1
  fi

  # Create the folder and enter it
  if mkdir -p "$dirname" && cd "$dirname"; then
    echo "\n✅ Successfully created and entered folder: ${GREEN}$(pwd)${NC}"
    return 0
  else
    echo "❌ Failed to create folder"
    return 1
  fi
}

__fish_pnpm_init_in_folder() {
  start_time=$(date +%s)

  __fish_echo_green "\n🔄 Initializing pnpm project in $(pwd)"

  __fish_echo_green "\n1. pnpm init with type="module"" && \
  echo "# $dirname" > README.md && \
  pnpm init && \
  pnpm pkg set type=module && \
  __fish_echo_green "\n2. git init" && \
  git init && \
  __fish_echo_green "\n3. tsgo --init" && \
  tsgo --init && \
  __fish_echo_green "\n4. pnpm install -D @types/node" && \
  pnpm install -D @types/node && \
  __fish_echo_green "\n5. biome init" && \
  biome init && \
  __fish_echo_green '6. Add "node_modules/" to .gitignore\n' && \
  echo node_modules/ > .gitignore && \

  # modify package.json to include "scripts":
  # "typecheck": "tsgo --noEmit",
  # "test": "node --test",
  # "pub:patch": "npm version patch",
  # "pub:minor": "npm version minor",
  # "pub:major": "npm version major",
  # "preversion": "npm test && npm run typecheck",
  # "postversion": "npm publish && git push && git push --tags"

  # Inject my beloved quick publish shortcuts: `npm run pub:patch` | `pub:minor` | `pub:major`
  __fish_echo_green '7. Modify package.json scripts to add "tsgo --noEmit" and "npm run pub:patch|minor|major" ...\n' && \
  npm pkg set scripts.typecheck="tsgo --noEmit" \
    scripts.test="node --test" \
    scripts.pub:patch="npm version patch" \
    scripts.pub:minor="npm version minor" \
    scripts.pub:major="npm version major" \
    scripts.preversion="npm test && npm run typecheck" \
    scripts.postversion="npm publish && git push && git push --tags" && \

  __fish_echo_green '8. Modify tsconfig.json and biome.json' && \
  node ~/.pelican/alias-list/fish_pnpm_init_node_js_pkg/modify.mjs "$PWD" && \
  __fish_echo_green '\n9. Done!'

  end_time=$(date +%s)
  elapsed=$((end_time - start_time))
  echo "\nTime taken: ${GREEN}${elapsed}${NC} seconds"
}
