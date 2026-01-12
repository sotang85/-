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
