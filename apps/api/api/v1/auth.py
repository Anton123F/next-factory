from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from core.database import get_db
from services.auth import google_login, jwt_login

router = APIRouter()

_RATE_LIMIT_ATTEMPTS = 5
_RATE_LIMIT_WINDOW = 15 * 60


def _redis() -> Redis:
    return Redis.from_url(settings.redis_url, decode_responses=True)


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login/jwt")
async def login_jwt(body: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    redis: Redis = _redis()
    rate_key = f"login_fails:{body.username}"
    try:
        fails = await redis.get(rate_key)
        if fails and int(fails) >= _RATE_LIMIT_ATTEMPTS:
            raise HTTPException(status_code=429, detail="Too many failed attempts", headers={"code": "rate_limited"})

        access_token, refresh_token = await jwt_login(body.username, body.password, db)

        if access_token is None:
            await redis.incr(rate_key)
            await redis.expire(rate_key, _RATE_LIMIT_WINDOW)
            raise HTTPException(status_code=401, detail="Invalid credentials", headers={"code": "invalid_credentials"})

        await redis.delete(rate_key)
    finally:
        await redis.aclose()

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        max_age=settings.refresh_token_expire_days * 86400,
        path="/",
    )
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=False,
        samesite="lax",
        max_age=settings.access_token_expire_minutes * 60,
        path="/",
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login/google")
async def login_google():
    raise HTTPException(status_code=501, detail="Google OAuth not configured", headers={"code": "not_implemented"})


@router.get("/google/callback")
async def google_callback():
    raise HTTPException(status_code=501, detail="Google OAuth not configured", headers={"code": "not_implemented"})
