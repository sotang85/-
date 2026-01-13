# Vendor Risk Screening

한국 거래처 온보딩 및 정기 심사를 위한 MVP 웹 앱입니다.

## 설정

```bash
pnpm install
```

`.env` 파일 생성:

```bash
cp .env.example .env
```

DB 마이그레이션 및 데모 데이터 시드:

```bash
pnpm prisma:generate
pnpm prisma:migrate
pnpm seed
```

앱 실행:

```bash
pnpm dev
```

## API 키

* `DATA_GO_KR_API_KEY`: 국세청 사업자 상태 조회(data.go.kr). 키가 없으면 모의 데이터를 사용합니다.
* `OPENDART_API_KEY`: OpenDART(상장사 공시) 조회용 선택 키입니다.
* `G2B_API_KEY`: 나라장터 사용자정보 서비스 조회용 키입니다.

## 테스트

```bash
pnpm test
```

## 문제 해결 (Windows)

### `prisma generate`에서 Json/enum 관련 오류가 날 때
로컬에 남아있는 `schema.prisma`가 옛 버전일 수 있습니다. 아래 순서로 최신 코드와 스키마를 확인하세요.

```bash
git pull
pnpm prisma:generate
pnpm prisma:migrate
```

Git이 설치되지 않았다면 먼저 Git을 설치하고 VS Code를 재시작해야 합니다.
