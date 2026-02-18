# Services API — Frontend Integration Guide ⚙️

This document describes the Service endpoints, request/response shapes, validation, plan-limit logic, and frontend integration notes. Use these examples directly in the FE — IDs are passed in the request body (not in the URL).

---

## Quick summary
- Base resource: `Service` (business service offered by a tenant).
- ID-in-body pattern: **all endpoints that require an ID accept it in the request body** (no route `/{id}` parameters).
- Auth: create/update/delete → `TenantAdmin` role required. Read endpoints → public/AllowAnonymous.

---

## Endpoints (overview)

| Method | Route | Auth | Body (example) | Response | Notes |
|---|---:|---|---|---|---|
| POST | `/services` | TenantAdmin | `CreateServiceRequest` | `ServiceDto` (201) | Creates service; enforces tenant plan limits |
| PUT | `/services` | TenantAdmin | `UpdateServiceRequest` (must include `id`) | `ServiceDto` (200) | Partial update; id in body |
| DELETE | `/services` | TenantAdmin | `{ serviceId: "guid" }` | `bool` (200) | Fails if reservations exist |
| GET | `/services` | Public | Query params (pagination) | `PagedResult<ServiceDto>` (200) | Standard pagination/search/sort |
| POST | `/services/get-by-id` | Public | `{ id: "guid" }` | `ServiceDto` (200) | ID in body (note POST) |
| POST | `/services/by-tenant` | Public | `{ tenantId: "guid" }` | `ServicesByTenantResponse` (200) | Returns `CurrentServices`, `MaxServices`, `PlanType` |

---

## DTOs — request / response shapes (important fields)

CreateServiceRequest (required fields):
```
{
  "tenantId": "guid",
  "name": "string",
  "durationMinutes": 30,
  "price": 25.00,
  // optional: description, imageUrl, category, buffer times, requiresApproval, advance/min hours
}
```

UpdateServiceRequest (must include `id`):
```
{
  "id": "guid",        // required
  "name": "string?",
  "price": 12.5,
  // any other updatable props (fields are optional)
}
```

ServiceDto (returned): key fields — `id`, `tenantId`, `name`, `durationMinutes`, `price`, `created`, `lastModified`.

ServicesByTenantResponse:
```
{
  "services": [ /* ServiceDto[] */ ],
  "planType": "Free|Basic|Professional|Enterprise",
  "maxServices": 20,
  "currentServices": 3
}
```

---

## Important backend logic (FE must know)
- Plan limits: creating a service checks `PlanLimits.CanAddServices(planType, currentServices)`. If limit reached, API returns 400 with message containing `Service limit reached` → show upgrade CTA.
- On successful create: `TenantPlan.CurrentServices++`.
- On delete: `TenantPlan.CurrentServices--` (unless blocked by existing reservations).
- Delete is blocked when there are reservations for that service — API returns 400 with message `Cannot delete service with existing reservations.`

---

## Status codes & error patterns
- 201 Created — service created.
- 200 OK — successful read/update/delete (delete returns boolean true).
- 400 Bad Request — validation, plan-limit, delete-blocked (message explains reason).
- 404 Not Found — (get by id) if service doesn't exist.
- 401 / 403 — unauthorized/forbidden when role/token missing or insufficient.

FE behavior:
- Detect 400 text for plan limit and show specific UI (upgrade prompt).
- For delete: show confirmation modal and display API message on failure.

---

## Frontend examples

Headers: `Authorization: Bearer <token>` and `Content-Type: application/json` for protected endpoints.

Create (example):
```bash
curl -X POST /services \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "tenantId":"11111111-1111-1111-1111-111111111111",
    "name":"Haircut",
    "description":"Men's haircut",
    "durationMinutes":30,
    "price":25.00
  }'
```

Fetch (example - TypeScript / fetch):
```ts
async function createService(body) {
  const res = await fetch('/services', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw await res.json();
  return res.json(); // ServiceDto
}
```

Update (example):
```bash
PUT /services
{
  "id":"<service-guid>",
  "price": 30.00,
  "name": "Updated name"
}
```

Delete (example):
```bash
DELETE /services
{ "serviceId": "<service-guid>" }
```

Get by id (note: POST body):
```bash
POST /services/get-by-id
{ "id": "<service-guid>" }
```

Get services by tenant (recommended before showing "Add service" button):
```bash
POST /services/by-tenant
{ "tenantId": "<tenant-guid>" }
// Response includes currentServices and maxServices
```

Get all (paginated):
```
GET /services?pageNumber=1&pageSize=10&searchTerm=hair&sortBy=Name&sortDescending=false
```

---

## FE integration guidance / best practices 💡
- Always call `POST /services/by-tenant` on tenant screen load to get `currentServices` / `maxServices`. Disable or hide Add button when limit reached.
- For create: optimistically append UI item, revert if API returns 400 (show server error). If plan-limit 400 -> show upgrade modal instead of reverting silently.
- For update: perform in-place update; merge server response to ensure lastModified is updated.
- For delete: prompt user, call API, remove item from UI only on success; if API returns 400 with `existing reservations`, display the message and suggest reassigning reservations first.
- Error text parsing: backend currently sends human-readable messages. Match on message fragments like `Service limit reached` or `Cannot delete service with existing reservations` for specific UI flows.
- Authorization: send JWT in `Authorization` header. The FE role `TenantAdmin` is required for mutating operations.

---

## Mapping to backend commands/queries (for FE devs working with BE authors)
- CreateServiceRequest → `CreateServiceCommand` / `CreateServiceCommandHandler`
- UpdateServiceRequest (contains `id`) → `UpdateServiceCommand`
- Delete payload `{ serviceId }` → `DeleteServiceCommand`
- GetAll → `GetAllServicesQuery`
- Get by id (body `id`) → `GetServiceByIdQuery`
- Get by tenant (body `tenantId`) → `GetServicesByTenantQuery`

---

## Example response (ServiceDto)
```json
{
  "id":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  "tenantId":"11111111-1111-1111-1111-111111111111",
  "name":"Haircut",
  "description":"Men's haircut",
  "durationMinutes":30,
  "price":25.00,
  "created":"2026-02-16T12:34:56Z",
  "lastModified":null
}
```

---

If you want, I can: 
- Add TypeScript client wrappers for every endpoint ✅
- Add example UI flows (Add service modal + error handling) ✅

Tell me which of these you'd like next.