# Vendor Risk Screening

MVP web app for Korea vendor onboarding and periodic review.

## Setup

```bash
pnpm install
```

Create `.env`:

```bash
cp .env.example .env
```

Run database migrations and seed demo data:

```bash
pnpm prisma:migrate
pnpm seed
```

Start the app:

```bash
pnpm dev
```

## API keys

* `DATA_GO_KR_API_KEY`: Required for NTS business status (data.go.kr). The app uses mock data when missing.
* `OPENDART_API_KEY`: Optional for OpenDART (listed-company disclosures).

## Tests

```bash
pnpm test
```
