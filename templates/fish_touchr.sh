#!/bin/bash

# desc: 任意层级目录创建文件，如果是 html 文件，则自动添加 HTML 模板（如果发现你复制了 HTML 则自动写入）并且自动打开编辑器和浏览器
# usage: fish_touchr /path/to/file

# desc.en: Create file in nested directories. For HTML files auto-inject HTML template or write directly if HTML content detected in clipboard then auto-open in  editor and browser
# usage.en: fish_touchr /path/to/file

# @private
# __fish_is_zh() {
#   [[ "${LANG:-}" =~ ^zh ]]
# }

# @public
# Create a new file in nested directory!
# touchr /path/to/file.ts -> mkdir -p /path/to && touch /path/to/file.ts and more features:
# PLUS 1. then open it in vscode
# PLUS 2. and if file name is `.html` then open it in browser.
# PLUS 3. and if is `.html` and clipboard content is HTML like snippets then paste it into the file otherwise write HTML5 template into the file.
# ALL the above is automated by this function.
fish_touchr() {
    mkdir -p "$(dirname "$1")" && touch "$1" && code "$1"

    # 如果文件名 `.html` 结尾则使用浏览器打开。
    # Open in browser if file name ends with `.html`
    if [[ "$1" == *.html ]]; then
      local basename=$(basename "$1", '.html')

      # powershell.exe -Command "Get-Clipboard"
      local clipboard=$(__fish_get_clipboard)

      if [[ $clipboard == '<!DOCTYPE html>'* ]]; then
        echo 'created from clipboard 📋'
        echo $clipboard > "$1"
      else
        echo 'use default template 🧩'

        echo '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>'$basename' Quick Start</title>
</head>
<body>
  <h1>'$basename' Quick Start</h1>
</body>
</html>' > "$1"
      fi

      start "$1" 2>/dev/null || open "$1"
    fi
}

__fish_get_clipboard() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS 使用 pbpaste
        pbpaste
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
        # Windows Git Bash (MSYS2) 或 Cygwin
        # 方法1: 使用 powershell.exe
        # powershell.exe -Command "Get-Clipboard"
        cat /dev/clipboard 2>/dev/null || powershell.exe -Command "Get-Clipboard"
        # 方法2: 如果安装了 clip 命令（某些Windows版本自带）
        # clip 是复制到剪贴板，不能读取，所以只能用 PowerShell
    else
        # Linux 等其他系统
        # 需要安装 xclip 或 xsel
        if command -v xclip &> /dev/null; then
            xclip -selection clipboard -o
        elif command -v xsel &> /dev/null; then
            xsel --clipboard --output
        else
            echo "Error: No clipboard command found" >&2
            return 1
        fi
    fi
}

# 使用方式
# clipboard_content=$(__fish_get_clipboard)
# echo "剪贴板内容: $clipboard_content"
