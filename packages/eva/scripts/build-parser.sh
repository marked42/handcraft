#!/usr/bin/env bash

npx syntax-cli --grammar src/parser/eva-grammar.bnf --mode LALR1 --output .parser-temp.ts

echo '// @ts-nocheck' | cat - .parser-temp.ts > ./src/parser/index.ts

rm .parser-temp.ts
