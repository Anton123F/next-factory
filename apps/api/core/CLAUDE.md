## File Index
- `config.py`       — Pydantic settings for DB, Redis, MinIO, JWT, CORS
- `database.py`     — Async SQLAlchemy engine, session factory, get_db dependency
- `dependencies.py` — get_current_user dependency, validates Bearer JWT token
- `exceptions.py`   — Typed AppError hierarchy: conflict, username/email taken
