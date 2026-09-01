from django.conf import settings

ACCESS_COOKIE_NAME = "access_token"
REFRESH_COOKIE_NAME = "refresh_token"


def set_auth_cookies(response, access: str, refresh: str | None = None):
    secure = not settings.DEBUG
    response.set_cookie(
        ACCESS_COOKIE_NAME,
        access,
        httponly=True,
        secure=secure,
        samesite="Lax",
        max_age=int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()),
    )
    if refresh is not None:
        response.set_cookie(
            REFRESH_COOKIE_NAME,
            refresh,
            httponly=True,
            secure=secure,
            samesite="Lax",
            max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
        )


def clear_auth_cookies(response):
    response.delete_cookie(ACCESS_COOKIE_NAME)
    response.delete_cookie(REFRESH_COOKIE_NAME)
