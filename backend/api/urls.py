from django.urls import path,include

from .views import RegisterView,LogoutView,ProfileView,ProfilePictureUpdateView,fetch_audiobook,BlogListCreateAPIView,BlogRetrieveUpdateAPIView,BlogLikeToggleAPIView,BlogLikeStatusAPIView,Like_audiobook,LikeMeditationAPIView,MovieLikeAPIView,CreateRuleBasedProfileView
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
   path('blogs/<int:pk>/like/', BlogLikeToggleAPIView.as_view(), name='blog-like-toggle'),
   path('blogs/<int:pk>/like-status/', BlogLikeStatusAPIView.as_view(), name='blog-like-status'),
   path('audiobook/like/', Like_audiobook.as_view(), name='like-audiobook'),
   path('meditation/like/', LikeMeditationAPIView.as_view(), name='like-meditation'),
   path('movies/like/', MovieLikeAPIView.as_view(), name='movie-like'),
    path('rulebased/create/', CreateRuleBasedProfileView.as_view(), name='create-rulebased-profile'),
    ]