#!/bin/bash

# desc: 快速打开 npm 包页
# usage: fish_open_npm [--site=npmx] [包名]

# desc.en: Quickly open a package's npm page
# usage.en: fish_open_npm [--site=npmx] [pkg_name]

__fish_is_zh() {
  [[ "${LANG:-}" =~ ^zh ]]
}

__fish_open_url() {
  local url="$1"

  OS=$(uname -s)

  # open URL across different platforms
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
fish_open_npm() {
  local pkg=""
  local site="npmjs"

  for arg in "$@"; do
    case "$arg" in
      --site=*)
        site="${arg#*=}"
        ;;
      *)
        pkg="$arg"
        ;;
    esac
  done

  if [[ -z "$pkg" ]]; then
    if [[ -f "package.json" ]]; then
      pkg=$(node -p "require('./package.json').name")
    else
      read "pkg?$(__fish_is_zh && echo "请输入包名: " || echo "Enter package name: ")"
    fi
  fi

  local url
  case "$site" in
    npmjs) url="https://www.npmjs.com/package/$pkg" ;;
    npmx)  url="https://npmx.dev/package/$pkg" ;;
    *)
      if __fish_is_zh; then
        echo "❌ 不支持的站点: $site (支持: npmjs, npmx)"
      else
        echo "❌ Unsupported site: $site (supported: npmjs, npmx)"
      fi
      return 1
      ;;
  esac

  __fish_open_url "$url"
}
