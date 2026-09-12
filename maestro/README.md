# Maestro UI flows (Expo Go) — **Android only**

iOS Simulator + Expo Go is too slow/flaky for UI automation (secure fields, Keychain sheets, deep links). Use **Android emulator** for Maestro; keep iOS for occasional manual checks.

## Prerequisites
- Maestro (`~/.maestro/bin` on PATH)
- Metro (e.g. `:8082`)
- Android emulator with Expo Go

```bash
export PATH="$PATH:$HOME/.maestro/bin:$HOME/Library/Android/sdk/platform-tools"
export EXPO_URL="exp://$(ipconfig getifaddr en0):8082"
EMAIL='you@example.com'
PASSWORD='YourPass123'

adb shell am start -a android.intent.action.VIEW -d "$EXPO_URL/--/auth" host.exp.exponent

for f in maestro/0*.yaml; do
  echo "===== $f ====="
  maestro test "$f" -e EMAIL="$EMAIL" -e PASSWORD="$PASSWORD" -e EXPO_URL="$EXPO_URL" || exit 1
done
```

Unit tests (fast):

```bash
npm test -- --watchAll=false --ci
```

## Flows

| File | Coverage |
|---|---|
| `01_auth_validation.yaml` | Empty login, bad credentials, signup nav |
| `02_signup_keyboard.yaml` | Signup CTA with keyboard |
| `03_authenticated_tabs.yaml` | Timeline, Groups, Jobs, Profile |
| `04_groups_detail.yaml` | Open group, Join/Subscribe, Leave cancel |
| `05_profile_actions.yaml` | Test Alert, Edit Profile |
| `06_notifications.yaml` | Notifications screen |
| `07_logout.yaml` | Log out / auth screen |
| `shared/login.yaml` | Shared login helper |

## Rich journeys (multi-screen UX)

```bash
for f in maestro/journeys/*.yaml; do
  echo "===== $f ====="
  maestro test "$f" -e EMAIL="$EMAIL" -e PASSWORD="$PASSWORD" -e EXPO_URL="$EXPO_URL" || exit 1
done
```

| File | Coverage |
|---|---|
| `journeys/01_auth_signup_roundtrip.yaml` | Empty submit → signup/country picker → wrong password → login |
| `journeys/02_group_explore_enroll.yaml` | Group tabs, leave-cancel, events past toggle, bad event deep link |
| `journeys/03_timeline_notify_subscribe.yaml` | Timeline → notifications Clear All cancel → plans → profile edit cancel → tabs |
