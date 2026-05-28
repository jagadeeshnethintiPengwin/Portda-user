---
name: portda-api-integration
description: Full API integration completed for portda-mobile buyer app — structure, patterns, and key decisions
metadata:
  type: project
---

Full end-to-end API integration built for portda-mobile (RN 0.85, NativeWind) against Laravel 13 + Sanctum backend.

**Why:** User requested complete API integration with no mock data.

**How to apply:** When modifying any screen, respect the established patterns below.

## Architecture

### Files added
- `src/api/client.ts` — core fetch wrapper with Bearer token injection; throws `ApiError` on non-2xx
- `src/api/types.ts` — all TypeScript interfaces (User, ServiceRequest, Quotation, Order, Payment, etc.)
- `src/api/{auth,catalog,dashboard,vendors,requests,quotations,orders,payments,chat,notifications,profile,reviews}.ts` — service modules
- `src/api/index.ts` — barrel export
- `src/context/AuthContext.tsx` — `AuthProvider` + `useAuth()` hook (token, user, setAuth, clearAuth, updateUser)
- `src/context/RequestDraftContext.tsx` — `RequestDraftProvider` + `useRequestDraft()` for multi-step create-request flow

### Token storage
`AsyncStorage` key: `@portda:token`. Token is loaded on app start in `AuthProvider`.

### Path aliases added
`@api` → `src/api`, `@context` → `src/context` (both babel.config.js and tsconfig.json).

### Error pattern
```ts
try { const data = await someApi.call(); }
catch (err) {
  const msg = err instanceof ApiError ? err.message : 'Something went wrong.';
  Alert.alert('Error', msg);
}
```
401 → call `clearAuth()` then `CommonActions.reset` to Auth stack.

### Auth flow
SplashScreen checks `token` from `useAuth()` after `isLoading` is false. If token exists → replace to `Main`, else → `LocationPermission`.

### Request creation flow
Multi-step: CreateRequest → SelectServiceType → SelectSubservice → AttachDocs → ScheduleWindow → PortBerth → RequestPreview → RequestSuccess.
Each step writes to `RequestDraftContext`. RequestPreviewScreen submits to `POST /requests` and resets draft on success.

### Chat
ChatListScreen polls `GET /chat/rooms`. ChatThreadScreen polls messages every 8s. `threadId` nav param is used as the API room ID.

### Base URL
`http://127.0.0.1:8000/api` (dev). Change `BASE_URL` in `src/api/client.ts` for prod.
