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
- Zustand, and **no `useState`**. Values read from the browser use `useSyncExternalStore` instead: `window.size.hook.ts` (breakpoint) and `clock/clock.hook.ts` (the Philippine time, "3:42 PM", re-rendering once a minute).
- Axios through `utils/http_service.ts`, with SweetAlert2 `Toast` and `showPopConfirmation`.
- Folders split by type, relative imports, and the skill's file naming (`*.service.ts`, `*.hook.ts`, `*.form.hook.ts`, `*.store.ts`, `*.request.model.ts` / `*.response.model.ts`).
- Routes are declared once in `routes/allroutes.ts` as `IRoute[]`, and paths live in `constants/constantRoutes.ts`. Don't hand-write routes in `View.tsx`.
- One global `<Modal/>` and `<Drawer/>`, opened through their stores. Every `showModal` call passes `centered: true` (antd's default is 100px from the top), including a body swap like the payment → receipt step, so the dialog doesn't jump.

**Copied verbatim. Don't edit them:**
- `utils/http_service.ts` (identical to payroll's; check with a hash comparison)
- `utils/object_to_param.ts`
- `utils/debouncer.ts`
- `models/common/pagination.ts`
- `models/common/route.model.ts`
- `utils/route.util.ts`
- `stores/common/connection.store.ts`
- the modal and drawer stores, models and components (the file really is named `models/common/drawer,model.ts`). One exception: `closeDrawer` in `stores/common/drawer.store.ts` differs from payroll's on purpose. It keeps the drawer's settings and only sets `open: false`, so a right-hand drawer doesn't close as an empty one on the left.

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
- Components used by more than one feature go in `components/common/`: `PageHeader`, `ListSectionTitle`, `CategoryIcon`, and `CategoryChip` (the category filter pill on the Register and the Products page).
- UI state that would otherwise need `useState` goes in a Zustand store under `stores/data/`. `login.store.ts` holds the sign-in method, the PIN digits, the "rejected" shake and the illustration's lamp.

Login (`login.hook.ts`) and Store details (`store-details.form.hook.ts`) are the two examples to copy.

### Boot and session

- **Startup:**
  - `main.tsx` → `App.tsx` → `View.tsx`. `App.tsx` sets up the QueryClient from `app.hook.ts` (60s `staleTime`, no retry, no refetch on focus) and the antd `ConfigProvider`, which takes its theme from `theme.store`.
  - `view.hook.ts` calls `account/me` whenever a token exists. `LoadingScreen` (`common/screen/`) covers the app while it fetches, for at least 1.2s, then fades out. It shows a cup filling with coffee (`_loading.scss`). Its colors are `var(--amgc-primary, $primary-color)`, which is still the Ube default at boot, because the store's branding isn't known yet.
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
- **Collapsing the Sider:** `SiderToggle` is a round button half over the Sider's right border. `ProtectedLayout` wraps the Sider in a `relative` div and renders the toggle as the Sider's sibling, because the Sider's own `overflow-y-auto` would clip it. `ProtectedSideNavigation` has no collapse control of its own, since its Drawer copy can't collapse.
- **Below `lg`:** the Sider and its toggle are hidden. The header's menu button opens the same `ProtectedSideNavigation` in the global Drawer, and `Menu` closes the drawer when someone navigates.

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
- **Menu and Sider stay `theme="light"`.** The dark algorithm darkens them. `theme="dark"` switches to antd's navy palette. A group's children sit on the Sider's surface, not antd's grey sub-menu panel (`_menu.scss`).
- **Overriding antd in Sass:** antd's CSS-in-JS selectors are wrapped in `:where()`, but some still carry four classes (the inline sub-menu does). A partial's override has to out-count them, so check the computed style when an override doesn't take.
- **SweetAlert follows the theme through `_swal.scss`.** Its rules are scoped under `.swal2-container` to outrank SweetAlert's injected styles. `http_service.ts` is verbatim and sets `confirmButtonColor` inline, so the button backgrounds there use `!important`. This covers every `Toast` and `showPopConfirmation`.
- **Scrollbars** are 6px app-wide (`index.scss`). The Register's product grid reaches 14px into its card's padding (8px gap + 6px bar), so the bar sits near the card's edge and the tiles still line up with the search box.

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

- **Login:** a PIN pad that works from the keyboard (digits, Backspace, Escape, Enter), and a password form. The brand panel has an SVG illustration (`LoginLoungeIllustration`) whose bean bag and mug take the brand color. Its floor lamp switches on and off by click, Enter or Space (`login.store.lampOn`); the lamp's key handler stops the event so Enter doesn't also submit the PIN.
- **Home:** a greeting and an "Open the register" button for everyone. Owners and managers also get the setup checklist (`SetupChecklist`) and a "Today so far" card (`TodaySnapshot`, see Sales). Cashiers get a short "Ready to sell" card instead.
- **Settings → Store details:** name, tagline, address, TIN, VAT registration and receipt footer, with a live receipt preview.
- **Settings → Branding:** logo upload, theme presets or a custom color, light/dark/auto, corners and text size, with a live register preview.
- **Register** (every role): the keyboard-first checkout.
  - **Menu:** the menu grid (`product/all`, `PRODUCT_ALL_KEY`) with category chips and a search box. The chips are one scrolling row that fades at the right edge, and a vertical mouse wheel scrolls it sideways.
  - **Ticket:** the order ticket, with dine-in or take-out, a table number, quantities, a senior citizen or PWD discount, the totals and a Charge button.
  - **Order state** lives in `register.store.ts`. It isn't persisted, so a page reload drops the order.
  - **The main hook** is `register.hook.tsx`, a `.tsx` file because it opens the modals itself. It also owns the window-level shortcuts: F2 search, arrows and Enter in the grid, F4 discount, F8 order type, F9 charge, + and − quantity, Del to clear, and typing to start a search. The shortcuts are skipped while a modal, the drawer or a SweetAlert is open. The handler reads fresh values from a ref that an effect updates.
  - **Modals:** each one gets a `key={Date.now()}` body so it remounts with fresh defaults. Opening one blurs the search box first, otherwise number keys and Enter would go into the search. Closing one calls `focusRegisterSearch()`, which is deferred because antd returns focus to whatever opened the modal.
  - **Size and add-ons picker** (`register-options.form.hook.ts`): 1–9 choose the size.
  - **Payment** (`register-payment.form.hook.tsx`): cash with quick amounts and change, GCash or Maya, or card with a reference. It posts `sale/create`. On success it clears the order and swaps the modal body to `SaleReceiptPanel`, which has print (`react-to-print`, 80 mm) and Enter for the next order.
  - **The server prices the sale.** The register's totals (`computeSaleTotals` in `utils/sale.util.ts`, Philippine VAT and the senior citizen / PWD rules) are for display only. The receipt prints the server's figures.
  - **Receipt:** `SaleReceipt` reuses the `.amgc-receipt` styles from the Store details preview. It ends with `RECEIPT_DISCLAIMER` until BIR accreditation.
- **Sales** (Owner and Manager): one day's report.
  - **Day picker:** previous, next and Today. Future days are disabled. On today the header shows the live time after the date (`useClock`).
  - **Content:** headline figures, sales by hour (CSS bars on one scale), how customers paid, top sellers, and a paged, searchable receipts table. Clicking a row opens the receipt with **Reprint**. There's one action per row, so it's a direct row click rather than a row menu.
  - **Data:** `sale/summary` and `sale` (`SALE_SUMMARY_KEY`, `SALE_LIST_KEY`). A completed sale on the Register invalidates both.
  - **Days are Philippine calendar days:** `utils/date.util.ts` (`phToday`), and the API groups by Asia/Manila.
  - **Home** shows owners and managers a "Today so far" card from the same summary. Cashiers don't request it, because the API returns 403.
- **Products** (Owner and Manager): the menu, with categories and add-ons.
  - **Table:** a paged table with category chips (the same `CategoryChip`, wrapping), a sold-out filter and a search. Each row has an "On the menu" switch and a react-contexify menu (Edit, Mark sold out, Delete). The page calls only `product.hook.ts`.
  - **Form:** one modal form for add and edit (`product.form.hook.ts`). It covers name, category, one price or up to 4 sizes (`Form.List`), add-ons and availability.
  - **Photo:** cropped to 480×480 in the browser and kept in `product.store.pendingPhoto` until the product saves. Then it's uploaded with `postForm`, so a new product gets its photo in the same step. A failed photo upload only warns; the product is already saved.
  - **Categories and add-ons:** each is edited in the global Drawer (`CategoryManager`, `AddOnManager`), with an inline form above its list. Every category has an icon (`enums/product.enum.ts`), which `ProductArt` shows for products without a photo.
  - **Shared query keys:** `constants/constantQueryKeys.ts` holds `CATEGORIES_KEY`, `ADD_ONS_KEY` and `PRODUCT_LIST_KEY`, so the three hooks can invalidate each other without importing each other. `SelectCategory` (`components/common/selects/`) reuses `CATEGORIES_KEY`.
  - **Who can do what:** cashiers can read the menu, because the Register will need it. Changing it is limited to owners and managers by the route `role` and by the API.
- **Settings → Staff:** add cashiers (PIN) and managers (username and password), edit names, reset a PIN or password, and turn accounts off or back on. Nothing is ever deleted, so past sales keep their names. This is the flat-CRUD shape:
  - a paged table (`staff.hook.ts`) with a react-contexify row menu
  - one form for add and edit, keyed off `editingStaff` (`staff.form.hook.ts`)
  - a separate reset form, keyed off `credentialStaff` (`staff-credential.form.hook.ts`)

  The route's `role` lets owners and managers open the page. Inside it, `canManageStaff` in `utils/roleChecker.ts` decides each row: the owner manages everyone, a manager only cashiers, and nobody can turn off themselves or the owner. The row menu keeps forbidden actions visible but greyed out, with the reason (`permissionsFor` in the hook). The API enforces the same rules; see `docs/api-contract.md`.

Everything in the prototype is built. Likely next steps:
- voiding or refunding a sale, with a manager PIN
- end-of-day cash count (Z reading)
- BIR accreditation fields on receipts
- the real `amgc-pos-api`
