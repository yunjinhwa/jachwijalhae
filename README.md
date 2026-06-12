자취잘해
> 자취생을 위한 생활물가 비교·구매 판단 모바일 앱
`자취잘해`는 공공데이터 기반 생활물가 정보를 한곳에 모아, 품목별 가격 추이와 판매처별 가격을 비교하고 사용자가 지금 구매할지, 기다릴지, 대체 품목을 살지 판단할 수 있도록 돕는 모바일 앱입니다.
목차
프로젝트 소개
주요 기능
기술 스택
프로젝트 구조
실행 방법
API 및 공공데이터
구매 판단 로직
개발 상태
테스트 체크리스트
문제 해결
라이선스
프로젝트 소개
자취생은 장보기 예산이 제한적이고, 같은 품목이라도 지역·판매처·시점에 따라 가격 차이가 큽니다.  
`자취잘해`는 다음 흐름을 중심으로 생활비 절약을 지원합니다.
거주 지역, 예산, 관심 카테고리 설정
생활물가 요약 및 추천 구매 품목 확인
품목 검색, 가격 추이, 판매처별 가격 비교
`BUY / WAIT / REPLACE` 구매 판단 확인
장보기 목록, 예산, 가격 알림 관리
주요 기능
홈
이번 주 물가 요약
사기 좋은 품목과 기다릴 품목 추천
최근 본 품목 진입
검색, 추천, 알림 배지 진입
품목 검색 및 상세
품목명 검색
카테고리별 품목 조회
최근 검색어와 인기 검색어
품목 상세 가격 정보
7일 / 30일 / 90일 가격 추이
판매처별 가격 비교
지역별 가격 비교
구매 판단
`BUY`: 지금 사기 좋음
`WAIT`: 기다리기
`REPLACE`: 대체 품목 추천
`NEUTRAL`: 평균 수준
판단 근거는 현재가, 최근 30일 평균가, 7일 변동률, 대체 품목 절감률 등을 기준으로 표시합니다.
장보기
장보기 품목 추가, 수정, 삭제
예상 합계 계산
예산 요약
구매 완료 처리
구매 이력 저장
가격 알림
목표가 기반 가격 알림 생성
알림 ON/OFF
알림 이력 확인
목표가 도달 여부 확인
마이페이지
지역 설정
예산 설정
알림 설정
데이터 출처 확인
앱 정보 및 로그아웃
기술 스택
Mobile
구분	기술
Framework	Expo
Runtime	React Native
Language	TypeScript
UI	React Native StyleSheet
Navigation	React Navigation Native Stack, Bottom Tabs
State Management	Zustand
API Client	Fetch API, Axios dependency 포함
Platform	Android, iOS, Web
Planned Backend
현재 저장소는 모바일 앱 중심 구조입니다. API 서버는 `/v1` REST API를 기준으로 연동하도록 설계되어 있습니다.
구분	후보
API Server	Node.js NestJS 또는 Spring Boot
Database	PostgreSQL
Cache	Redis
Batch	공공데이터 가격 수집 Cron Job
프로젝트 구조
```text
jachwijalhae/
├── README.md
└── apps/
    └── mobile/
        ├── App.tsx
        ├── app.json
        ├── index.ts
        ├── package.json
        ├── assets/
        └── src/
            ├── components/    # 공통 UI 컴포넌트
            ├── data/          # 화면 스펙, seed 데이터
            ├── hooks/         # API 리소스 훅
            ├── navigation/    # 앱 내비게이션
            ├── screens/       # 화면 컴포넌트
            ├── services/      # API 클라이언트
            ├── store/         # Zustand 상태 관리
            ├── theme/         # 색상, 간격, 타이포그래피
            ├── types/         # 도메인/라우팅 타입
            └── utils/         # 포맷, 내비게이션 유틸
```
실행 방법
1. 저장소 클론
```bash
git clone https://github.com/yunjinhwa/jachwijalhae.git
cd jachwijalhae
```
2. 모바일 앱 의존성 설치
```bash
cd apps/mobile
npm install
```
3. Expo 실행
```bash
npm start
```
또는 플랫폼별로 실행합니다.
```bash
npm run android
npm run ios
npm run web
```
Expo 실행 후 표시되는 QR 코드를 Expo Go 앱으로 스캔하면 모바일 기기에서 확인할 수 있습니다.
API 및 공공데이터
앱은 기본적으로 다음 주소의 로컬 API 서버와 통신하도록 구성되어 있습니다.
```text
http://<Metro LAN Host>:4000/v1
```
모바일 기기에서 API를 호출하려면 앱을 실행하는 PC와 같은 Wi-Fi에 연결되어 있어야 합니다.
주요 API 예시
기능	Endpoint
초기 설정 저장	`POST /users/preferences`
홈 요약	`GET /home/summary`
물가 요약	`GET /prices/summary`
추천 구매	`GET /recommendations`
품목 검색	`GET /items/search`
품목 상세	`GET /items/{id}/detail`
가격 추이	`GET /items/{id}/trend`
판매처별 가격	`GET /items/{id}/sellers`
구매 판단	`GET /items/{id}/decision`
장보기 목록	`GET /shopping-list`
가격 알림 목록	`GET /alerts`
데이터 출처	`GET /data-sources`
사용 데이터
데이터	활용
한국소비자원 생필품 가격 정보	생필품, 생활용품 가격 및 판매처별 가격
한국소비자원 생필품 가격 정보 상품별 통계	상품 단위 평균가 및 가격 요약
KAMIS 농축수산물 가격 정보	농축수산물 가격, 지역별 비교, 가격 추이
aT 농축수산물 일자별 도소매 가격	일자별 도소매 가격 추이
식품영양성분DB	품목 기본 정보와 영양 정보 보조
API 키는 클라이언트 앱에 직접 넣지 않고 서버 환경 변수로 관리하는 것을 전제로 합니다.
```env
KAMIS_API_KEY=
FOOD_NUTRITION_DB_API_KEY=
CONSUMER_PRODUCT_PRICE_API_KEY=
```
구매 판단 로직
구매 판단은 규칙 기반 점수 모델로 시작합니다.
```text
relative_score = 30일 평균가 대비 현재가 점수
trend_score = 7일 가격 변동 점수
alternative_score = 대체 품목 절감률 점수
volatility_penalty = 가격 변동성 페널티
```
판정 기준은 다음과 같습니다.
판정	의미
`BUY`	현재가가 평균보다 낮고 가격 흐름이 안정적일 때
`WAIT`	최근 평균보다 높거나 상승 흐름일 때
`REPLACE`	비슷한 대체 품목이 충분히 더 저렴할 때
`NEUTRAL`	가격이 평균 수준일 때
구매 판단은 참고 정보이며, 실제 구매 결정은 사용자 판단을 기준으로 합니다.
개발 상태
영역	상태
Expo 모바일 앱 기본 구조	진행
하단 탭 내비게이션	진행
36개 화면 기준 라우팅/스펙	진행
홈, 검색, 장보기, 알림, MY 주요 화면	진행
API 클라이언트 연결 구조	진행
공공데이터 seed 데이터	진행
백엔드 API 서버	예정
PostgreSQL DB 스키마	예정
가격 수집 배치	예정
푸시 알림 실연동	예정
배포 파이프라인	예정
테스트 체크리스트
앱 실행
[ ] `npm install` 성공
[ ] `npm start` 성공
[ ] Expo Go에서 QR 실행 성공
[ ] Android 또는 iOS 에뮬레이터 실행 성공
화면 이동
[ ] 온보딩에서 초기 설정 이동
[ ] 초기 설정 완료 후 홈 이동
[ ] 하단 탭 5개 이동: 홈, 검색, 장보기, 알림, MY
[ ] 홈 카드에서 상세 화면 이동
[ ] 검색 결과에서 품목 상세 이동
[ ] 품목 상세에서 가격 추이, 판매처별 가격, 구매 판단 이동
기능
[ ] 품목 검색 동작
[ ] 카테고리 필터 동작
[ ] 장보기 품목 추가, 수정, 삭제
[ ] 장보기 예상 합계 표시
[ ] 가격 알림 생성, ON/OFF, 이력 확인
[ ] 데이터 출처 화면 표시
예외 상태
[ ] API 서버가 꺼져 있을 때 Error 상태 표시
[ ] 검색 결과가 없을 때 Empty 상태 표시
[ ] API 요청 중 Loading 상태 표시
[ ] 네트워크 오류 후 재시도 가능
문제 해결
`Network request failed`
모바일 기기에서 로컬 API 서버에 접근하지 못할 때 발생할 수 있습니다.
확인할 항목:
API 서버가 `4000` 포트로 실행 중인지 확인
PC와 모바일 기기가 같은 Wi-Fi에 연결되어 있는지 확인
방화벽에서 `4000` 포트 접근이 차단되지 않았는지 확인
`apps/mobile/src/services/apiClient.ts`의 fallback LAN IP가 현재 PC IP와 맞는지 확인
`npx` 실행 정책 오류
Windows PowerShell에서 스크립트 실행 정책 때문에 `npx expo start`가 막힐 수 있습니다.  
이 경우 PowerShell 대신 CMD 또는 Git Bash에서 실행하거나, 현재 사용자 범위 실행 정책을 조정합니다.
`package.json path does not exist`
명령어를 저장소 루트에서 실행한 경우 발생할 수 있습니다.  
모바일 앱 디렉터리로 이동한 뒤 실행합니다.
```bash
cd apps/mobile
npm install
npm start
```
브랜치 전략 예시
브랜치	용도
`main`	안정 배포 기준
`develop`	통합 개발 기준
`feature/*`	기능 개발
`fix/*`	버그 수정
`docs/*`	문서 작업
라이선스
현재 별도 라이선스가 지정되어 있지 않습니다.
