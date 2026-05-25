#!/bin/bash

SCRIPT_DIR="$(dirname "$0")"
echo "Serving @ http://localhost:8731 @ '$SCRIPT_DIR'"
python3 -m http.server 8731 --directory "$SCRIPT_DIR"
