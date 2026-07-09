# desc: 快速打开 npm 包页
pocket_open_npm() {
  local pkg="$1"
  if [[ -z "$pkg" ]]; then
    if [[ -f "package.json" ]]; then
      pkg=$(node -p "require('./package.json').name")
    else
      read "pkg?请输入包名: "
    fi
  fi

  local url="https://www.npmjs.com/package/$pkg"

  OS=$(uname -s)

  # 跨平台打开 URL
  case "$OS" in
    Darwin*)              echo -n "\e[32mopening\e[0m" "$url" && open "$url" && echo ' \e[32mopened\e[0m' ;;
    Linux*)               echo -n "\e[32mxdg-open\e[0m" "$url" &&  xdg-open "$url" && echo ' \e[32mopened\e[0m' ;;
    CYGWIN* | MINGW* | MSYS*) echo -n "\e[32mstart\e[0m" "$url" && start "$url" && echo ' \e[32mopened\e[0m' ;;
    *)                    echo "\e[33m⚠️  不支持的操作系统 ($OS)，请手动打开:\e[0m $url" ;;
  esac
}