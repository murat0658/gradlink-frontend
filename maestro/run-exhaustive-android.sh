#!/usr/bin/env bash
set -euo pipefail
export PATH="$PATH:$HOME/.maestro/bin:$HOME/Library/Android/sdk/platform-tools"
export MAESTRO_CLI_ANALYSIS_NOTIFICATION_DISABLED=true
export MAESTRO_CLI_NO_ANALYTICS=1
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
EMAIL="${EMAIL:?set EMAIL}"
PASSWORD="${PASSWORD:?set PASSWORD}"
EXPO_URL="${EXPO_URL:-exp://$(ipconfig getifaddr en0):8082}"
DEV="${DEV:-emulator-5554}"
REPORT="${REPORT:-/tmp/maestro-exhaustive-report.txt}"
: > "$REPORT"
echo "EXPO_URL=$EXPO_URL DEV=$DEV" | tee -a "$REPORT"
adb shell am start -a android.intent.action.VIEW -d "$EXPO_URL/--/auth" host.exp.exponent >/dev/null || true
sleep 3
PASS=0; FAIL=0
for f in maestro/exhaustive/*.yaml; do
  echo "===== $f =====" | tee -a "$REPORT"
  set +e
  maestro --device "$DEV" test "$f" -e EMAIL="$EMAIL" -e PASSWORD="$PASSWORD" -e EXPO_URL="$EXPO_URL" >>"$REPORT" 2>&1
  code=$?
  set -e
  if [[ $code -eq 0 ]]; then echo "RESULT:PASS $f" | tee -a "$REPORT"; PASS=$((PASS+1)); else echo "RESULT:FAIL $f code=$code" | tee -a "$REPORT"; FAIL=$((FAIL+1)); fi
done
echo "SUMMARY pass=$PASS fail=$FAIL" | tee -a "$REPORT"
