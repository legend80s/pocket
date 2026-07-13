#!/bin/bash

# desc.en: Open the current project's repository URL in browser — whether it's GitHub, GitLab or privately deployed code platform.
# usage.en: fish_open_repo

# desc: 打开当前项目的远程仓库 URL，无论它是 GitHub、GitLab 还是私有部署的代码平台
# usage: fish_open_repo

__fish_is_zh() {
  [[ "${LANG:-}" =~ ^zh ]]
}

__fish_open_url() {
  local url="$1"

  OS=$(uname -s)

  # 跨平台打开 URL
  case "$OS" in
    Darwin*)              echo -n "\e[32mopening\e[0m" "$url" && open "$url" && echo ' \e[32mopened\e[0m' ;;
    Linux*)               echo -n "\e[32mxdg-open\e[0m" "$url" &&  xdg-open "$url" && echo ' \e[32mopened\e[0m' ;;
    CYGWIN* | MINGW* | MSYS*) echo -n "\e[32mstart\e[0m" "$url" && start "$url" && echo ' \e[32mopened\e[0m' ;;
    *)
      if __fish_is_zh; then
        echo "\e[33m⚠️  不支持的操作系统 ($OS)，请手动打开:\e[0m $url"
      else
        echo "\e[33m⚠️  Unsupported OS ($OS), please open manually:\e[0m $url"
      fi
      ;;
  esac
}

# @public
fish_open_repo() {
  # Open current repository url in browser. 支持一下几种格式：
  # - https://git.foo.com/foo2/bar/baz.git
  # - git@github.com:legend80s/stoc.git
  # and open it in browser using `start` in Windows
  local repo_url=$(git remote get-url origin | awk '{ gsub(/:/, "/"); printf $1 }' | awk '{ gsub(/^git@/, "https://"); printf $1 }' | awk '{ gsub(/^https\/\/\//, "https://"); printf $1 }' | awk '{ gsub(/.git$/, ""); printf $1 }')

  # echo "🔗 repo_url is $repo_url"

  __fish_open_url "$repo_url"
}
