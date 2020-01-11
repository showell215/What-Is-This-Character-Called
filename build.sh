#!/usr/bin/env bash

# set -e

LINT_EXIT_CODE=0

eslint public/scripts/*.js
(( LINT_EXIT_CODE += $?))
htmlhint public/index.html
(( LINT_EXIT_CODE += $?))
stylelint public/css
(( LINT_EXIT_CODE += $?))

if [ $LINT_EXIT_CODE -ne 0 ]; then
    exit 1
fi


if [ -d dist ]; then
  rm -r dist
fi

mkdir dist
mkdir dist/public/
cp public/index.html dist/
if [ -d public/ucd ]; then
    cp -r public/ucd dist/
fi
cp -r public/scripts dist/public/
cp -r public/css dist/
cp -r public/img dist/
cp  public/*.png dist/
cp  public/*.svg dist/
cp  public/*.ico dist/
cp  public/*.xml dist/
cp  public/site.webmanifest dist/

# simple hash on the JS file for cache busting
[[ $TRAVIS_BUILD_NUMBER ]] && cache_hash=-$TRAVIS_BUILD_NUMBER
index_file=index$cache_hash.min.js
uglifyjs -cm toplevel --verbose --warn ./public/scripts/**/*.js ./public/scripts/*.js -o ./dist/$index_file --source-map url=index.min.js.map
if [ $? -ne 0 ]; then
    exit 1
fi
sed -i.bak 's/{{index_file}}/'"${index_file}"'/' dist/index.html && rm dist/index.html.bak
# cp public/scripts/polyfill/codepointat.js public/scripts/index.js dist/
