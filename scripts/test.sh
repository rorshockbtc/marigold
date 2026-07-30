#!/bin/bash
# Wrapper to run vitest with correct architecture on Apple Silicon
# Workaround for rolldown/vitest native binding issues in mixed-arch terminals
exec arch -arm64 /usr/local/bin/node ./node_modules/.bin/vitest "$@"
