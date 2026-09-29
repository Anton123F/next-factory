# Storage Module

All storage access goes through the `StorageService` interface — never call MinIO or S3 directly.

## Interface

```python
# base.py
class StorageService(Protocol):
    async def upload(self, key: str, data: bytes, content_type: str) -> str: ...
    async def download(self, key: str) -> bytes: ...
    async def delete(self, key: str) -> None: ...
    async def get_url(self, key: str) -> str: ...
```

## Files (to be created)

- `base.py` — Protocol interface
- `minio_adapter.py` — active local implementation
- `s3_adapter.py` — add later, same interface, zero app code changes

Active adapter selected by `STORAGE_BACKEND` env var, injected via FastAPI dependency injection.

## Rule

Adding a new storage backend must never require changes outside this folder.
