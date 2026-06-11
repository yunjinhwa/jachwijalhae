# Maestro QA Flows

Expo Go로 실행 중인 개발 서버 주소를 `EXPO_URL`로 넘겨 실행합니다.

```powershell
maestro test -e EXPO_URL=exp://10.194.10.59:8081 .maestro/expo-go-smoke.yml
maestro test -e EXPO_URL=exp://10.194.10.59:8081 .maestro/01_search_item_detail.yml
maestro test -e EXPO_URL=exp://10.194.10.59:8081 .maestro/02_shopping_list.yml
maestro test -e EXPO_URL=exp://10.194.10.59:8081 .maestro/03_budget_period.yml
maestro test -e EXPO_URL=exp://10.194.10.59:8081 .maestro/04_compare_stores.yml
maestro test -e EXPO_URL=exp://10.194.10.59:8081 .maestro/05_alerts.yml
maestro test -e EXPO_URL=exp://10.194.10.59:8081 .maestro/06_mypage_settings.yml
```

PowerShell에서 `maestro` 명령이 인식되지 않으면 아래처럼 전체 경로로 실행합니다.

```powershell
& "C:\maestro\bin\maestro.bat" test -e EXPO_URL=exp://10.194.10.59:8081 .maestro/expo-go-smoke.yml
```

전체 실행:

```powershell
maestro test -e EXPO_URL=exp://10.194.10.59:8081 .maestro
```

`.maestro/config.yaml`에서 전체 실행 순서를 고정해 두었습니다.

`EXPO_URL`은 `npx.cmd expo start --clear --lan` 실행 후 터미널에 표시되는 `exp://...` 주소로 바꿉니다.
