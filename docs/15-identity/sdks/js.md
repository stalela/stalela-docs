---
title: JavaScript / TypeScript SDK
---

The CIS JavaScript SDK is published as `@stalela/cis-sdk-js` in the monorepo
at `packages/cis-sdk-js/`.

## Identity Helpers

### Create & Fetch

```typescript
const identity = await client.identities.create({
  type: 'INDIVIDUAL',
  email: 'user@example.com',
  firstName: 'Lerato',
  lastName: 'Nkosi',
});

const fullRecord = await client.identities.get(identity.identityId);
```

### Search

```typescript
const { items, total } = await client.identities.search({
  query: 'lerato',
  status: ['ACTIVE', 'IN_REVIEW'],
  limit: 25,
});
```

### Status Updates

```typescript
await client.identities.updateStatus(identity.identityId, {
  nextStatus: 'BLOCKED',
  comment: 'Compliance escalation',
  actorId: 'usr_ops_42',
});

const history = await client.identities.getStatusHistory(identity.identityId);
```

### Compliance

```typescript
const refresh = await client.identities.refreshCompliance(identity.identityId);
const decisions = await client.identities.getCompliance(identity.identityId, { limit: 5 });
```

### Metadata

```typescript
await client.identities.updateMetadata(identity.identityId, {
  crmId: 'sf_98231',
  segment: 'vip',
});
```

### Addresses & Phones

```typescript
const address = await client.identities.addresses.create(identity.identityId, {
  type: 'PRIMARY',
  street1: '12 Loop Street',
  city: 'Cape Town',
  postalCode: '8001',
  country: 'ZA',
});

await client.identities.addresses.update(identity.identityId, address.addressId, {
  street2: 'Floor 4'
});

await client.identities.addresses.remove(identity.identityId, address.addressId);

const phone = await client.identities.phones.create(identity.identityId, {
  type: 'MOBILE',
  number: '+27600000000',
});

await client.identities.phones.remove(identity.identityId, phone.phoneId);
```

All address/phone helpers return the updated record with timestamps and respect soft-delete semantics (removals set `deletedAt`).
