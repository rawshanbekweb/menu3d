from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView
)
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from apps.table.views import PublicTableMenuAPIView

# handler404 = 'apps.user.views.custom_404'

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/user/", include("apps.user.urls")),
    path("api/restaurant/", include("apps.restaurant.urls")),
    path("api/table/", include("apps.table.urls")),
    path("api/eat/", include("apps.eat.urls")),
    path("api/public/menu/<uuid:token>/", PublicTableMenuAPIView.as_view()),

    path("api/token/", TokenObtainPairView.as_view()),
    path("api/refresh/", TokenRefreshView.as_view()),
]

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)