# AMGC POS

Point of sale for coffee shops and restaurants. This repo is the frontend: React, Vite, TypeScript and Ant Design, on the DCWD frontend stack.

```bash
yarn install
yarn dev        # http://localhost:5173, with the mock API
yarn build      # output in build/
yarn lint
```

## Signing in during development

`yarn dev` runs a mock of the future API (`mock/mock-api.ts`). It has these demo accounts, which exist only in the mock:

| Who | How | Value |
|---|---|---|
| Owner | Username and password | `owner` / `owner1234` |
| Manager | Username and password | `manager` / `manager1234` |
| Cashier Ana | PIN | `1234` |
| Cashier Ben | PIN | `5678` |

The mock starts with the prototype's sample menu (24 products in 6 categories) and a week of sample sales, so the Sales page has something to show.

Everything you change goes to `mock/data/db.json`, which git ignores: settings, staff, the menu and sales. Delete that file to start over.

## Where things are

| | |
|---|---|
| API routes the app expects | `docs/api-contract.md` |
| Conventions and decisions | `CLAUDE.md` |
| Routes and menu | `src/routes/allroutes.ts`, `src/constants/constantRoutes.ts` |
| Theme presets | `src/constants/constantThemes.ts` |
