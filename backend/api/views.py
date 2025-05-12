from django.shortcuts import render
from django.contrib.auth import authenticate,login

from django.contrib.auth.models import User
from rest_framework import viewsets

from .serializers import LoginSerializer,RealizerSerializer,ProfileSerializer,BlogSerializer
from . models import Profile,Blogs

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import MultiPartParser, FormParser

'''
class LoginView(APIView):
    def post(self, request, *args, **kwargs):
        # The login serializer takes care of validation
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            # If the credentials are correct, return the JWT tokens
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            print("access_token:",access_token)
            print("refresh:",refresh)
            return Response({
                'refresh': str(refresh),
                'access': access_token
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
'''
# Create your views here.
class RegisterView(viewsets.ModelViewSet):
    queryset=User.objects.all()
    serializer_class=RealizerSerializer
from rest_framework_simplejwt.exceptions import TokenError
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh_token")
            if not refresh_token:
                return Response(
                    {"detail": "Refresh token is required."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            token = RefreshToken(refresh_token)
            
            # This will mark the token as blacklisted
            token.blacklist()
            
            return Response(
                {"detail": "Successfully logged out."},
                status=status.HTTP_205_RESET_CONTENT
            )
            
        except TokenError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"detail": "An error occurred during logout."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
class ProfileView(APIView):
      permission_classes=[IsAuthenticated]
      serializer_class=ProfileSerializer
      parser_classes = [MultiPartParser, FormParser] 
      def get(self,request):
          print("checking:",request.user)
          profile=Profile.objects.get(username_id=request.user.id)
          serializer=ProfileSerializer(profile,many=False)
          return Response(serializer.data)
      
      def patch(self, request):
        print("Updating profile fields for:", request.user)
        profile = Profile.objects.get(username_id=request.user.id)

        profile.first_name = request.data.get('first_name', profile.first_name)
        profile.last_name = request.data.get('last_name', profile.last_name)
        profile.email = request.data.get('email', profile.email)
        profile.about = request.data.get('about', profile.about)

        profile.save()
        serializer = ProfileSerializer(profile, many=False)
        return Response(serializer.data, status=200)
      
class ProfilePictureUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]  # Only needed here!

    def patch(self, request):
        print("Updating profile picture for:", request.user)
        profile = Profile.objects.get(username_id=request.user.id)

        pp = request.FILES.get('pp')
        if pp:
            profile.pp = pp
            profile.save()

        serializer = ProfileSerializer(profile, many=False)
        return Response(serializer.data, status=200)
    
import requests
from rest_framework.response import Response
from rest_framework.decorators import api_view
import os


@api_view(['GET'])
def fetch_audiobook(request):
    SERP_API_KEY = os.getenv("keyprivate")
    
    search_query = "audiobooks"
    
    serpapi_url = f"https://serpapi.com/search.json?engine=google_play&q={search_query}&category=audiobooks&api_key={SERP_API_KEY}"

    try:
        resp = requests.get(serpapi_url)
        data = resp.json()

        # Extract relevant data
        if "organic_results" in data:
            audiobooks = []
            for item in data["organic_results"]:
                for audiobook in item["items"]:
                    audiobooks.append({
                        "title": audiobook.get("title"),
                        "link": audiobook.get("link"),
                        "product_id": audiobook.get("product_id"),
                        "rating": audiobook.get("rating"),
                        "author": audiobook.get("author"),
                        "category": audiobook.get("category"),
                        "downloads": audiobook.get("downloads"),
                        "thumbnail": audiobook.get("thumbnail"),
                    })
            
            return Response(audiobooks)
        
        return Response({"error": "No audiobooks found"}, status=404)

    except Exception as e:
        return Response({"error": str(e)}, status=500)

class BlogListCreateAPIView(APIView):
    permission_classes =[IsAuthenticated]

    def get(self, request):
        blogs = Blogs.objects.all().order_by('-posted_on')
        serializer = BlogSerializer(blogs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = BlogSerializer(data=request.data)
        profile = Profile.objects.get(username_id=request.user.id)
        if serializer.is_valid():
            serializer.save(author=profile) 
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)