# desc: 快速初始化 Node.js pnpm 项目
# usage: pocket_pnpm_init_node_js_pkg [文件夹名]


# 定义颜色
GREEN='\033[0;32m'
BOLD_GREEN='\033[1;32m'
NC='\033[0m'

# 输出绿色文字
__pocket_echo_green() {
  echo -e "${GREEN}$1${NC}"
}

dirname=''

# @public
pocket_pnpm_init_node_js_pkg() {
  __pocket_md_and_cd "$@" && __pocket_pnpm_init_in_folder
}

# 功能：创建文件夹并进入
# 用法：mcd [文件夹名]
__pocket_md_and_cd() {
  dirname="$1"

  # If no argument provided, prompt for input
  if [ -z "$dirname" ]; then
    # read -p "请输入文件夹名: " dirname
    echo -n "Enter folder name (will also be used as \`name\` in package.json):"
    read dirname
    # 检查是否输入了内容
    if [ -z "$dirname" ]; then
      echo "❌ Error: Folder name cannot be empty"
      return 1
    fi
  fi

  # 检查文件夹是否已存在
  if [ -d "$dirname" ]; then
    echo "❌ Error: Folder '$dirname' already exists"
    return 1
  fi

  # 检查是否包含特殊字符（可选）
  if [[ "$dirname" =~ [/:*?\"\<\>\|] ]]; then
    echo "❌ Error: Folder name contains invalid characters"
    return 1
  fi

  # 创建文件夹并进入
  if mkdir -p "$dirname" && cd "$dirname"; then
    echo "\n✅ Successfully created and entered folder: ${GREEN}$(pwd)${NC}"
    return 0
  else
    echo "❌ Failed to create folder"
    return 1
  fi
}

__pocket_pnpm_init_in_folder() {
  start_time=$(date +%s)

  echo_green "\n🔄 Initializing pnpm project in $(pwd)"

  echo_green "\n1. pnpm init with type="module"" && \
  echo "# $dirname" > README.md && \
  pnpm init && \
  pnpm pkg set type=module && \
  echo_green "\n2. git init" && \
  git init && \
  echo_green "\n3. tsgo --init" && \
  tsgo --init && \
  echo_green "\n4. pnpm install -D @types/node" && \
  pnpm install -D @types/node && \
  echo_green "\n5. biome init" && \
  biome init && \
  echo_green '6. Add "node_modules/" to .gitignore\n' && \
  echo node_modules/ > .gitignore && \

  # modify package.json to include "scripts":
  # "typecheck": "tsgo --noEmit",
  # "test": "node --test",
  # "pub:patch": "npm version patch",
  # "pub:minor": "npm version minor",
  # "pub:major": "npm version major",
  # "preversion": "npm test && npm run typecheck",
  # "postversion": "npm publish && git push && git push --tags"

  # 最佳实践 一键发布 `npm run pub:patch` / `npm run pub:minor` / `npm run pub:major`
  echo_green '7. Modify package.json scripts to add "tsgo --noEmit" and "npm run pub:patch|minor|major" ...\n' && \
  npm pkg set scripts.typecheck="tsgo --noEmit" \
    scripts.test="node --test" \
    scripts.pub:patch="npm version patch" \
    scripts.pub:minor="npm version minor" \
    scripts.pub:major="npm version major" \
    scripts.preversion="npm test && npm run typecheck" \
    scripts.postversion="npm publish && git push && git push --tags" && \

  echo_green '8. Modify tsconfig.json and biome.json' && \
  node ~/.pocket/alias-list/pnpm_init_node_js_pkg/modify.mjs "$PWD" && \
  echo_green '\n9. Done!'

  end_time=$(date +%s)
  elapsed=$((end_time - start_time))
  echo "\nTime taken: ${GREEN}${elapsed}${NC} seconds"
}
