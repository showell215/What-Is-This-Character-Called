#!/usr/bin/env bash

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
cp public/index.html dist/
cp -r public/ucd dist/
cp -r public/css dist/
cp -r public/img dist/
cp  public/*.png dist/
cp  public/*.svg dist/
cp  public/*.ico dist/
cp  public/*.xml dist/
cp  public/site.webmanifest dist/
uglifyjs -m -c toplevel=false,unused=false --verbose --warn ./public/scripts/**/*.js ./public/scripts/*.js -o ./dist/index.min.js
# uglifyjs -m -c toplevel=false,unused=false --verbose --warn ./vendor/js/*.js -o ./dist/polyfill.min.js
