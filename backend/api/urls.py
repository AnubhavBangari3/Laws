from django.urls import path,include

from .views import RegisterView,LogoutView,ProfileView,ProfilePictureUpdateView,fetch_audiobook,BlogListCreateAPIView,BlogRetrieveUpdateAPIView
from rest_framework.routers import DefaultRouter


router=DefaultRouter()
router.register("register",RegisterView,basename="register")

urlpatterns=[
    path("",include(router.urls)),
   # path('login', LoginView.as_view(), name='login'),
   path("logout",LogoutView.as_view(),name="logout"),
   path("profile",ProfileView.as_view(),name="profile"),
   path("profile/picture",ProfilePictureUpdateView.as_view(),name="profilep"),
   path('audiobook/', fetch_audiobook, name='fetch_audiobook'),
   path('blogs/', BlogListCreateAPIView.as_view(), name='blog-list-create'),
   path('blogs/<int:pk>/', BlogRetrieveUpdateAPIView.as_view(), name='blog-update'),
    ]