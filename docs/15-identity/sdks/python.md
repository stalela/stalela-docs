---
title: Python SDK
---

The CIS Python SDK mirrors the JavaScript SDK's interface with Pythonic naming conventions.

## Identity Helpers

### Search

```python
results = client.identities.search(
    query="lerato",
    status=["ACTIVE", "IN_REVIEW"],
    limit=25,
)
print(results.total, results.items[0].display_name)
```

### Status & History

```python
client.identities.update_status(
    identity_id=identity.identity_id,
    next_status="BLOCKED",
    comment="Manual review",
    actor_id="usr_ops_42",
)

history = client.identities.get_status_history(identity_id=identity.identity_id)
```

### Compliance

```python
refresh = client.identities.refresh_compliance(identity_id=identity.identity_id)
decisions = client.identities.get_compliance(identity_id=identity.identity_id, limit=5)
```

### Metadata

```python
client.identities.update_metadata(
    identity_id=identity.identity_id,
    metadata={"crmId": "sf_98231", "segment": "vip"},
)
```

### Addresses & Phones

```python
address = client.identities.addresses.create(
    identity_id=identity.identity_id,
    payload={
        "type": "PRIMARY",
        "street1": "12 Loop Street",
        "city": "Cape Town",
        "postalCode": "8001",
        "country": "ZA",
    },
)

client.identities.addresses.remove(
    identity_id=identity.identity_id, address_id=address.address_id
)

phone = client.identities.phones.create(
    identity_id=identity.identity_id,
    payload={"type": "MOBILE", "number": "+27600000000"},
)

client.identities.phones.remove(
    identity_id=identity.identity_id, phone_id=phone.phone_id
)
```

All helpers return rich dataclasses mirroring the REST responses (timestamps, metadata, soft-delete flags).
