#!/bin/bash
# Packages the app and installs it on the TV.
# Usage: ./deploy.sh            (reads TV_IP from .env)
#        TV_IP=192.168.1.50 ./deploy.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
[ -f "$ROOT/.env" ] && source "$ROOT/.env"
: "${TV_IP:?Set TV_IP in .env or the environment (the IP address of your TV)}"

TV="$TV_IP:26101"
SDB="${TIZEN_STUDIO:-$HOME/tizen-studio}/tools/sdb"
TIZEN="${TIZEN_STUDIO:-$HOME/tizen-studio}/tools/ide/bin/tizen"
PROFILE="${TIZEN_PROFILE:-TVHome}"

# The Tizen packager writes into its source folder, so build from a temp copy.
BUILD="$(mktemp -d)"
trap 'rm -rf "$BUILD"' EXIT
cp -R "$ROOT/app/." "$BUILD/"

"$TIZEN" package -t wgt -s "$PROFILE" -- "$BUILD"

"$SDB" connect "$TV"
"$TIZEN" install -n "$BUILD/Portal.wgt" -s "$TV"
"$SDB" -s "$TV" shell 0 was_execute TVHomeApp1.Home
echo "Installed and launched."
