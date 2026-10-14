class AppError(Exception):
    def __init__(self, detail: str, code: str, status: int = 400) -> None:
        super().__init__(detail)
        self.detail = detail
        self.code = code
        self.status = status


class ConflictError(AppError):
    def __init__(self, detail: str, code: str) -> None:
        super().__init__(detail, code, status=409)


class UsernameTakenError(ConflictError):
    def __init__(self) -> None:
        super().__init__("Username is already taken", "username_taken")


class EmailTakenError(ConflictError):
    def __init__(self) -> None:
        super().__init__("Email is already taken", "email_taken")
