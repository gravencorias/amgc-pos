# AMGC POS

Point of sale for coffee shops and restaurants. This repo is the frontend: React, Vite, TypeScript and Ant Design, on the DCWD frontend stack.

```bash
yarn install
yarn dev        # http://localhost:5173, with the mock API
yarn build      # output in build/
yarn lint
```

## Signing in during development

`yarn dev` runs a mock of the API (`mock/mock-api.ts`), so the app works without a database. The real API, `amgc-pos-api`, seeds the same demo accounts in development:

| Who | How | Value |
|---|---|---|
| Owner | Username and password | `owner` / `owner1234` |
| Manager | Username and password | `manager` / `manager1234` |
| Cashier Ana | PIN | `1234` |
| Cashier Ben | PIN | `5678` |

The mock starts with the prototype's sample menu (24 products in 6 categories) and a week of sample sales, so the Sales page has something to show.

Everything you change goes to `mock/data/db.json`, which git ignores: settings, staff, the menu and sales. Delete that file to start over.

## Using the real API

Run `amgc-pos-api` (see its README), then set these in `.env.development`:

```
VITE_API_URL=http://localhost:5000/api/
VITE_USE_MOCK_API=false
```

It seeds the same sample menu, but no sample sales.

## Where things are

| | |
|---|---|
| API routes the app expects | `docs/api-contract.md` |
| Conventions and decisions | `CLAUDE.md` |
| Routes and menu | `src/routes/allroutes.ts`, `src/constants/constantRoutes.ts` |
| Theme presets | `src/constants/constantThemes.ts` |
