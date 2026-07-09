# desc: 快速打开 npm 包页
opennpm() {
  local pkg="$1"
  if [[ -z "$pkg" ]]; then
    if [[ -f "package.json" ]]; then
      pkg=$(node -p "require('./package.json').name")
    else
      read "pkg?请输入包名: "
    fi
  fi

  local url="https://www.npmjs.com/package/$pkg"

  # 跨平台打开 URL
  case "$(uname -s)" in
    Darwin*)  open "$url" ;;
    Linux*)   xdg-open "$url" ;;
    CYGWIN*|MINGW*|MSYS*)  start "$url" ;;
    *)        echo "⚠️  不支持的操作系统，请手动打开: $url" ;;
  esac
}