# Worker Schedule API Documentation

## Overview

The Worker Schedule system manages worker availability and booking time slots. It supports both recurring weekly schedules and specific date overrides for vacations, holidays, or special hours.

## Key Concepts

### Tenant Schedule Constraints (NEW)

Each tenant has default schedule boundaries that all worker schedules must comply with:

- **DefaultScheduleStartTime**: Earliest time workers can start (default: 9:00 AM)
- **DefaultScheduleEndTime**: Latest time workers can end (default: 6:00 PM)
- **AllowedScheduleDays**: Which days schedules are permitted (default: "1,2,3,4,5,6" = Monday-Saturday)

**Worker schedules CANNOT:**
- Start before the tenant's `DefaultScheduleStartTime`
- End after the tenant's `DefaultScheduleEndTime`
- Be created for days not in `AllowedScheduleDays`

These constraints can be updated by TenantAdmins through the tenant management endpoints.

### Schedule Types

1. **Recurring Schedule**: Weekly availability pattern (e.g., "Monday 9 AM - 5 PM every week")
   - `SpecificDate` is `null`
   - Repeats every week on the specified day

2. **Specific Date Override**: One-time availability change (e.g., "Closed on December 25, 2026")
   - `SpecificDate` is set to a specific date
   - Takes precedence over recurring schedules for that date

### Priority Logic

When checking availability for a date:
1. **First**: Check for specific date overrides
2. **Fallback**: Use recurring weekly schedule
3. **If no schedule**: Worker is unavailable

---

## API Endpoints

Base URL: `/api/tenants/{tenantId}/workers/{workerId}/schedules`

### Authentication

All endpoints except **Get Available Time Slots** require authentication:
- **TenantAdmin**: Full access (create, update, delete)
- **Worker**: Read-only access (view schedules)
- **Anonymous**: Can view availability for booking

---

## 1. Create Worker Schedule

Create a single schedule entry for a worker.

**Endpoint**: `POST /api/tenants/{tenantId}/workers/{workerId}/schedules`

**Authorization**: `TenantAdmin`

### Request Body

```json
{
  "dayOfWeek": 1,              // 0=Sunday, 1=Monday, ..., 6=Saturday
  "startTime": "09:00:00",     // HH:mm:ss format
  "endTime": "17:00:00",       // HH:mm:ss format
  "isAvailable": true,          // true = available, false = blocked
  "specificDate": null          // null for recurring, "2026-12-25" for specific date
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `dayOfWeek` | integer | Yes | Day of week (0-6, Sunday=0) |
| `startTime` | TimeSpan | Yes | Start time (00:00:00 to 23:59:59) |
| `endTime` | TimeSpan | Yes | End time (must be > startTime) |
| `isAvailable` | boolean | Yes | Whether worker is available during this time |
| `specificDate` | DateTime? | No | Specific date override (YYYY-MM-DD format) |

### Response (201 Created)

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "workerId": "7fa85f64-5717-4562-b3fc-2c963f66afa6",
  "dayOfWeek": 1,
  "startTime": "09:00:00",
  "endTime": "17:00:00",
  "isAvailable": true,
  "specificDate": null,
  "scheduleType": "Recurring",   // "Recurring" or "Override"
  "created": "2026-02-17T10:30:00Z",
  "lastModified": null
}
```

### Example: Create Recurring Monday Schedule

```bash
curl -X POST "https://api.example.com/api/tenants/{tenantId}/workers/{workerId}/schedules" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "dayOfWeek": 1,
    "startTime": "09:00:00",
    "endTime": "17:00:00",
    "isAvailable": true,
    "specificDate": null
  }'
```

### Example: Create Holiday Override (Closed on Christmas)

```bash
curl -X POST "https://api.example.com/api/tenants/{tenantId}/workers/{workerId}/schedules" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "dayOfWeek": 4,
    "startTime": "00:00:00",
    "endTime": "00:00:00",
    "isAvailable": false,
    "specificDate": "2026-12-25"
  }'
```

### Error Responses

**400 Bad Request** - Validation errors or schedule overlap
```json
{
  "errors": {
    "General": ["Worker already has a recurring schedule for Monday that overlaps with the requested time"]
  }
}
```

**400 Bad Request** - Schedule outside tenant constraints
```json
{
  "errors": {
    "General": ["Schedule start time (08:00:00) cannot be before tenant's allowed start time (09:00:00)"]
  }
}
```

**400 Bad Request** - Day not allowed by tenant
```json
{
  "errors": {
    "General": ["Schedule cannot be created for Sunday. Tenant only allows schedules on: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday"]
  }
}
```

---

## 2. Batch Create Worker Schedules

Create multiple schedule entries at once (useful for setting up a full week).

**Endpoint**: `POST /api/tenants/{tenantId}/workers/{workerId}/schedules/batch`

**Authorization**: `TenantAdmin`

**Limit**: Maximum 50 schedules per batch

### Request Body

```json
{
  "schedules": [
    {
      "dayOfWeek": 1,
      "startTime": "09:00:00",
      "endTime": "17:00:00",
      "isAvailable": true
    },
    {
      "dayOfWeek": 2,
      "startTime": "09:00:00",
      "endTime": "17:00:00",
      "isAvailable": true
    },
    {
      "dayOfWeek": 3,
      "startTime": "09:00:00",
      "endTime": "17:00:00",
      "isAvailable": true
    }
  ]
}
```

### Response (201 Created)

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "workerId": "7fa85f64-5717-4562-b3fc-2c963f66afa6",
    "dayOfWeek": 1,
    "startTime": "09:00:00",
    "endTime": "17:00:00",
    "isAvailable": true,
    "specificDate": null,
    "scheduleType": "Recurring",
    "created": "2026-02-17T10:30:00Z",
    "lastModified": null
  },
  // ... more schedules
]
```

### Example: Setup Full Work Week (Monday-Friday 9-5)

```javascript
// JavaScript/TypeScript Example
const setupWorkWeek = async (tenantId, workerId, token) => {
  const response = await fetch(
    `https://api.example.com/api/tenants/${tenantId}/workers/${workerId}/schedules/batch`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        schedules: [
          { dayOfWeek: 1, startTime: "09:00:00", endTime: "17:00:00", isAvailable: true }, // Monday
          { dayOfWeek: 2, startTime: "09:00:00", endTime: "17:00:00", isAvailable: true }, // Tuesday
          { dayOfWeek: 3, startTime: "09:00:00", endTime: "17:00:00", isAvailable: true }, // Wednesday
          { dayOfWeek: 4, startTime: "09:00:00", endTime: "17:00:00", isAvailable: true }, // Thursday
          { dayOfWeek: 5, startTime: "09:00:00", endTime: "17:00:00", isAvailable: true }  // Friday
        ]
      })
    }
  );
  
  return await response.json();
};
```

---

## 3. Update Worker Schedule

Update an existing schedule entry.

**Endpoint**: `PUT /api/tenants/{tenantId}/workers/{workerId}/schedules/{scheduleId}`

**Authorization**: `TenantAdmin`

### Request Body

```json
{
  "dayOfWeek": 1,
  "startTime": "10:00:00",      // Changed start time
  "endTime": "18:00:00",        // Changed end time
  "isAvailable": true,
  "specificDate": null
}
```

### Response (200 OK)

Same structure as create response with updated values.

---

## 4. Delete Worker Schedule

Remove a schedule entry.

**Endpoint**: `DELETE /api/tenants/{tenantId}/workers/{workerId}/schedules/{scheduleId}`

**Authorization**: `TenantAdmin`

### Response (204 No Content)

No response body on success.

---

## 5. Get Worker Schedule by ID

Retrieve a specific schedule entry.

**Endpoint**: `GET /api/tenants/{tenantId}/workers/{workerId}/schedules/{scheduleId}`

**Authorization**: `TenantAdmin`, `Worker`

### Response (200 OK)

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "workerId": "7fa85f64-5717-4562-b3fc-2c963f66afa6",
  "dayOfWeek": 1,
  "startTime": "09:00:00",
  "endTime": "17:00:00",
  "isAvailable": true,
  "specificDate": null,
  "scheduleType": "Recurring",
  "created": "2026-02-17T10:30:00Z",
  "lastModified": null
}
```

---

## 6. Get All Worker Schedules

Retrieve all schedule entries for a worker with optional filtering.

**Endpoint**: `GET /api/tenants/{tenantId}/workers/{workerId}/schedules`

**Authorization**: `TenantAdmin`, `Worker`

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `date` | DateTime | Filter schedules for a specific date (YYYY-MM-DD) |
| `includeInactive` | boolean | Include unavailable schedules (default: false) |

### Response (200 OK)

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "workerId": "7fa85f64-5717-4562-b3fc-2c963f66afa6",
    "dayOfWeek": 1,
    "startTime": "09:00:00",
    "endTime": "17:00:00",
    "isAvailable": true,
    "specificDate": null,
    "scheduleType": "Recurring",
    "created": "2026-02-17T10:30:00Z",
    "lastModified": null
  },
  // ... more schedules
]
```

### Example: Get All Schedules

```javascript
// Get all active schedules
const schedules = await fetch(
  `https://api.example.com/api/tenants/${tenantId}/workers/${workerId}/schedules`,
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
).then(r => r.json());

// Get schedules for specific date (includes both overrides and recurring)
const schedules = await fetch(
  `https://api.example.com/api/tenants/${tenantId}/workers/${workerId}/schedules?date=2026-12-25`,
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
).then(r => r.json());
```

---

## 7. Get Available Time Slots (Public Endpoint)

**⭐ Most Important Endpoint for Frontend Booking UI**

Calculate available booking time slots for a worker on a specific date.

**Endpoint**: `GET /api/tenants/{tenantId}/workers/{workerId}/availability`

**Authorization**: **None** (Public endpoint for booking calendar)

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | DateTime | **Yes** | Date to check availability (YYYY-MM-DD) |
| `serviceId` | Guid | No | Service ID to use for duration and buffer times |
| `slotDurationMinutes` | integer | No | Duration of each slot in minutes (default: 60, ignored if serviceId provided) |

### Response (200 OK)

```json
[
  {
    "startTime": "2026-02-17T09:00:00Z",
    "endTime": "2026-02-17T10:00:00Z",
    "isAvailable": true
  },
  {
    "startTime": "2026-02-17T10:00:00Z",
    "endTime": "2026-02-17T11:00:00Z",
    "isAvailable": false     // Already booked
  },
  {
    "startTime": "2026-02-17T11:00:00Z",
    "endTime": "2026-02-17T12:00:00Z",
    "isAvailable": true
  }
]
```

### How It Works

1. **Checks worker schedule** for the date (specific override or recurring)
2. **Gets existing reservations** (excludes cancelled ones)
3. **Applies service buffer times** (setup/cleanup time before/after)
4. **Generates time slots** within available periods
5. **Marks slots as unavailable** if they conflict with existing reservations

### Buffer Time Example

If a service has:
- Duration: 60 minutes
- BufferBefore: 10 minutes (setup)
- BufferAfter: 10 minutes (cleanup)

Then each slot requires 80 minutes total. A 9:00 AM slot would block 8:50 AM - 10:10 AM.

### Example: Build Booking Calendar

```javascript
// React/Vue/Angular Example
const BookingCalendar = ({ tenantId, workerId, serviceId }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState([]);

  useEffect(() => {
    const fetchAvailability = async () => {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const url = `https://api.example.com/api/tenants/${tenantId}/workers/${workerId}/availability?date=${dateStr}&serviceId=${serviceId}`;
      
      const response = await fetch(url);
      const slots = await response.json();
      setTimeSlots(slots);
    };

    fetchAvailability();
  }, [selectedDate, workerId, serviceId]);

  return (
    <div>
      <h3>Available Times for {selectedDate.toDateString()}</h3>
      {timeSlots.filter(slot => slot.isAvailable).map(slot => (
        <button key={slot.startTime} onClick={() => bookSlot(slot)}>
          {new Date(slot.startTime).toLocaleTimeString()} - 
          {new Date(slot.endTime).toLocaleTimeString()}
        </button>
      ))}
    </div>
  );
};
```

---

## Business Logic & Validation Rules

### Tenant-Level Constraints (NEW)

Before any worker schedule validation:

1. **Tenant Schedule Boundaries**: All worker schedules must fall within tenant-defined hours
   - Worker `StartTime` >= Tenant `DefaultScheduleStartTime`
   - Worker `EndTime` <= Tenant `DefaultScheduleEndTime`
   
2. **Allowed Days**: Schedules can only be created for days specified in tenant's `AllowedScheduleDays`
   - Default: "1,2,3,4,5,6" (Monday-Saturday)
   - 0=Sunday, 1=Monday, ..., 6=Saturday

3. **Tenant Admins**: Can update these constraints via `PUT /api/tenants/{id}` endpoint

### Schedule Creation Rules

1. **No Overlaps**: Cannot create overlapping schedules for the same day/date
2. **Valid Time Range**: `endTime` must be greater than `startTime`
3. **Time Bounds**: Times must be between 00:00:00 and 23:59:59
4. **Future Dates**: Specific date overrides cannot be in the past
5. **Tenant Ownership**: Worker must belong to the tenant

### Availability Calculation Logic

```
For a given date:
1. Get all schedules for worker where:
   - SpecificDate == date OR
   - (DayOfWeek == date.DayOfWeek AND SpecificDate == null)

2. Priority order:
   - Specific date schedules override recurring schedules
   - If multiple specific date schedules exist, use all
   - If no specific date schedules, use recurring schedules

3. For each schedule period:
   - Generate slots from StartTime to EndTime
   - Apply service duration and buffer times
   - Check for reservation conflicts
   - Mark slot as available/unavailable

4. Return all slots sorted by start time
```
0: View and Update Tenant Schedule Constraints

```javascript
// Get tenant to view current schedule constraints
const tenant = await fetch(`/api/tenants/${tenantId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

console.log(`Allowed Hours: ${tenant.defaultScheduleStartTime} - ${tenant.defaultScheduleEndTime}`);
console.log(`Allowed Days: ${tenant.allowedScheduleDays}`);

// Update tenant schedule constraints (e.g., extend hours to 7 AM - 10 PM)
await fetch(`/api/tenants/${tenantId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    ...tenant,
    defaultScheduleStartTime: "07:00:00",  // 7 AM
    defaultScheduleEndTime: "22:00:00",    // 10 PM
    allowedScheduleDays: "0,1,2,3,4,5,6"   // All week including Sunday
  })
});
```

### Use Case 
### Reservation Conflict Detection

A time slot conflicts with a reservation if:
```
(slotStart >= reservationStart AND slotStart < reservationEnd) OR
(slotEnd > reservationStart AND slotEnd <= reservationEnd) OR
(slotStart <= reservationStart AND slotEnd >= reservationEnd)
```

---

## Common Use Cases & Examples

### Use Case 1: Setup New Worker Schedule

```javascript
// Step 1: Create weekly schedule (Monday-Friday 9-5)
await fetch(`/api/tenants/${tenantId}/workers/${workerId}/schedules/batch`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    schedules: [
      { dayOfWeek: 1, startTime: "09:00:00", endTime: "17:00:00", isAvailable: true },
      { dayOfWeek: 2, startTime: "09:00:00", endTime: "17:00:00", isAvailable: true },
      { dayOfWeek: 3, startTime: "09:00:00", endTime: "17:00:00", isAvailable: true },
      { dayOfWeek: 4, startTime: "09:00:00", endTime: "17:00:00", isAvailable: true },
      { dayOfWeek: 5, startTime: "09:00:00", endTime: "17:00:00", isAvailable: true }
    ]
  })
});
```

### Use Case 2: Block Out Vacation Days

```javascript
// Block December 24-26 for Christmas vacation
const vacationDates = ["2026-12-24", "2026-12-25", "2026-12-26"];

for (const date of vacationDates) {
  await fetch(`/api/tenants/${tenantId}/workers/${workerId}/schedules`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      dayOfWeek: new Date(date).getDay(),
      startTime: "00:00:00",
      endTime: "00:00:00",
      isAvailable: false,
      specificDate: date
    })
  });
}
```

### Use Case 3: Special Hours on a Holiday

```javascript
// Worker available 10 AM - 2 PM on New Year's Day
await fetch(`/api/tenants/${tenantId}/workers/${workerId}/schedules`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    dayOfWeek: 1, // Monday (if Jan 1 is Monday)
    startTime: "10:00:00",
    endTime: "14:00:00",
    isAvailable: true,
    specificDate: "2027-01-01"
  })
});
```

### Use Case 4: Display Worker Schedule in Calendar

```javascript
// Fetch and display full month schedule
const displayMonthSchedule = async (year, month) => {
  const schedules = await fetch(
    `/api/tenants/${tenantId}/workers/${workerId}/schedules`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  ).then(r => r.json());

  // Group by day of week for recurring schedules
  const recurringSchedules = schedules.filter(s => !s.specificDate);
  const overrides = schedules.filter(s => s.specificDate);

  // Render calendar with schedules
  return { recurringSchedules, overrides };
};
```

### Use Case 5: Check if Worker is Available for Specific Time

```javascript
const checkAvailability = async (workerId, startTime, endTime) => {
  const date = new Date(startTime).toISOString().split('T')[0];
  
  const slots = await fetch(
    `/api/tenants/${tenantId}/workers/${workerId}/availability?date=${date}`,
  ).then(r => r.json());

  // Find slot that covers the requested time
  const requestedSlot = slots.find(slot => 
    new Date(slot.startTime) <= new Date(startTime) &&
    new Date(slot.endTime) >= new Date(endTime)
  );

  return requestedSlot?.isAvailable ?? false;
};
```

---

## Data Models Reference

### WorkerScheduleDto

```typescript
interface WorkerScheduleDto {
  id: string;                    // GUID
  workerId: string;              // GUID
  dayOfWeek: number;             // 0-6 (Sunday=0)
  startTime: string;             // HH:mm:ss format
  endTime: string;               // HH:mm:ss format
  isAvailable: boolean;          // true = available, false = blocked
  specificDate: string | null;   // YYYY-MM-DD or null
  scheduleType: string;          // "Recurring" or "Override"
  created: string;               // ISO 8601 DateTime
  lastModified: string | null;   // ISO 8601 DateTime
}
```

### TimeSlotDto

```typescript
interface TimeSlotDto {
  startTime: string;             // ISO 8601 DateTime
  endTime: string;               // ISO 8601 DateTime
  isAvailable: boolean;          // true = available for booking
}
```

### DayOfWeek Enum

```typescript
enum DayOfWeek {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6
}
```

---

## Error Handling

### Common Error Codes

| Status Code | Description | Common Causes |
|-------------|-------------|---------------|
| 400 Bad Request | Validation error | Invalid time range, overlapping schedules, past date |
| 401 Unauthorized | Authentication required | Missing or invalid token |
| 403 Forbidden | Insufficient permissions | Non-admin trying to modify schedules |
| 404 Not Found | Resource not found | Invalid schedule ID, worker ID, or tenant ID |

### Example Error Response

```json
{
  "errors": {
    "EndTime": ["EndTime must be after StartTime."],
    "SpecificDate": ["SpecificDate cannot be in the past."]
  }
}
```

---

## Best Practices

### For Frontend Developers

1. **Cache Availability Data**: Cache time slots for the current day to reduce API calls
2. **Show Loading States**: Availability calculation can take a moment for busy workers
3. **Handle Empty Schedules**: Show "No availability" message gracefully
4. **Timezone Handling**: All times are in UTC, convert to local timezone for display
5. **Debounce Date Selection**: Don't fetch on every calendar date hover
6. **Optimistic Updates**: Update UI immediately, rollback on error
7. **Show Schedule Type**: Indicate if a schedule is recurring or a one-time override

### Performance Tips

- Use batch create for setting up multiple schedules
- Fetch availability only when needed (on date selection, not on page load)
- Filter `includeInactive=false` when you only need available schedules
- Use the `serviceId` parameter to get accurate slot durations

### Security Notes

- The availability endpoint is public by design (for booking calendars)
- All modification endpoints require TenantAdmin role
- Always validate worker belongs to tenant before operations
- Don't expose schedule details that could reveal worker personal info

---

## Integration Checklist

- [ ] Implement schedule creation form (single and batch)
- [ ] Build weekly schedule calendar view
- [ ] Create booking calendar with time slot selection
- [ ] Add vacation/override management UI
- [ ] Handle timezone conversion for display
- [ ] Show loading states during availability fetch
- [ ] Implement error handling and user feedback
- [ ] Add schedule conflict warnings
- [ ] Test with various service buffer time configurations
- [ ] Verify permission-based UI visibility

---

## Support & Questions

For technical support or questions about the Worker Schedule API, please contact the backend team or refer to the main API documentation.

**API Version**: 1.0  
**Last Updated**: February 17, 2026  
**Documentation Status**: Production Ready ✅
