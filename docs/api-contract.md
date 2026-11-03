# amgc-pos-api contract

These are the routes the frontend calls today. Build `amgc-pos-api` (ASP.NET Core + PostgreSQL, structured with the `senior-backend-dcwd-developer` skill) to answer them.

Until then, `mock/mock-api.ts` answers them during `yarn dev`.

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
    "roles": [{ "access": "Owner" }],
    "accessLevels": [{ "code": "P001", "value": "Owner" }]
  }
}
```

### Access-level codes

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
