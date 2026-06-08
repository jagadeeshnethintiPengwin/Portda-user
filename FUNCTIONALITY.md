# PORTDA — Buyer App End‑to‑End Functionality

The **PORTDA Buyer (Client) app** (`portda-mobile/`) — a React Native app for ship
owners, operators and agents to discover port‑service vendors, post RFQs, review
quotes, place orders, pay, and chat. This document maps every user‑facing flow to
the screens that implement it and the backend endpoints it calls.

- **Backend contract:** `api-user.md` (Laravel 13 · Sanctum token auth · JSON REST)
- **Base URL:** `https://portda.in/api`
- **Counterpart:** the Vendor app lives in `portda_vendor/` (`api-vendor.md`).

---

## 1. Tech stack & architecture

| Concern | Choice |
|---|---|
| Framework | React Native 0.85.3 (New Architecture / Fabric enabled) |
| Language | TypeScript (strict), `tsc --noEmit` clean |
| Styling | NativeWind + a hand‑rolled UI kit in `src/ui/` |
| Navigation | `@react-navigation/native` (native stack + bottom tabs) |
| Auth token | AsyncStorage, key `@portda:token` |
| Local prefs | MMKV v4 (`src/storage/`) — selected port, notification toggles |
| Media picker | `react-native-image-picker` (avatar, RFQ docs) |
| Network | `fetch` wrapper in `src/api/client.ts` (envelope unwrap + logging) |

### API layer (`src/api/`)
One typed module per domain; all return the unwrapped `data` field and throw
`ApiError(status, message, errors)` on failure.

`auth · catalog · vendors · dashboard · requests · quotations · orders · payments ·
reviews · chat · notifications · profile · devices` (+ shared `types.ts`, `client.ts`).

### Cross‑cutting
- **AuthContext** (`src/context/AuthContext.tsx`) — `{user, token, setAuth, clearAuth, updateUser}`; bootstraps from the stored token via `GET /auth/me`.
- **RequestDraftContext** (`src/context/RequestDraftContext.tsx`) — holds the multi‑step RFQ draft.
- **Local storage** (`src/storage/index.ts`) — `getSelectedPort/setSelectedPort`, `getBoolPref/setBoolPref` (MMKV instance id `portda`).

---

## 2. End‑to‑end flows

### 2.1 Onboarding & Authentication  *(public)*
Screens: `onboarding/*`, `auth/*`

| Flow | Screens | Endpoints |
|---|---|---|
| Splash → pitch → get started | `SplashScreen`, `WelcomePitchScreen`, `NotificationPermissionScreen`, `GetStartedScreen` | — |
| **OTP‑first registration** | `RegisterScreen` → `OtpScreen` | `POST /auth/otp/request` (`purpose:register`) → `POST /auth/register` (`identifier`,`otp_code`,`role:buyer`) |
| Passwordless login (mobile / email) | `LoginScreen` → `OtpScreen` | `POST /auth/otp/request` → `POST /auth/otp/verify` (`purpose:login`) |
| Email + password login | `EmailLoginScreen` | `POST /auth/login` |
| Forgot / reset password | `ForgotScreen`, `ResetPasswordScreen` | OTP request (mock reset — no backend route) |
| Session expiry | `SessionExpiredScreen` | re‑auth |

- **Registration is OTP‑first**: the form collects the work email/mobile, requests a code, and the OTP screen finalizes the account (`register`) and **auto‑logs in**. Phone/company/GSTIN are saved best‑effort to the profile after registration.
- The **Mobile/Email** login tabs use distinct `key`s so switching tabs never reuses the wrong input.

### 2.2 Home dashboard
Screens: `home/HomeDashboardScreen`

| Feature | Detail | Endpoint |
|---|---|---|
| Aggregate stats | open requests, awaiting quotes, spend | `GET /dashboard` |
| Active‑order banner | shown when an order is `in_progress`/`confirmed` | from dashboard |
| **Hero slides carousel** | full‑bleed, `pagingEnabled`, equal‑height slides, page dots | `GET /catalog/hero-slides` |
| **Port location picker** | tap the location pill → searchable bottom‑sheet of ports; persists to **MMKV** + best‑effort `default_port_id` | `GET /catalog/ports`, `PUT /profile` |
| Service tiles / Top vendors | quick entry into RFQ / vendor list | `GET /catalog/categories` |

- The location pill shows **“Select your port location”** when none is chosen, and the chosen port’s name once selected (restored instantly from MMKV on launch).

### 2.3 Search & vendor directory  *(public)*
Screens: `home/SearchScreen`, `home/CategoriesScreen`, `home/SubcategoryScreen`, `home/FeaturedVendorsScreen`, `quotation/VendorProfileScreen`

| Feature | Detail | Endpoint |
|---|---|---|
| Global search | live vendor search | `GET /vendors?q=` |
| Vendors tab | **live debounced search bar** + category filter chips, race‑safe | `GET /vendors` (filters `q`,`category_id`,`subcategory_id`,`min_rating`,`premium_only`) |
| Categories / subcategories | drill‑down → filtered vendors | `GET /catalog/categories`, `/catalog/categories/{id}` |
| Vendor profile | details + reviews; **Chat** opens a room | `GET /vendors/{id}`, `GET /reviews?vendor_id=`, `POST /chat/rooms` |

### 2.4 Service requests (RFQ)
Screens: `request/*`, `quotation/MyRequestsScreen`, `quotation/RequestDetailsScreen`

**Wizard:** `CreateRequestScreen` → `SelectServiceType` → `SelectSubservice` → `AttachDocs` → `ScheduleWindow` → `PortBerth` → `RequestPreview` → `RequestSuccess`.

| Feature | Detail | Endpoint |
|---|---|---|
| Create RFQ | API‑driven category/subcategory; date‑aware calendar; `currency:INR` | `POST /requests` |
| **Emergency Request** | quick CTA on step 1 → flags `urgency:critical`; red **⚡ EMERGENCY** badge on preview | `POST /requests` |
| Attach docs/photos | camera / gallery / PDF | local (multipart on submit) |
| My Requests | **search bar + status filter chips + pull‑to‑refresh** | `GET /requests` (filters `status`,`q`) |
| Request detail | status, quotes received | `GET /requests/{id}` |
| Edit / cancel / delete | while `open` | `PUT /requests/{id}`, `POST /requests/{id}/cancel`, `DELETE /requests/{id}` |

- `urgency` ∈ `standard | urgent | critical` (aligned to the API contract).

### 2.5 Quotations
Screens: `quotation/QuotationsListScreen`, `QuotationDetailsScreen`, `ApproveQuotationScreen`, `RejectQuotationScreen`, `CounterOfferScreen`

| Action | Detail | Endpoint |
|---|---|---|
| Review quotes | list per request + detail with revisions | `GET /quotations`, `/quotations/{id}` |
| **Accept** | auto‑rejects others, creates an **Order** → routes to Order detail | `POST /quotations/{id}/accept` |
| Reject | | `POST /quotations/{id}/reject` |
| Counter‑offer | propose a revised amount | `POST /quotations/{id}/revisions` |

### 2.6 Orders
Screens: `order/MyOrdersScreen`, `OrderDetailsScreen`, `OrderStatusScreen`, `InProgressScreen`, `CompletedOrderScreen`, `CancelOrderScreen`, `RescheduleScreen`

| Feature | Detail | Endpoint |
|---|---|---|
| My Orders | **client‑side search** (order #, vendor, vessel) | `GET /orders` (filters `status`,`payment_status`,`date_*`) |
| Order detail | payments, invoice, events, review; **Pay** gated on `payment_status=pending` | `GET /orders/{id}` |
| Cancel | while `placed`/`confirmed` | `POST /orders/{id}/cancel` |
| Reschedule | date‑aware picker (IST) | `POST /orders/{id}/reschedule` |

> Starting/completing an order is the **vendor’s** action.

### 2.7 Payments
Screens: `payment/*`

| Step | Detail | Endpoint |
|---|---|---|
| Methods / summary | upi · card · netbanking · razorpay | — |
| Initiate → confirm | dummy gateway; funds escrow | `POST /payments/initiate`, `POST /payments/{id}/confirm` |
| Offline NEFT/RTGS | UTR + proof upload (real order amount) | `POST /payments/offline` |
| History | | `GET /payments` |

### 2.8 Reviews
Screens: `review/RateVendorScreen`, `WriteReviewScreen`, `ReviewsListScreen`

- Review a **completed** order → `POST /reviews`; public lists → `GET /reviews`, `GET /reviews/{id}`.

### 2.9 Chat
Screens: `chat/ChatListScreen`, `chat/ChatThreadScreen`

| Feature | Detail | Endpoint |
|---|---|---|
| Conversations | **client‑side search** (name + last message) | `GET /chat/rooms` |
| Open/get a room | | `POST /chat/rooms` |
| Thread + send | text (image/file rendered) | `GET /chat/rooms/{room}`, `POST /chat/rooms/{room}/messages`, `POST .../read` |

### 2.10 Notifications
Screens: `notification/NotificationsScreen`, `NotificationDetailsScreen`, `PushPreviewScreen`

- List, unread badge, mark one/all read, delete, deep‑link routing.
- `GET /notifications`, `/notifications/unread-count`, `POST /notifications/read-all`, `POST /notifications/{id}/read`, `DELETE /notifications/{id}`.

### 2.11 Profile, KYC & avatar
Screens: `profile/ProfileScreen`, `EditProfileScreen`, `ChangeContactScreen`, `ChangePasswordScreen`

| Feature | Detail | Endpoint |
|---|---|---|
| Profile header | shows **uploaded avatar** (falls back to initials) | `GET /auth/me`, `GET /profile` |
| Edit profile | full `PUT /profile`; only non‑empty fields sent | `PUT /profile` |
| **Avatar upload** | tap → Camera/Gallery sheet → upload; response `{avatar,url}` merged into user | `POST /profile/avatar` |
| Default port | searchable picker | `GET /catalog/ports`, `PUT /profile` |
| Change email/phone | OTP‑verified (`purpose:verify`) | `POST /auth/otp/request`+`verify`, `PUT /profile` |
| Change password | | `POST /auth/password` |
| KYC | upload / status / delete pending | `GET /kyc`, `/kyc/status`, `POST /kyc`, `DELETE /kyc/{id}` |

- Avatar URLs are normalized to absolute via `avatarUrl()` (`src/screens/profile/shared.tsx`) so both the upload `url` and a server storage path render.

### 2.12 Settings
Screens: `settings/SettingsScreen` (+ `Terms`, `Privacy`, `About`, `LogoutConfirm`, `DeleteAccount`)

- Opened from the **gear icon** on the Profile screen.
- **Notification preference toggles** (Push / Email / Order & quote alerts) — persisted in **MMKV** (`pref.push`, `pref.email`, `pref.alerts`). *Local only — the API exposes no notification‑preferences endpoint yet.*
- Links: Edit profile, Change password, Help & FAQ, Contact support, Terms, Privacy, About (v2.4.0), Log out, Delete account.

---

## 3. Endpoint coverage (vs `api-user.md`)

| § | Area | Status |
|---|---|---|
| 2 | Auth (otp/register/login/verify/me/logout/password) | ✅ |
| 3 | Catalog (ports, categories, hero‑slides) + vendor directory + reviews | ✅ |
| 4 | Profile (get/update/avatar) | ✅ |
| 5 | KYC (list/status/upload/delete) | ✅ |
| 6 | Dashboard | ✅ |
| 7 | Service requests (CRUD + cancel) | ✅ |
| 8 | Quotations (list/get/accept/reject/revisions) | ✅ |
| 9 | Orders (list/get/cancel/reschedule) | ✅ |
| 10 | Payments (list/get/initiate/confirm/offline) | ✅ |
| 11 | Reviews (create) | ✅ |
| 12 | Chat (rooms/messages/read) | ✅ |
| 13 | Notifications | ✅ |

`devices` (push‑token register) is also wired though not in `api-user.md`.

---

## 4. Local storage keys

| Store | Key | Purpose |
|---|---|---|
| AsyncStorage | `@portda:token` | Sanctum bearer token |
| MMKV (`portda`) | `selected_port` | `{id,name}` of the chosen home port |
| MMKV (`portda`) | `pref.push` / `pref.email` / `pref.alerts` | notification toggles |

---

## 5. Build & run notes

- **Native modules** (`react-native-mmkv` + `react-native-nitro-modules`, `react-native-image-picker`) require a **full native rebuild** — a Metro reload is not enough. Run `yarn ios` / `yarn android` (iOS pods already installed).
- **Android Studio “Cannot run program node”:** GUI apps get a minimal PATH that excludes Homebrew. Fixes applied in‑repo (`REACT_NATIVE_NODE_MODULES_DIR`, `nodeBinary` property) reduce node calls, but reanimated/worklets call `node` unconditionally — so `node` must be on the IDE’s PATH. Permanent fix: `sudo launchctl config user path "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"` then reboot; and run `./gradlew --stop` after any PATH change to clear stale daemons.
- iOS camera/photo permission strings and the Android `CAMERA` permission are configured.

---

## 6. Known gaps (missing backend endpoints, not integration bugs)

- **Forgot/Reset password & Delete account** are mock — `api-user.md` documents no such routes.
- **Notification preferences** are stored locally (MMKV) — no server endpoint to sync.
- **Vendor bank coordinates** on the NEFT screen are placeholders (no buyer‑facing endpoint exposes them).

---

_Verified: `tsc --noEmit` clean. Envelope/auth per `src/api/client.ts`._
