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
- **Roles** (`enums/user-role.enum.ts`): `P001` Owner, `P002` Manager, `P003` Cashier. The signed-in account's code is `tokenInfo.roles[].access` (also the JWT's role claim); there's no separate `accessLevels` list. Routes and `utils/roleChecker.ts` gate on it. Settings routes are limited to Owner and Manager. `View.tsx` shows `Forbidden` (403) if someone opens one by URL without the role.
- **Branding drives the theme.** The store's settings set the brand color, light/dark mode, corners and text size. See "Theming" below.
- **No offline screen yet.** `http_service.ts` writes to `connection.store` on every response, but nothing reads it here. The store's comment mentions `common/status/OfflineScreen.tsx`, which this repo doesn't have yet.

## System architecture (frontend and backend)

AMGC POS is two repos that meet at one contract:

| | Repo | Stack | Role |
|---|---|---|---|
| Frontend | `D:\Repositories\amgc-pos` (this one) | React 19, Vite, antd, TanStack Query v4, Zustand | every screen; the Register's totals are for display only |
| Backend | `D:\Repositories\amgc-pos-api` | ASP.NET Core 9, EF Core 9, PostgreSQL 17 | the source of truth: accounts, menu, pricing, numbering, days |
| Contract | `docs/api-contract.md` (here) | | every route, payload, rule and status code |
| Mock | `mock/mock-api.ts` (here) | Vite plugin | answers the contract during `yarn dev`; the quick reference for rules and messages |

**How a store runs it.** Each store installs its own copy on its own PC: PostgreSQL and `amgc-pos-api` run there as Windows services, on port 5000. PC registers open the app in a browser; Android tablets (planned, Capacitor, same code) are extra registers on the store's Wi-Fi. There's no cloud and no multi-tenancy: one install, one store, one database. The API serves this app's production build itself (from its `wwwroot`), so registers open `http://<server>:5000` and the app calls `/api` on the same address. A store gets one setup program, `AMGC-POS-Setup-<version>.exe` (or the same package as a zip), built by `amgc-pos-api/deploy/build-package.ps1`: it runs `yarn build` here, so `.env.production` must keep `VITE_API_URL=/api/` and `VITE_USE_MOCK_API=false` (the script checks). The setup asks for the owner's details and sets up PostgreSQL, the service, the firewall rule and nightly backups; running a newer one upgrades. See "Deployment" in `amgc-pos-api/CLAUDE.md`.

**A request, end to end:**
1. A page's hook calls a `*.service.ts` method, which goes through `utils/http_service.ts` (Axios, `VITE_API_URL`, `Authorization: Bearer <hr_token>`).
2. In the API, a thin controller (`Controllers/Main/POS/*`) calls one service method. The controller checks the route's role with `[AuthorizeRoles(...)]`; the service applies the finer rules (who may manage whom, a cashier's own sale from today) and returns `Result<T>`.
3. `BaseController` turns the `Result` into the HTTP answer: 200 with the value; 400, 403 or 404 with `{ status, title, message, errors }`.
4. The hook's `onError` shows the message in a toast, mostly through `getApiErrorMessage` (`errors[0].title`, then `message`).

**What the two sides rely on from each other:**
- **One role concept.** The role code (`P001` Owner, `P002` Manager, `P003` Cashier) is the JWT's role claim, `[AuthorizeRoles]` in the API, `tokenInfo.roles[].access` in `IUserAccountResponse`, and what `IRoute.role` and `utils/roleChecker.ts` check here. There's no `accessLevels` list on either side. `userInfo.roleName` is only for display.
- **401 means the session ended**, nothing else. `http_service.ts` clears the token on any 401. So the API answers 400 for a wrong PIN, password or void approver, and 401 only for a missing, expired or invalid token. It also answers 401 on every route once an account is turned off or its PIN or password is reset (a session-version claim the API checks on each request).
- **The server decides the numbers.** It re-prices every sale from the menu (Philippine VAT, senior citizen and PWD discounts), numbers receipts, orders and Z readings, and groups everything by Manila calendar day. The Register's `computeSaleTotals` is a preview; the receipt prints the server's figures.
- **Lists are `IPaginatedResult`** (`{ data, pageSize, currentPage, totalPages, totalCount }`). An empty page is 200 with `data: []`, never a 404.
- **Uploaded images** (the logo, product photos) come back as absolute URLs built from the host the client used, so `localhost` on the server PC and `192.168.x.x` on a tablet both load. Upload with `requests.postForm`; the image goes in the `File` part.
- **Past records don't change.** Staff are turned off, never deleted. A sale copies its item names, prices and cashier's name, so editing or deleting the menu never changes an old receipt. A void and a reopened Z reading stay on record with their status.

**Backend layering** (details in `amgc-pos-api/CLAUDE.md`): five projects, `Common` ← `Domain` ← `Data` ← `Services`, with `API` on top, following the `senior-backend-dcwd-developer` skill. `Common` holds the request and response DTOs (field for field with `src/models/`), constants and helpers; `Domain` the EF entities; `Data` the `DataContext`, migrations, seeding and per-install keys; `Services` the business rules, validators and hand-written mappers (no AutoMapper); `API` the controllers, JWT auth and Swagger.

**Changing the contract** touches four places together: `docs/api-contract.md`, the mock handler, the `*.service.ts` method here, and the route in `amgc-pos-api` (its DTO in `Common`, service, validator and controller).

## Architecture (frontend)

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
  - `view.hook.ts` calls `account/me` whenever a token exists. `LoadingScreen` (`common/screen/`) covers the app while it fetches, for at least 1.2s, then fades out. It shows a cup filling with coffee (`_loading.scss`). It uses the store's branding even though the settings haven't loaded: `theme.store` saves every `applyBranding` to localStorage (`amgc_branding`) and builds the first theme from it before the first render. Only a device's very first visit falls back to the Ube default.
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

  `_variable.scss` derives `--amgc-bg-*`, `--amgc-border`, `--amgc-text-*` and `--amgc-paper*` from those, and Tailwind's `primary` is `var(--amgc-primary)`. Hand-rolled surfaces use these vars, not bare Tailwind colors. `$primary-color` (Ube) is only the fallback before this device has saved any branding.
- **Who applies it:**
  - Login applies `store-settings/public`, so the sign-in screen already looks like the store.
  - `ProtectedLayout` applies the full settings, through `useStoreSettingsHook`.
  - `app.hook.ts` calls `reapplyBranding` when the OS switches light and dark, which is what makes "Match device" (`auto`) work.
- **Previews never apply the theme globally.** `BrandingPreview` calls `resolveBranding` on the unsaved form values (`Form.useWatch`) and puts the result in inline CSS vars on its own root. The app's theme only changes once the save lands in the query cache.
- **Menu and Sider stay `theme="light"`.** The dark algorithm darkens them. `theme="dark"` switches to antd's navy palette. A group's children sit on the Sider's surface, not antd's grey sub-menu panel (`_menu.scss`).
- **Segmented toggles look the same on every page**, like the prototype's `.seg`. The shape and theme-tinted colors are `components.Segmented` tokens in `theme.store`'s `buildTheme`; the border and label weight, which have no tokens, are in `_segmented.scss`. They follow the Corners setting: pills when Rounded, otherwise the app's radius. Don't style a single `Segmented` on its own.
- **Overriding antd in Sass:** antd's CSS-in-JS selectors are wrapped in `:where()`, but some still carry four classes (the inline sub-menu does). A partial's override has to out-count them, so check the computed style when an override doesn't take.
- **SweetAlert follows the theme through `_swal.scss`.** Its rules are scoped under `.swal2-container` to outrank SweetAlert's injected styles. `http_service.ts` is verbatim and sets `confirmButtonColor` inline, so the button backgrounds there use `!important`. This covers every `Toast` and `showPopConfirmation`. The success icon's cover pieces (`swal2-success-circular-line-*`, `swal2-success-fix`) get their color inline from SweetAlert, so they also need `!important` to match the surface in dark mode.
- **Scrollbars** are 6px app-wide (`index.scss`). The Register's product grid reaches 14px into its card's padding (8px gap + 6px bar), so the bar sits near the card's edge and the tiles still line up with the search box.

### Store settings (singleton resource)

- **Shape:** there's one `store-settings` object. `PUT store-settings/update` replaces all of it.
- **Every settings form:**
  - reads through `useStoreSettingsQuery()` (key `STORE_SETTINGS_KEY`)
  - builds its request with `toStoreSettingsRequest(cachedSettings)` and overrides only its own fields (`utils/store-settings.util.ts`)
  - sends empty optional text through `emptyToNull`
  - keeps Save disabled until `isDirty`, which compares the watched values with the saved ones after the same cleanup the save does (`toDetails` in `store-details.form.hook.ts`)
  - on success, writes the response into `STORE_SETTINGS_KEY` with `setQueryData` and invalidates `PUBLIC_STORE_SETTINGS_KEY`
- **The one exception to `onSuccess` on queries:** form values and branding are synced from the query's `data` in a `useEffect`. That way they also apply when the data comes from the cache.
- **Logo** (`logo.hook.ts`):
  - antd `Upload`'s `beforeUpload` returns `false`.
  - `utils/image_resize.ts` crops the image to a 320×320 PNG in the browser.
  - The hook then posts it with `requests.postForm`.
- **Home:** the setup checklist (`home.hook.ts`) reads the same cached settings. It counts the store name as unset while it's still the default "My Café".

### API and mock

`docs/api-contract.md` lists every route and its payload. Two things answer it:

- **The real API**, `D:\Repositories\amgc-pos-api` (ASP.NET Core 9, EF Core, PostgreSQL, built with the `senior-backend-dcwd-developer` skill). It answers every route in the contract. Its `CLAUDE.md` has the run steps and decisions; it listens on `http://localhost:5000` and seeds the same demo sign-ins and sample menu in Development (no sample sales).
- **The mock**, `mock/mock-api.ts`, a Vite plugin. It answers the same routes during `yarn dev` when `VITE_USE_MOCK_API=true`, which is the setting in `.env.development`. It matches method and path by hand, and it requires the Bearer token its own sign-in returns on every route except the public ones. It saves its data to `mock/data/db.json`, which git ignores; delete that file to reset. It's still handy for UI work without a database, and it's the quick reference for the API's rules and messages.

**To run against the real API:** start `amgc-pos-api`, then set `VITE_API_URL=http://localhost:5000/api/` and `VITE_USE_MOCK_API=false` in `.env.development` (Vite restarts by itself). `.env` has the same URL, but `.env.development` and `.env.production` both override it, so change the mode-specific file. The API allows CORS from `http://localhost:5173` in Development. In production the API serves the built app itself, so `.env.production` keeps `/api/`. Client-side routes work on a full page load too: the API answers any non-API path with `index.html`.

A new API route changes four things together: its row in `api-contract.md`, a handler in `mock-api.ts`, the matching `*.service.ts` method, and the route in `amgc-pos-api`.

## Android tablet version (planned, not started)

**Decided:** the tablet version has **all the same features** as the PC app, and it lives **in this repo**, not a separate project. A feature is built once, and both get it; the tablet differences are a touch switch and a printing switch. **Pairing by QR code** is part of it (step 1).

The plan is to ship this same React app as an Android app with **Capacitor**, not a rewrite. The `android/` folder lives in this repo, and about 95% of the code is shared. Tablets are extra registers, talking over Wi-Fi to the store's own `amgc-pos-api` on a PC or mini-PC. Data stays on the store's server, as with PC registers, and a store can mix PCs and tablets. A tablet-only store (no PC) would need a cloud API or an on-device database; that's out of scope.

**Target:** a 10-inch tablet in landscape. The two-panel Register already fits at about 1280×800. Phones need a one-column layout; leave that for later, or for manager reports only.

**Ready to start:** `amgc-pos-api` exists. A tablet can reach it over Wi-Fi once it listens on the LAN: its production settings already listen on `http://0.0.0.0:5000`, while Development pins `localhost`. The mock only runs inside `yarn dev`, so it's no use to an installed APK.

**Tooling:** Android Studio (SDK and emulator) and JDK 17, plus these packages:
- `@capacitor/core`, `@capacitor/cli` and `@capacitor/android`
- `npx cap init`, with `webDir: "build"`, because Vite builds into `build/`
- `npx cap add android`

Build with `yarn build`, then `npx cap sync`, then the APK from Android Studio. Distribute by direct APK install, or a private Play Store listing for easier updates.

**Work, in order:**
1. **Connecting to the store server.** `VITE_API_URL` is fixed at build time, which can't work across stores.
   - **The "Connect to your store" screen.** It shows on first launch, when no address is saved, before sign-in.
     - **Two ways in:** **Scan QR** (the default) or **Type the address** (e.g. `192.168.1.10:5000`).
     - **Test it first.** Call `store-settings/public`, then show the store's name and logo: "Connect to Allia's Café?". That confirms it's the right server.
     - **Save it** on the tablet (Capacitor Preferences or localStorage).
     - **Apply it** by setting `axios.defaults.baseURL` at startup, outside `http_service.ts`, which stays verbatim.
     - **Change it later** through a "Change server" link on the sign-in screen.
   - **QR pairing, the PC side.** Add a **Settings → Devices** page (Owner and Manager) that shows a QR code for tablets to scan.
     - **The QR holds only the address, never a token,** so scanning it doesn't sign anyone in. Tablets still sign in with a PIN or password. Format: `amgcpos://connect?api=http%3A%2F%2F192.168.1.10%3A5000%2Fapi%2F&store=Allia%27s%20Caf%C3%A9`.
     - **The API supplies the address.** A browser on the server PC often opens the app as `localhost`, so it can't know the LAN address itself. So `amgc-pos-api` needs a route, e.g. `GET system/server-info`, that returns the server's LAN address(es) and port. Add it to `api-contract.md`, the mock and a service.
     - **More than one address:** if the server has several (Wi-Fi and cable), let the owner pick which one the QR shows.
     - **Libraries:** draw the QR with a QR library (e.g. `qrcode.react`), and scan it on the tablet with a Capacitor barcode-scanning plugin (camera).
   - **Store setup checklist:** reserve a fixed LAN address for the server PC in the router (a DHCP reservation). Otherwise the address can change after a router restart, and every tablet loses the server.
2. **Touch-first screens.** The app is keyboard-and-mouse first. On touch, the same pages adjust; there's no separate tablet page.
   - **Detecting touch:** a `useSyncExternalStore` hook like `window.size.hook.ts` (`pointer: coarse`). On a PC nothing changes.
   - **Everywhere:**
     - Tap targets of at least 44–48 px.
     - Visible labels instead of hover-only tooltips.
     - A visible **⋯** button on rows that today rely on a react-contexify right-click menu (Products, Staff).
     - A pressed state instead of hover.
   - **Register:**
     - **Keys:** hide `RegisterShortcutBar` and the F-key hints. Every shortcut already has a button: make them bigger.
     - **Search:** **don't auto-focus it**, or the on-screen keyboard pops up after every sale. Tapping tiles and chips is the main way to add items.
     - **The ticket:** large round − / + steppers and a clear Remove button. Hide the arrow-key grid highlight.
   - **Charge:** an on-screen **number pad** (like `PinPad`, with 00 and backspace) for cash received, plus bigger quick-cash buttons. That keeps the Android keyboard from covering the dialog.
   - **Size and add-ons picker:** taller choice buttons. Hide the 1–9 hints.
   - **Other forms:**
     - **Close day count:** `inputMode="numeric"` on the boxes, optionally with + / − per denomination.
     - **Void and reopen:** bigger reason chips.
     - **Tables:** taller rows.
3. **Printing to Bluetooth thermal printers (ESC/POS).**
   - **Why:** `react-to-print` uses the system print dialog, which doesn't fit a counter. Common PH printers (Xprinter, GOOJPRT, Rongta; 58 mm or 80 mm) take raw ESC/POS bytes over Bluetooth.
   - **How:** a Capacitor Bluetooth printer plugin, plus a `utils/escpos.ts` that turns a sale, a Z reading or a void into ESC/POS text lines. Reuse the data `SaleReceipt` and `ZReading` print; the React components stay for the screen and for PC printing.
   - **Printer setup:** pair once in Settings, and save the printer's address and paper width (58 mm is 32 characters a line, 80 mm is 48).
   - **Cash drawer:** the drawer kick command goes through the printer, sent on a cash sale.
   - **Fallback:** the PC web app keeps `react-to-print`. Pick the path by platform (`Capacitor.isNativePlatform()`).
4. **Android settings:**
   - Allow cleartext `http://` to the LAN through a network security config, unless the API serves HTTPS.
   - Keep the screen awake.
   - Lock the tablet to the app with screen pinning or kiosk mode.
5. **Later:**
   - an offline queue for sales when Wi-Fi drops (save, then send when back)
   - a phone layout for reports

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
  - **Focus in modals:** antd's Modal takes focus as it opens, which beats `autoFocus`. A form that should start in a field focuses it about 120ms later in an effect. The payment form uses `.amgc-payment-focus`, and the void and reopen forms use `.amgc-focus-first`.
  - **Modals:** each one gets a `key={Date.now()}` body so it remounts with fresh defaults. Opening one blurs the search box first, otherwise number keys and Enter would go into the search. Closing one calls `focusRegisterSearch()`, which is deferred because antd returns focus to whatever opened the modal.
  - **Size and add-ons picker** (`register-options.form.hook.ts`): 1–9 choose the size.
  - **Payment** (`register-payment.form.hook.tsx`): cash with quick amounts and change, GCash or Maya, or card with a reference. It posts `sale/create`. On success it clears the order and swaps the modal body to `SaleReceiptPanel`, which has print (`react-to-print`, 80 mm), Enter for the next order, and **Void** (see Voids). `showReceipt` and `showVoid` are module-level in that file and read the stores with `getState()`, because the payment form unmounts as soon as the receipt replaces it.
  - **The server prices the sale.** The register's totals (`computeSaleTotals` in `utils/sale.util.ts`, Philippine VAT and the senior citizen / PWD rules) are for display only. The receipt prints the server's figures.
  - **Receipt:** `SaleReceipt` reuses the `.amgc-receipt` styles from the Store details preview. It ends with `RECEIPT_DISCLAIMER` until BIR accreditation.
- **Sales** (Owner and Manager): one day's report.
  - **Day picker:** previous, next and Today. Future days are disabled. On today the header shows the live time after the date (`useClock`).
  - **Content:** headline figures, sales by hour (CSS bars on one scale), how customers paid, top sellers, and a paged, searchable receipts table. Clicking a row opens the receipt with **Reprint** and, for a completed sale, **Void sale**. It's a direct row click rather than a row menu, since the receipt is where both actions live.
  - **Data:** `sale/summary` and `sale` (`SALE_SUMMARY_KEY`, `SALE_LIST_KEY`). A completed sale on the Register, and any void, invalidates both.
- **Voids:** cancel a whole sale. Partial refunds aren't built yet.
  - **The sale stays on record.** `sale/void` marks it `status: voided` with `voidInfo` (reason, when, voided by, approved by). The summary leaves it out of every figure and reports `voidCount` and `voidTotal`, which the Sales stat card notes. The list shows it muted, with a "Void" tag and the total struck through.
  - **Who:** an owner or manager voids any completed sale and approves it themselves. A cashier voids only their own sale from today, from the receipt after Charge, and an owner or manager types their username and password into the same form to approve. Managers have no PIN, so it's their sign-in. The API enforces all of this; see `docs/api-contract.md`.
  - **One form, two places:** `SaleVoidForm` (`components/sales/`) with `sale-void.form.hook.ts` takes `sale`, `onBack` and `onVoided`. The opener swaps it into the same modal in place of the receipt, and back again. That's `openVoid` in `Sales.tsx` and `showVoid` in the payment hook. The form shows the approval fields only when `checkIfManager` is false. It tells the cashier how to hand the money back, by payment method, with the payment's reference number.
  - **Receipt:** a voided `SaleReceipt` prints `*** VOID ***` under the header and a "VOIDED. NOT A SALE." block with the details at the bottom, so a reprint can't pass as a sale.
  - **Days are Philippine calendar days:** `utils/date.util.ts` (`phToday`), and the API groups by Asia/Manila.
  - **Home** shows owners and managers a "Today so far" card from the same summary. Cashiers don't request it, because the API returns 403.
- **Close day** (Owner and Manager): end-of-day cash count and Z reading, at `/close-day`.
  - **One day at a time.** `day-close/current` picks the day that's due: an earlier day with sales that was never closed, otherwise today. The page shows that day's figures (`DayFigures`) and the count (`CashCountForm`). Once it's closed, the page shows a "closed" card with its Z reading. There's no day picker, because closings must go in date order.
  - **The count:** starting float, prefilled from the last closing, plus quantities per denomination (`constants/constantCash.ts`, ₱1,000 down to 25¢). `close-day.hook.tsx` works out counted, expected (float + cash sales) and over/short live with `Form.useWatch`. The form's `counts` is keyed by denomination string ("1000", "0.25"). The server recomputes everything when it saves.
  - **Closing** asks for confirmation through `showPopConfirmation`, then saves. The new Z reading opens in the modal (`ZReadingView` → `ZReading`, 80 mm, in the sale receipt's `.amgc-receipt` styles). It has the cash count, over/short, and the old and new grand totals (BIR's accumulated grand total).
  - **A closed day is final.** The API refuses new sales while today is closed, and voids on any closed day.
  - **The Register knows.** `register.hook.tsx` reads `day-close/today` (`DAY_CLOSE_TODAY_KEY`), which cashiers can read too. It refetches every 60s, because the day is often closed from another computer. Once closed, the ticket shows a "Today is closed" note with the Z number, time and who closed it. Charge reads "Closed for today" and is disabled, and F9 shows a toast. Adding items still works. Closing the day and a failed `sale/create` both invalidate the key.
  - **Past closings** (`DayCloseTable`): newest first. A row opens its Z reading to reprint.
  - **Reopening** (`day-close/reopen`) is for a day closed by mistake. It's **owner only** (`checkIfOwner`), and only for the latest closing still in force: `latestCloseId` from `day-close/current`, or the closing just made.
    - `ZReadingView` gets `onReopen` only then, and the closed-day card shows "Reopen the day" (`canReopenCurrent`).
    - `DayReopenForm` (`day-reopen.form.hook.ts`) asks for a reason and swaps into the modal in place of the Z reading, like the void form.
    - The Z reading stays on record as `reopened` with `reopenInfo`. It's muted with a tag in the list, and prints "*** REOPENED ***".
    - The day is due again. The next closing gets a new Z number and skips the reopened closing for the grand total.
    - BIR doesn't allow this on an accredited POS; see the contract.
  - **Keys:** `DAY_CLOSE_CURRENT_KEY` and `DAY_CLOSE_LIST_KEY`. A sale or a void also invalidates `DAY_CLOSE_CURRENT_KEY`, because the open day's figures change.
  - **Mock:** sample closings are created for every past day with sales, so only today is open. Each one balances, with a ₱2,000 float.
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

Everything in the prototype is built, plus voids and closing the day, and `amgc-pos-api` answers all of it. Likely next steps:
- partial refunds (single items) if stores ask for them
- BIR accreditation fields on receipts
- the Android tablet version (above)
- a full test install on a spare PC or VM (registering the service, firewall rule and backup task hasn't been run yet)
- an offline screen (`connection.store` is already fed by `http_service.ts`)
