from fastapi import APIRouter

from api.v1.auth import router as auth_router

router = APIRouter()

router.include_router(auth_router, prefix="/auth", tags=["auth"])


@router.get("/ping")
async def ping():
    return {"message": "pong"}


@router.get("/hello")
async def hello():
    return {"message": "Hello, World!"}
