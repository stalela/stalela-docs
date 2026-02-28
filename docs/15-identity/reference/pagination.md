---
title: Pagination
---

CIS uses cursor-based pagination for list endpoints.

---

## Request Parameters

| Parameter | Description |
|-----------|-------------|
| `cursor` | Opaque string referencing next page. |
| `limit` | Max results per page (default 25, max 200). |

## Response Format

```json
{
  "data": [ "..." ],
  "nextCursor": "eyJvZmZzZXQiOjI1fQ=="
}
```

- If `nextCursor` is `null`, no further pages exist.
- Pass the cursor back as the `cursor` query parameter to fetch
  subsequent pages.

## Sorting

- Default order: descending `createdAt`.
- Some endpoints allow `sort=createdAt` or `sort=updatedAt` query
  parameters.

## Consistency

- Pagination operates on snapshot isolation to avoid duplicates.
- Changing filters between requests invalidates cursors (returns 400).
