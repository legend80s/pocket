#!/bin/bash

# desc: 任意层级目录创建文件，如果是 html 文件，则自动添加 HTML 模板（如果发现你复制了 HTML 则自动写入）并且自动打开编辑器和浏览器
# usage: fish_touchr /path/to/file.html

# desc.en: Create file at any directory level. For HTML files: automatically inject HTML template or write directly if HTML content detected in clipboard then auto-open in both editor and browser
# usage.en: fish_touchr /path/to/file.html

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
touchr() {
    mkdir -p "$(dirname "$1")" && touch "$1" && code "$1"

    # 如果文件名 `.html` 结尾则使用浏览器打开。
    if [[ "$1" == *.html ]]; then
      local basename=$(basename "$1", '.html')

      # powershell.exe -Command "Get-Clipboard"
      local clipboard=$(cat /dev/clipboard)

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

      start "$1" || open "$1"
    fi
}
