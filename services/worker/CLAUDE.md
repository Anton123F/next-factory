# Video Processing Pipeline

Upload flow must always be asynchronous:

```
Client → POST /videos/upload → save raw file to MinIO → enqueue Celery job → return 202
                                                                ↓
                                              worker: FFmpeg transcode → HLS chunks
                                                                ↓
                                              store chunks to MinIO → update DB status → notify
```

Videos have a `status` field: `pending → processing → ready | failed`.
The frontend polls or uses WebSocket to reflect status. Never serve a video that is not `ready`.

HLS is mandatory for streaming — no plain MP4 delivery. Output: `playlist.m3u8` + `.ts` segment files.

## Worker Rules

- Tasks orchestrate only — all business logic lives in services, never in the task body
- Never handle HTTP requests from within the worker
- On failure, update video status to `failed` and log the reason before re-raising
