#!/usr/bin/env bash

LINT_EXIT_CODE=0

eslint src/scripts/*.js --fix
(( LINT_EXIT_CODE += $?))
htmlhint src/index.html
(( LINT_EXIT_CODE += $?))
stylelint src/css
(( LINT_EXIT_CODE += $?))

if [ $LINT_EXIT_CODE -ne 0 ]; then
    exit 1
fi


if [ -d dist ]; then
  rm -r dist
fi

mkdir dist
mkdir dist/public/
cp src/index.html dist/
if [ -d src/ucd ]; then
    cp -r src/ucd dist/
    cp -r src/emoji dist/
fi
cp -r src/scripts dist/public/
cp -r src/css dist/
cp -r src/img dist/
cp  src/*.png dist/
cp  src/*.svg dist/
cp  src/*.ico dist/
cp  src/*.xml dist/
cp  src/site.webmanifest dist/

# simple hash on the JS file for cache busting
[[ $BUILD_ID ]] && cache_hash=_$BUILD_ID
index_file=index$cache_hash.min.js
uglifyjs -cm toplevel --verbose --warn ./src/scripts/**/*.js ./src/scripts/*.js -o ./dist/$index_file --source-map url="$index_file.map"
if [ $? -ne 0 ]; then
    exit 1
fi
sed -i.bak 's/{{index_file}}/'"${index_file}"'/' dist/index.html && rm dist/index.html.bak
# cp public/scripts/polyfill/codepointat.js public/scripts/index.js dist/
