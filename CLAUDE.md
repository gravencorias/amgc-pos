# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# AMGC POS (frontend)

A white-label point of sale for coffee shops and restaurants in the Philippines. Each store installs its own copy, which runs on the store's computers and network.

- The UI and features started from the clickable prototype in `D:\Repositories\amgc-pos-prototype`. Leave that folder as is.
- The marketing site is `D:\Repositories\amgc-pos-website`.

## Commands

```bash
yarn dev                 # http://localhost:5173, with the mock API (demo sign-ins are in README.md)
yarn build               # tsc -b, then vite build into build/ (not dist/)
yarn build:development   # vite build in development mode, without the type check
yarn lint                # eslint .
npx tsc -b               # type check only
```

There's no test runner. To check a change, run `npx tsc -b` and `yarn lint`. The lint output should list only the verbatim files below: `http_service.ts`, `object_to_param.ts`, `debouncer.ts`, `pagination.ts`, `route.model.ts` and `drawer,model.ts`. Any other file in it is a new error.

## Stack and conventions

Follow the `senior-frontend-dcwd-developer` skill. `D:\Repositories\dcwd_erp-hr-payroll` is the reference app. In short:

- React 19, Vite and TypeScript.
- Ant Design 6 and react-icons, with Tailwind and Sass partials in `src/assets/scss`.
- TanStack Query **v4**: `onSuccess` on queries, `isLoading` on mutations.
- Zustand, and **no `useState`**. `window.size.hook.ts` uses `useSyncExternalStore`.
- Axios through `utils/http_service.ts`, with SweetAlert2 `Toast` and `showPopConfirmation`.
- Folders split by type, relative imports, and the skill's file naming (`*.service.ts`, `*.hook.ts`, `*.form.hook.ts`, `*.store.ts`, `*.request.model.ts` / `*.response.model.ts`).
- Routes are declared once in `routes/allroutes.ts` as `IRoute[]`, and paths live in `constants/constantRoutes.ts`. Don't hand-write routes in `View.tsx`.
- One global `<Modal/>` and `<Drawer/>`, opened through their stores.

**Copied verbatim. Don't edit them:**
- `utils/http_service.ts` (identical to payroll's; check with a hash comparison)
- `utils/object_to_param.ts`
- `utils/debouncer.ts`
- `models/common/pagination.ts`
- `models/common/route.model.ts`
- `utils/route.util.ts`
- `stores/common/connection.store.ts`
- the modal and drawer stores, models and components (the file really is named `models/common/drawer,model.ts`)

`yarn lint` reports errors in these files, and payroll reports the same ones. Lint for the code written here is clean; keep it that way.

## How this app differs from the DCWD apps

- **Its own sign-in.** There's no portal and no `?token=` hand-off. `pages/auth/Login.tsx` has two methods:
  - a cashier PIN, through `auth/pin`
  - username and password for owners and managers, through `auth/login`

  The token is still stored under `hr_token`, because `http_service.ts` reads that key.
- **Layouts:**
  - `PublicLayout` holds Login and sends signed-in users home.
  - `ProtectedLayout` sends signed-out users to Login.
  - `PageNotFoundLayout` handles unknown routes.
  - There's no Unauthorized branch.
- **Roles** (`enums/user-role.enum.ts`): `P001` Owner, `P002` Manager, `P003` Cashier. Settings routes are limited to Owner and Manager. `View.tsx` shows `Forbidden` (403) if someone opens one by URL without the role.
- **Branding drives the theme.** The store's settings set the brand color, light/dark mode, corners and text size. See "Theming" below.
- **No offline screen yet.** `http_service.ts` writes to `connection.store` on every response, but nothing reads it here. The store's comment mentions `common/status/OfflineScreen.tsx`, which this repo doesn't have yet.

## Architecture

### Feature shape

Each feature runs `page → *.hook.ts → presentational components`:

- The page (`pages/<feature>/`) calls one hook and lays out the result.
- The hook (`hooks/<feature>/`) owns every query, mutation, antd `Form` instance, side effect and toast.
- Components (`components/<feature>/`) only take props. Examples: `PinPad`, `PasswordLoginForm`, `LogoUploader` and `BrandingPreview`.
- UI state that would otherwise need `useState` goes in a Zustand store under `stores/data/`. `login.store.ts` holds the sign-in method, the PIN digits and the "rejected" shake.

Login (`login.hook.ts`) and Store details (`store-details.form.hook.ts`) are the two examples to copy.

### Boot and session

- **Startup:**
  - `main.tsx` → `App.tsx` → `View.tsx`. `App.tsx` sets up the QueryClient from `app.hook.ts` (60s `staleTime`, no retry, no refetch on focus) and the antd `ConfigProvider`, which takes its theme from `theme.store`.
  - `view.hook.ts` calls `account/me` whenever a token exists. `LoadingScreen` covers the app while it fetches, for at least 1.2s, then fades out.
  - A real error response clears the token. A network failure or a service-down status (`serviceDownStatus`) keeps it.
  - `http_service.ts` handles 401s on its own.
- **Sign-in:** both mutations end in `onSignedIn`. It only sets the token and navigates home. Setting the token enables the `get-me` query, which fills `auth.store.userAccount`, so the sign-in response isn't stored directly.
- **Sign-out:** `auth.store.logout()` clears the token and does a full page load to `/login`. The full load is deliberate: it drops the previous user's query cache. Cashiers see this button as "Switch cashier" and owners and managers as "Sign out" (`checkIfManager` in `utils/roleChecker.ts`).

### Routing and roles

- **To add a page:**
  1. Add the path to `CONSTANT_ROUTES`.
  2. Add an `IRoute` to `PublicRoutes` or `ProtectedRoutes`. A parent with `children` has no path and no component.
- **Where routes are used:**
  - `View.tsx` registers routes with `flattenRoutes`.
  - The side menu (`components/protected/Menu.tsx`) builds itself from the same list through `filterRoutesByRole` and `filterOutHiddenMenuRoutes`.
  - So the route's `role` both hides the page from the menu and shows `Forbidden` (403) if it's opened by URL.
- **Below `lg`:** the Sider is hidden. The header's menu button opens the same `ProtectedSideNavigation` in the global Drawer, and `Menu` closes the drawer when someone navigates.

### Theming

- **Source of truth:** `resolveBranding()` in `utils/helpers.ts` turns an `IBrandingTheme` into `{ isDark, accent, ink, hue, radius, fontSize }`. It is the only place that maps these, and it handles:
  - presets from `constants/constantThemes.ts`, which match the prototype's `THEMES`
  - custom colors, lightened for dark mode
  - readable text color on top of the accent
  - corners to a radius, and text size to a font size

  Enum string values in `enums/branding.enum.ts` are what the API stores.
- **Global apply:** `theme.store.applyBranding()` turns that result into:
  - the antd token
  - the CSS vars `--amgc-primary`, `--amgc-on-primary` and `--amgc-hue` on `<html>`
  - `data-theme`

  `_variable.scss` derives `--amgc-bg-*`, `--amgc-border`, `--amgc-text-*` and `--amgc-paper*` from those, and Tailwind's `primary` is `var(--amgc-primary)`. Hand-rolled surfaces use these vars, not bare Tailwind colors. `$primary-color` is only the first-paint default (Ube) for the boot loader.
- **Who applies it:**
  - Login applies `store-settings/public`, so the sign-in screen already looks like the store.
  - `ProtectedLayout` applies the full settings, through `useStoreSettingsHook`.
  - `app.hook.ts` calls `reapplyBranding` when the OS switches light and dark, which is what makes "Match device" (`auto`) work.
- **Previews never apply the theme globally.** `BrandingPreview` calls `resolveBranding` on the unsaved form values (`Form.useWatch`) and puts the result in inline CSS vars on its own root. The app's theme only changes once the save lands in the query cache.
- **Menu and Sider stay `theme="light"`.** The dark algorithm darkens them. `theme="dark"` switches to antd's navy palette.

### Store settings (singleton resource)

- **Shape:** there's one `store-settings` object. `PUT store-settings/update` replaces all of it.
- **Every settings form:**
  - reads through `useStoreSettingsQuery()` (key `STORE_SETTINGS_KEY`)
  - builds its request with `toStoreSettingsRequest(cachedSettings)` and overrides only its own fields (`utils/store-settings.util.ts`)
  - sends empty optional text through `emptyToNull`
  - on success, writes the response into `STORE_SETTINGS_KEY` with `setQueryData` and invalidates `PUBLIC_STORE_SETTINGS_KEY`
- **The one exception to `onSuccess` on queries:** form values and branding are synced from the query's `data` in a `useEffect`. That way they also apply when the data comes from the cache.
- **Logo** (`logo.hook.ts`):
  - antd `Upload`'s `beforeUpload` returns `false`.
  - `utils/image_resize.ts` crops the image to a 320×320 PNG in the browser.
  - The hook then posts it with `requests.postForm`.
- **Home:** the setup checklist (`home.hook.ts`) reads the same cached settings. It counts the store name as unset while it's still the default "My Café".

### API and mock

There's no backend yet. `docs/api-contract.md` lists every route and its payload.

`mock/mock-api.ts` is a Vite plugin. It answers those routes during `yarn dev` when `VITE_USE_MOCK_API=true`, which is the setting in `.env.development`. It matches method and path by hand, and it requires the Bearer token its own sign-in returns on every route except the public ones. It saves settings to `mock/data/db.json`, which git ignores; delete that file to reset.

A new API route changes three things together: its row in `api-contract.md`, a handler in `mock-api.ts`, and the matching `*.service.ts` method.

Build the real API in a sibling `amgc-pos-api` repo with the `senior-backend-dcwd-developer` skill. Then set `VITE_API_URL` to it and `VITE_USE_MOCK_API=false`. `.env` has `http://localhost:5000/api/`, but `.env.development` and `.env.production` both override it, so change the mode-specific file.

## Features so far

- **Login:** a PIN pad that works from the keyboard (digits, Backspace, Escape, Enter), and a password form.
- **Home:** a setup checklist for owners and managers, plus a "coming next" list.
- **Settings → Store details:** name, tagline, address, TIN, VAT registration and receipt footer, with a live receipt preview.
- **Settings → Branding:** logo upload, theme presets or a custom color, light/dark/auto, corners and text size, with a live register preview.

Next, per the prototype: Products and categories, then the Register (checkout), then Sales.
