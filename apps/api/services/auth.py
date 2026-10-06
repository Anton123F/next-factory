from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from models.user import User
from services.token import create_access_token, create_refresh_token

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def jwt_login(username: str, password: str, db: AsyncSession) -> tuple[str, str]:
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if user is None or not _pwd_context.verify(password, user.hashed_password):
        return None, None
    access_token = create_access_token(user.username)
    refresh_token = create_refresh_token(user.username)
    return access_token, refresh_token


def google_login() -> None:
    raise NotImplementedError("Google OAuth not configured")
