#!/bin/bash

# desc: 快速查看项目 package.json，未指定 name 则项目本身，否则 node_modules/，其次若指定 key 则仅查看对应 value
# usage: fish_view_pkg_json [pkg_name] [key]

# desc.en: Quickly peek into package.json — uses the current project by default, or looks in node_modules/ if you specify a name. You can also pass a key to see just that value.
# usage.en: fish_view_pkg_json [pkg_name] [key]

# @private
__fish_is_zh() {
  [[ "${LANG:-}" =~ ^zh ]]
}

# @public
fish_view_pkg_json() {
  if [ ! -z "$1" ]; then
    local name=$1
    local packageJsonPath="./node_modules/$name/package.json"
  else
    local packageJsonPath="./package.json"
  fi

  if [ ! -z "$2" ]; then
    echo $packageJsonPath
    local key=$2
    jq ".$key" $packageJsonPath

    return
  fi

  less $packageJsonPath && head -n 6 $packageJsonPath
}
