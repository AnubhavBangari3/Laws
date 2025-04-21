from django.urls import path,include

from .views import RegisterView,LogoutView
from rest_framework.routers import DefaultRouter


router=DefaultRouter()
router.register("register",RegisterView,basename="register")

urlpatterns=[
    path("",include(router.urls)),
   # path('login', LoginView.as_view(), name='login'),
   path("logout",LogoutView.as_view(),name="logout"),
   
    ]