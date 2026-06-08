# PORTDA Buyer — Key Workflows

Step‑by‑step workflows for the three core areas, with the screens, state, and
backend calls (`api-user.md`, base `https://portda.in/api`, Bearer token) each
uses. Companion to [FUNCTIONALITY.md](./FUNCTIONALITY.md).

Legend: **API** = backend call · **MMKV** = local persisted store (`src/storage`) ·
**ctx** = `AuthContext` user.

---

## 1. Home Dashboard — port locations from the API

**Screen:** `src/screens/home/HomeDashboardScreen.tsx` → `LocationPill`
**APIs:** `GET /catalog/ports`, `GET /dashboard`, `GET /catalog/hero-slides`, `PUT /profile`

### 1.1 Location pill — choose your operating port

```
Home header
 └─ [📍 LocationPill]
      • no port chosen → shows  "Select your port location"
      • port chosen    → shows  "YOUR PORT LOCATION / <Port name>"   (restored from MMKV)
      tap ▼
 └─ Bottom sheet "Select port"
      • Search box  → filters by name / code / region
      • List (A→Z)  → ⚓ icon · Name · "code · region · country" · ✓ on current
      tap a port
 └─ • update pill + MMKV (selected_port = {id,name})
    • best-effort  PUT /profile { default_port_id }  → updateUser(ctx)
```

**Flow:**
1. On mount the pill reads the **MMKV** `selected_port` for instant display, then fetches the full list:
   - `catalogApi.ports()` → **API** `GET /catalog/ports` → `[{ id, name, code, region, country }]`.
2. The picker modal lists those ports — searchable (name/code/region) and sorted alphabetically; the current port shows a check.
3. On select:
   - `setSelectedPort({ id, name })` → **MMKV** (survives restarts, instant on next launch).
   - `profileApi.update({ default_port_id })` → **API** `PUT /profile` (best‑effort) → `updateUser` so RFQs prefill this port.
4. **Source‑of‑truth order on load:** MMKV first (your last local choice), then the profile's `default_port_id` if MMKV is empty.

**Edge cases handled:** ports response not an array → `[]`; ports return `region` (not `city`) → displayed as `region`; `PUT /profile` failure → selection still kept locally (MMKV); name shows instantly from MMKV before the API responds.

### 1.2 Rest of the dashboard
- `dashboardApi.get()` → **API** `GET /dashboard` → stat strip, active‑order banner, recent items.
- Notification bell **badge** reflects `dashboard.unread_notifications` (dot only when > 0).
- Hero carousel: `catalogApi.heroSlides()` → **API** `GET /catalog/hero-slides` → full‑bleed paged slides.

---

## 2. Edit Profile — change details & profile picture

**Screen:** `src/screens/profile/EditProfileScreen.tsx`
**APIs:** `PUT /profile`, `POST /profile/avatar`, `GET /catalog/ports`, `GET /auth/me`

### 2.1 Edit profile details

```
EditProfile (prefilled from ctx user + buyer_profile)
 ├─ Full name, Company, IMO, GST
 ├─ Billing address, City, State, Country, Postal
 ├─ Default port  → searchable port picker (GET /catalog/ports)
 ├─ Email / Phone → "Change" → ChangeContact (OTP-verified, separate flow)
 └─ Save (top-right)
      • builds payload of ONLY non-empty fields (never blanks a field)
      • PUT /profile  → updateUser(ctx) → goBack()
```

**Flow:**
1. Fields are seeded from `ctx user` + `user.buyer_profile`.
2. **Save** assembles a payload containing only non‑empty values and calls `profileApi.update(payload)` → **API** `PUT /profile` (User fields: `name`; buyer‑profile fields: `company_name, imo_number, gst_number, billing_address, city, state, country, postal_code, default_port_id`). Result → `updateUser(ctx)` → navigate back.
3. **Default port** uses the same searchable modal as Home (`GET /catalog/ports`).
4. **Email/Phone** are verified channels — edited via the **ChangeContact** OTP flow (`requestOtp(purpose:'verify')` → `verifyOtp` → `PUT /profile`), not inline, so verification isn't silently cleared.

### 2.2 Change profile picture

```
[avatar ▣ + 📷 badge]  ("Change photo")
   tap → bottom sheet
        ├─ 📷 Take Photo      → launchCamera (maxW/H 800, q 0.7)
        └─ 🖼 Choose from Gallery → launchImageLibrary (maxW/H 800, q 0.7)
   pick → optimistic local preview + "Uploading…"
        → POST /profile/avatar (multipart `avatar`)  → { avatar, url }
        → merge url into ctx user.avatar ; keep showing the LOCAL image
   (on any load) Image onError → fall back to initials (never blank)
```

**Flow:**
1. Tapping the avatar opens a Camera / Gallery sheet. The launch happens **after** the sheet fully dismisses (iOS `onDismiss`, Android short defer) so the picker reliably opens.
2. The image is **downscaled to ≤ 800px @ 0.7 quality** so it stays under the server's **2 MB** limit (with a hard guard + clear message if still larger).
3. `profileApi.uploadAvatar(uri,name,type)` → **API** `POST /profile/avatar` (multipart, field `avatar`) → returns `{ avatar, url }`.
4. Response is **merged** into the user (`updateUser({...user, avatar})`) — never replaces the user object (which would wipe name/profile). The **local picked image stays on screen** (guaranteed to render); the canonical URL is saved for later loads.
5. **Never blank:** the avatar `Image` has an `onError` → falls back to initials, on both Edit Profile and the Profile header. Avatar URLs are normalized to absolute by `avatarUrl()`.

**Edge cases handled:** picker‑present race (deferred launch); oversized image (downscale + guard); upload failure (rollback preview + surface the server's validation message); unreachable/auth‑protected avatar URL (initials fallback).

---

## 3. Chats — 1‑to‑1 messaging (WhatsApp‑style)

**Screens:** `src/screens/chat/ChatListScreen.tsx`, `ChatThreadScreen.tsx`
**APIs:** `GET /chat/rooms`, `POST /chat/rooms`, `GET /chat/rooms/{room}`, `POST /chat/rooms/{room}/messages`, `POST /chat/rooms/{room}/read`, `GET /chat/unread-count`

### 3.1 Entering a chat

```
A) Messages tab (ChatList)        B) Vendor Profile → "Chat"
   GET /chat/rooms                    POST /chat/rooms {counterparty_user_id}
   client-side search                 → room.id
   tap a room ─────────────┐          ───────────────┐
                           ▼                          ▼
                     ChatThread(threadId = room.id, vendorName)
```

- **ChatList:** `chatApi.rooms()` → **API** `GET /chat/rooms`; searched client‑side by name + last message; opens a thread on tap.
- **Vendor Profile "Chat":** `chatApi.openRoom({ counterparty_user_id })` → **API** `POST /chat/rooms` (returns/creates the 1:1 room) → navigate to `ChatThread`. Button shows "Opening…" and surfaces errors.

### 3.2 Inside a thread (ChatThread)

```
load:  GET /chat/rooms/{room}  → normalize (array OR {messages, counterparty})
       → render history (ascending) ; POST /chat/rooms/{room}/read
poll every 5s: GET /chat/rooms/{room}
       → append only NEW incoming (id > lastId && sender_id != me) ; mark read

Composer (WhatsApp-style):
   [ + ]  [ Message <vendor>…            ]  [➤ / 📷]
    │                                         │
    │ attachment sheet                        └─ send (text) / camera (empty)
    ├─ 📷 Camera   → image  → POST …/messages (type=image)
    ├─ 🖼 Photos   → image  → POST …/messages (type=image)
    └─ 📄 Document → file   → POST …/messages (type=file)
```

**Send flow (text / image / document):**
1. An **optimistic** bubble is appended immediately (`_pending`, temp id `-Date.now()`).
2. `chatApi.sendText` or `chatApi.sendFile(room, 'image'|'file', attachment, body?)` → **API** `POST /chat/rooms/{room}/messages` (multipart `type`, `body`, `attachment`).
3. On success the temp id is **reconciled** to the server message id; on failure the optimistic bubble is removed with an error alert.

**Rendering:** text bubbles; image bubbles (inline); **document cards** (file icon + name, tap → `Linking.openURL`). Sent vs received aligned right/left, with `sending → sent → read` status.

**Read & badge:** `POST /chat/rooms/{room}/read` on open and when new messages arrive; the Chat tab badge can use `chatApi.unreadCount()` → **API** `GET /chat/unread-count` → `{ count }`.

**Edge cases handled:** response shape (bare array vs `{messages,counterparty}`) normalized; own messages never duplicated by polling (`sender_id !== me`); attachment picker present‑race deferred; Android `adjustResize` / iOS `KeyboardAvoidingView` for the composer; document filename derived from body or URL.

> Implementation note: the thread is a **custom** UI (FlatList + composer), not `react-native-gifted-chat` (its composer didn't render the input on RN 0.85). Image/document pickers are already native in the build (shared with Attach Docs / avatar).

---

## Quick API → workflow map

| Workflow | Endpoints |
|---|---|
| Home port picker | `GET /catalog/ports` · `PUT /profile` (+ MMKV `selected_port`) |
| Home dashboard | `GET /dashboard` · `GET /catalog/hero-slides` |
| Edit details | `PUT /profile` · `GET /catalog/ports` |
| Edit avatar | `POST /profile/avatar` |
| Change email/phone | `POST /auth/otp/request|verify` (verify) · `PUT /profile` |
| Chat list / open | `GET /chat/rooms` · `POST /chat/rooms` |
| Chat thread | `GET /chat/rooms/{room}` · `POST …/messages` · `POST …/read` · `GET /chat/unread-count` |

_Verified against the live API + `tsc --noEmit` clean._
