from django.urls import path,include

from .views import RegisterView,LogoutView,ProfileView,ProfilePictureUpdateView,fetch_audiobook,BlogListCreateAPIView,BlogRetrieveUpdateAPIView,BlogLikeToggleAPIView,BlogLikeStatusAPIView,Like_audiobook,LikeMeditationAPIView,MovieLikeAPIView,CreateRuleBasedProfileView,RuleBasedProfileRetrieveView,UpdateRuleBasedProfileView,RuleBasedProfileRemoveInterestView,RuleBasedProfileListView,MatchPreferenceAPIView,MatchingScoreAPIView,PersonalityQuestionListView,PersonalityAnswerBulkAPIView,UserPersonalityProfileAPIView,SendFriendRequestView,SentPendingFriendRequestsView,ReceivedPendingFriendRequestsView,CancelFriendRequestView,AcceptFriendRequestView, RejectFriendRequestView,FollowingCountView,VisionBoardItemListCreateView,VisionBoardItemListView,VisionBoardOrderCreateView

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
    path("rulebased/view/", RuleBasedProfileRetrieveView.as_view()),
    path("rulebased/update/",UpdateRuleBasedProfileView.as_view()),
    path("rulebased/delete/<int:interest_id>/",RuleBasedProfileRemoveInterestView.as_view()),
    path('rulebased/all/', RuleBasedProfileListView.as_view(), name='rulebased-list'),
    path('match-preferences/', MatchPreferenceAPIView.as_view(), name='match-preferences'),
    path('match-score/<slug:slug>/', MatchingScoreAPIView.as_view(), name='match-score'),
    path('api/personality-questions/', PersonalityQuestionListView.as_view(), name='personality-questions'),
    path("api/personality-answers/bulk/", PersonalityAnswerBulkAPIView.as_view(), name="personality-answer-bulk"),
    path('personality/mbti/', UserPersonalityProfileAPIView.as_view(), name='user-mbti'),
    path("friend-request/send/<int:id>/", SendFriendRequestView.as_view(), name="send-friend-request"),
    path("friend-request/sent/pending/", SentPendingFriendRequestsView.as_view(), name="sent-pending-friend-requests"),
    path("friend-request/receive/pending/", ReceivedPendingFriendRequestsView.as_view(), name="sent-pending-friend-requests"),
    path("friend-request/<int:pk>/cancel/", CancelFriendRequestView.as_view(), name="cancel-friend-request"),
     path("friend-request/<int:pk>/accept/", AcceptFriendRequestView.as_view(), name="accept-friend-request"),
    path("friend-request/<int:pk>/reject/", RejectFriendRequestView.as_view(), name="reject-friend-request"),
    path("profile/<int:profile_id>/following-count/", FollowingCountView.as_view(), name="following-count"),
    path("vision/",VisionBoardItemListCreateView.as_view(),name="vision"),
    path("visionget/",VisionBoardItemListView.as_view(),name="visionget"),
    path("visionorder/",VisionBoardOrderCreateView.as_view(),name="visionorder"),
    ]