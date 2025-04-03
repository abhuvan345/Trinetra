from django.contrib import admin
from django.urls import path, include  # Include app URLs

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('api.urls')),  # Replace 'myapp' with your app's name
]
