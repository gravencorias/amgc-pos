# amgc-pos-api contract

These are the routes the frontend calls. `amgc-pos-api` (`D:\Repositories\amgc-pos-api`: ASP.NET Core + PostgreSQL, built with the `senior-backend-dcwd-developer` skill) answers all of them, and `mock/mock-api.ts` answers the same routes during `yarn dev`. A change here means a change in both.

- **Base URL:** `VITE_API_URL`.
- **Auth:** `Authorization: Bearer <token>` on every route except the ones marked *public*.
- **Errors:** return `{ "message": "..." }`. The frontend shows that message in a toast.
- **Status codes:**
  - Use **400** for a wrong PIN or password, not 401. `utils/http_service.ts` treats any 401 as "session ended" and clears the token.
  - Use **401** only for a missing, expired or invalid token.

## Auth

| Method | Route | Body | Returns |
|---|---|---|---|
| POST | `auth/login` *(public)* | `{ username, password }` | `IUserAccountResponse` |
| POST | `auth/pin` *(public)* | `{ pin }` (4–6 digits) | `IUserAccountResponse` |
| GET | `account/me` | | `IUserAccountResponse` |

`IUserAccountResponse` (`src/models/auth/authentication.response.ts`):

```json
{
  "id": 1,
  "userInfo": { "id": 1, "username": "owner", "fullName": "Maria Santos", "roleName": "Owner" },
  "tokenInfo": {
    "token": "…",
    "refreshToken": "",
    "expiration": 1767225600000,
    "roles": [{ "access": "P001" }]
  }
}
```

`roles[].access` is the account's role code, and the JWT's role claim carries the same code. The app's routes and permission checks gate on it. `userInfo.roleName` is the display name.

### Role codes

Codes come from `src/enums/user-role.enum.ts`:

| Code | Role | Signs in with | Can open Settings |
|---|---|---|---|
| `P001` | Owner | Username and password | Yes |
| `P002` | Manager | Username and password | Yes |
| `P003` | Cashier | PIN | No |

## Store settings

Each install holds a single row of store settings.

| Method | Route | Body | Returns |
|---|---|---|---|
| GET | `store-settings` | | `IStoreSettingsResponse` |
| GET | `store-settings/public` *(public)* | | `IPublicStoreSettingsResponse`: name, logo and branding only, for the sign-in screen |
| PUT | `store-settings/update` | `IStoreSettingsRequest` (the whole object) | `IStoreSettingsResponse` |
| POST | `store-settings/logo` | `multipart/form-data`, image in the `File` part (PNG, already resized to 320×320) | `IStoreSettingsResponse` |
| DELETE | `store-settings/logo` | | `IStoreSettingsResponse` |

The update and logo routes are **Owner or Manager only**. Return 403 for a cashier.

Field rules (see `src/models/store-settings/`):

- `storeName`: required, up to 60 characters.
- `tagline`: up to 80 characters.
- `address`: up to 160 characters.
- `receiptFooter`: up to 80 characters.
- `tin`: `000-000-000` or `000-000-000-000(00)`.
- `theme`: `ube`, `espresso`, `matcha`, `calamansi`, `harbor`, `chili`, `graphite` or `custom`.
- `customColor`: `#RRGGBB`, used when `theme` is `custom`.
- `mode`: `light`, `dark` or `auto`.
- `corners`: `rounded`, `soft` or `square`.
- `textSize`: `normal` or `large`.
- `logoUrl`: a URL the browser can load. The mock returns a data URL; the API should store the file and return its URL.

## Menu: categories, add-ons and products

Anyone signed in can **read** the menu, because the register needs it. Only an **Owner or Manager** can change it. Return 403 to a cashier on any other method.

### Categories

| Method | Route | Body | Returns |
|---|---|---|---|
| GET | `category/all` | | `ICategoryResponse[]`, in menu order (`sortOrder`) |
| POST | `category/create` | `{ name, icon }` | `ICategoryResponse` |
| PUT | `category/update` | `{ id, name, icon }` | `ICategoryResponse` |
| DELETE | `category/delete/{id}` | | `ICategoryResponse`. Return 400 while any product is still in it. |

`ICategoryResponse`: `{ id, name, icon, sortOrder, productCount }`.

- `name`: required, up to 30 characters, unique.
- `icon`: the picture shown for products without a photo. One of `hot`, `iced`, `drink`, `pastry`, `meal`, `sandwich`, `salad`, `pizza`, `dessert` or `frozen` (`src/enums/product.enum.ts`).

### Add-ons

| Method | Route | Body | Returns |
|---|---|---|---|
| GET | `add-on/all` | | `IAddOnResponse[]`, by name |
| POST | `add-on/create` | `{ name, price }` | `IAddOnResponse` |
| PUT | `add-on/update` | `{ id, name, price }` | `IAddOnResponse` |
| DELETE | `add-on/delete/{id}` | | `IAddOnResponse`. Also removes it from every product that offered it. |

`IAddOnResponse`: `{ id, name, price, productCount }`.

- `name`: required and unique.
- `price`: 0 or more. 0 means free, for example "No sugar".

### Products

| Method | Route | Body / query | Returns |
|---|---|---|---|
| GET | `product` | query: `pageNumber`, `pageSize`, `search`, `categoryId`, `availability` (`all`, `available` or `soldOut`), `sort` (`name_ascend`, `name_descend`, `price_ascend`, `price_descend`; the default is menu order) | `IPaginatedResult<IProductResponse>` |
| POST | `product/create` | `IProductRequest` | `IProductResponse` |
| PUT | `product/update` | `IProductRequest` with `id` | `IProductResponse` |
| PUT | `product/set-available` | `{ id, isAvailable }` | `IProductResponse` |
| DELETE | `product/delete/{id}` | | `IProductResponse` |
| POST | `product/{id}/photo` | `multipart/form-data`, image in the `File` part (a PNG the app has already cropped to 480×480) | `IProductResponse` |
| DELETE | `product/{id}/photo` | | `IProductResponse` |

`IProductRequest`: `{ id?, name, categoryId, price, sizes: [{ name, price }], addOnIds: number[], isAvailable }`.

`IProductResponse` is the same fields plus `categoryName`, `categoryIcon`, `photoUrl` and `updatedAt`.

- `name`: required, up to 40 characters, unique.
- `sizes`: up to 4. When there are sizes, each needs a name and a price above 0, and `price` is the lowest size price. With no sizes, `price` must be above 0.
- `addOnIds`: only existing add-ons.
- Deleting a product must not change past sales. Sales store the item's name and price at the time of the sale.

`GET product/all` returns the whole menu as `IProductResponse[]`, in menu order, sold-out items included. The Register uses it.

## Sales

| Method | Route | Body | Returns |
|---|---|---|---|
| POST | `sale/create` | `ISaleRequest` | `ISaleResponse` |

Anyone signed in can create a sale, and the signed-in person is recorded as the cashier.

`ISaleRequest` (`src/models/sale/sale.request.model.ts`):

```json
{
  "orderType": "dine_in",
  "tableNo": "7",
  "lines": [{ "productId": 5, "sizeName": "16 oz", "addOnIds": [2], "note": "Less sweet", "qty": 1 }],
  "discount": { "kind": "sc", "name": "Juan Dela Cruz", "idNumber": "DVO-12345" },
  "payment": { "method": "cash", "tendered": 500, "reference": null }
}
```

- `orderType`: `dine_in` or `take_out`. `tableNo` applies to dine-in only.
- `discount`: `null`, or `kind` `sc` (senior citizen) or `pwd`, with the name and ID number from the card. Both are required.
- `payment.method`: `cash`, `ewallet` (GCash or Maya) or `card`.
  - For cash, `tendered` is the cash received.
  - For e-wallet and card, `reference` is the optional transaction reference.

The server must **re-price every line** from the current menu, and must ignore any prices sent by the register. Return 400 when:
- a product is missing or sold out
- a product with sizes has no valid `sizeName`
- cash `tendered` is below the total

Add-ons a product doesn't offer are dropped.

Totals (`computeSaleTotals` in `src/utils/sale.util.ts`, the same math in the mock):

- **VAT-registered store** (`store-settings.vatRegistered`). Menu prices include 12% VAT.
  - Without a discount: `vatableSales = gross / 1.12` and `vat = gross − vatableSales`.
  - With a senior citizen or PWD discount, the sale is VAT-exempt: `vatExemptAmount = gross − gross / 1.12`, `discountAmount = 20% of (gross / 1.12)`, and `total = vatExemptSales = gross / 1.12 × 0.8`.
- **Non-VAT store:** no VAT. The discount is 20% of the gross, and `vatExemptSales = total`.

`ISaleResponse` is the priced sale, with `id`, `receiptNumber` (sequential, 6 digits), `orderNumber` (4 digits), `createdAt`, `cashierId` and `cashierName`. It also has the request's fields and:
- `lines[]`: each line's `name`, `addOns[]` (`id`, `name`, `price`), `unitPrice` and `lineTotal`
- `totals`: `gross`, `vatExemptAmount`, `discountAmount`, `total`, `vatableSales`, `vat` and `vatExemptSales`
- `payment`: `method`, `tendered`, `change` and `reference`
- `status`: `completed` or `voided`
- `voidInfo`: `null`, or `{ reason, voidedAt, voidedByName, approvedByName }` once the sale is voided

### Voiding a sale

| Method | Route | Body | Returns |
|---|---|---|---|
| POST | `sale/void` | `ISaleVoidRequest`: `{ id, reason, approver }` | `ISaleResponse` (now `voided`) |

A void cancels a **whole** sale. The sale is never deleted: it keeps its receipt number, is marked `voided` with `voidInfo`, and leaves every figure in `sale/summary`. Partial refunds aren't supported yet.

- `reason`: required, at least 3 characters, stored up to 200.
- **Owner or manager:** may void any completed sale. `approver` is ignored, and they're recorded as both `voidedByName` and `approvedByName`.
- **Cashier:** may void only **their own sale from today** (Manila day), and only with `approver: { username, password }` belonging to an active owner or manager. The cashier is `voidedByName` and the approver is `approvedByName`.

Return:
- 404 if the sale doesn't exist
- 400 if it's already voided, the reason is missing, or the approver's credentials are wrong or not an owner's or manager's. Use 400, not 401, for bad approver credentials: `http_service.ts` treats a 401 as "session ended".
- 403 if a cashier tries someone else's sale or another day's

A closed day's sales (see "Closing the day") can't be voided: return 400.

### Sales reports

**Owner or Manager only.** Return 403 to a cashier.

A "day" is a **Philippine calendar day**: Asia/Manila, UTC+8. Group by Manila time whatever the server's own time zone is.

| Method | Route | Query | Returns |
|---|---|---|---|
| GET | `sale/summary` | `date` (`YYYY-MM-DD`; today if missing) | `ISaleSummaryResponse` |
| GET | `sale` | `date`, `pageNumber`, `pageSize`, `search` (receipt or order number, cashier, or item name), `paymentMethod`, `sort` (`createdAt_ascend`, `createdAt_descend` (the default), `total_ascend`, `total_descend`) | `IPaginatedResult<ISaleResponse>`, voided sales included |

`ISaleSummaryResponse` (`src/models/sale/sale.response.model.ts`) has these fields. Every figure leaves out voided sales, except the two void fields:
- `date`, `saleCount`, `grossSales` (the sum of `totals.total`, after discounts), `averageSale` and `itemsSold`
- `voidCount` and `voidTotal` (the voided sales' `totals.total`)
- `dineInCount` and `takeOutCount`
- `discountCount` and `discountTotal` (VAT removed plus the 20%, across senior citizen and PWD sales)
- `vatTotal`
- `byHour[24]`: `{ hour, count, total }`
- `byPayment[]`: `{ method, count, total }` for cash, e-wallet and card
- `topProducts[8]`: `{ name, qty, total }`, by quantity sold

**BIR:** the receipt says "This is not an official receipt" (`RECEIPT_DISCLAIMER` in `src/constants/constantReceipt.ts`) until the store's POS is accredited and has a Permit to Use. An official receipt also needs the PTU number, the machine serial number and the accreditation details, so add those fields to store settings at that point.

## Closing the day (Z reading)

**Owner or Manager only**, except `day-close/today`. Return 403 to a cashier.

| Method | Route | Body / query | Returns |
|---|---|---|---|
| GET | `day-close/today` | none. **Anyone signed in.** | `IDayCloseTodayResponse`: `{ date, isClosed, zNumber, closedAt, closedByName }` |
| GET | `day-close/current` | none | `IDayCloseCurrentResponse` |
| POST | `day-close/create` | `IDayCloseRequest` | `IDayCloseResponse` |
| GET | `day-close` | query: `pageNumber`, `pageSize` | `IPaginatedResult<IDayCloseResponse>`, newest day first, then highest Z number first within a day, reopened ones included |
| POST | `day-close/reopen` | `{ id, reason }`. **Owner only.** | `IDayCloseResponse` (now `reopened`) |

Models are in `src/models/day-close/`.

**The day to close.** Days close in date order, so Z numbers and the grand total follow the calendar. The day due is the oldest Manila day before today that has sales and no closing, otherwise today. `day-close/current` returns that `date`, `isToday`, its `figures` so far, `suggestedFloat` (the last closing's `openingFloat`, or 0), and `close`. `close` is the saved Z reading once that day is closed, otherwise `null`.

**`IDayFigures`.** Every figure leaves out voided sales, except the two void fields:
- `firstReceipt`, `lastReceipt`: the day's receipt range, voided sales included
- `saleCount`
- `grossSales`: the sum of `totals.gross`
- `discountCount`, `discountTotal`: VAT removed plus the 20%
- `netSales`: the sum of `totals.total`
- `vatableSales`, `vat`, `vatExemptSales`
- `voidCount`, `voidTotal`
- `cashSales`
- `byPayment[]`: `{ method, count, total }`

**`day-close/create`** takes `{ date, openingFloat, cashCount: [{ denomination, qty }], note }`.
- `date` must be the day that's due. Otherwise return 400 "Close YYYY-MM-DD first."
- Return 400 if that day is already closed, or if `openingFloat` is missing or negative.
- Drop count rows with no quantity.
- The server works out and stores:
  - `zNumber`: sequential, 4 digits
  - `figures`, frozen at closing
  - `expectedCash` = `openingFloat + figures.cashSales`
  - `countedCash`: the sum of `denomination × qty`
  - `overShort` = `countedCash − expectedCash` (positive is over, negative is short)
  - `grandTotalBefore`: the `grandTotalAfter` of the latest closing still `closed`, or 0
  - `grandTotalAfter` = `grandTotalBefore + figures.netSales`. This is BIR's accumulated grand total.
  - `closedAt`, and `closedByName` from the signed-in user

**Reopening a day.** For a day closed by mistake. Every `IDayCloseResponse` has `status` (`closed` or `reopened`) and `reopenInfo` (`null`, or `{ reason, reopenedAt, reopenedByName }`).
- **Owner only.** Return 403 to a manager or cashier.
- **Only the latest closing still in force** can be reopened. That's `latestCloseId` in `day-close/current`. For any other, return 400, so the Z numbers and the grand total stay in order. Also return 400 if `reason` is under 3 characters or the closing is already reopened.
- **The Z reading is kept,** marked `reopened`. A reopened closing no longer counts:
  - The day becomes due again in `day-close/current`.
  - Its sales can be voided again, and if it's today, new sales are allowed again.
  - The next closing takes its `grandTotalBefore` from the latest closing still `closed`, so a reopened day's sales aren't counted twice.
- **Closing the day again** saves a new Z reading with the next `zNumber`.
- **BIR:** an accredited POS can't reopen a Z reading. Remove or lock this route at accreditation.

**`day-close/today`** tells the Register whether today's Z reading is done. When it isn't, `zNumber`, `closedAt` and `closedByName` are `null`.

**After a day is closed:**
- `sale/create` returns 400 while today is closed: "Sales start again tomorrow".
- `sale/void` returns 400 for any sale on a closed day.

## Staff

Everyone who can sign in. The API never returns a password or PIN.

| Method | Route | Body / query | Returns |
|---|---|---|---|
| GET | `staff` | query: `pageNumber`, `pageSize`, `search` (name or username), `status` (`active`, `inactive` or `all`), `roleCode`, `sort` (`fullName_ascend`, `fullName_descend`, `lastSignInAt_ascend`, `lastSignInAt_descend`) | `IPaginatedResult<IStaffResponse>` |
| POST | `staff/create` | `{ fullName, roleCode, pin }` for a cashier, `{ fullName, roleCode, username, password }` for a manager | `IStaffResponse` |
| PUT | `staff/update` | `{ id, fullName, username }` (`username` only for owners and managers) | `IStaffResponse` |
| PUT | `staff/reset-pin` | `{ id, pin }` (cashiers only) | `IStaffResponse` |
| PUT | `staff/reset-password` | `{ id, password }` (owners and managers only) | `IStaffResponse` |
| PUT | `staff/set-active` | `{ id, isActive }` | `IStaffResponse` |

`IStaffResponse` (`src/models/staff/staff.response.model.ts`):

```json
{
  "id": 3,
  "fullName": "Ana Cruz",
  "username": null,
  "roleCode": "P003",
  "roleName": "Cashier",
  "isActive": true,
  "hasPin": true,
  "createdAt": "2026-11-01T00:00:00Z",
  "lastSignInAt": "2026-11-05T00:45:00Z"
}
```

### Who may do what

Return **403** for anything outside these rules, even if the frontend already hides the action:

- **Cashiers** can't use any staff route.
- **Managers** can list everyone, but can only add, edit, reset and turn on or off **cashiers**.
- **The owner** can do everything for managers and cashiers, edit their own details and reset their own password.
- **Nobody** can turn off their own account or the owner's account.
- A new account is always a **Manager** or a **Cashier**. Only the owner can add a manager, and roles can't be changed after creation.

### Field rules

Return **400** with a message for each of these:

- `fullName`: required, up to 60 characters.
- `pin`: 4–6 digits, and no other **active** cashier may have the same PIN, since the PIN alone identifies the cashier at sign-in. Store it hashed.
- `username`: 3–30 characters of letters, numbers, dots, dashes or underscores. Store it in lowercase and keep it unique.
- `password`: at least 8 characters. Store it hashed.
- Turning a cashier back on fails if another active cashier took their PIN meanwhile. Ask for a PIN reset first.

### Side effects

- `reset-pin`, `reset-password` (for someone else) and turning an account off **end that person's sessions**, so the old sign-in stops working at once.
- `auth/login` and `auth/pin` reject accounts that are turned off, and update `lastSignInAt` on success.
- Limit wrong PIN attempts, for example by locking PIN sign-in for a minute after several failures. A 4-digit PIN has only 10,000 possibilities.
