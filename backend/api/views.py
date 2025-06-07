from django.shortcuts import render
from django.contrib.auth import authenticate,login

from django.contrib.auth.models import User
from rest_framework import viewsets

from .serializers import LoginSerializer,RealizerSerializer,ProfileSerializer,BlogSerializer,AudiobookSerializer,MeditationSerializer,MovieSerializer,RuleBasedProfileSerializer,InterestSerializer
from . models import Profile,Blogs,Audiobook,Meditation,Movie,Interest,RuleBasedProfile

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404

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

class Like_audiobook(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_profile = Profile.objects.get(username_id=request.user.id)
        product_id = request.data.get('product_id')

        if not product_id:
            return Response({'error': 'product_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the audiobook is already liked (exists)
        try:
            liked_audiobook = Audiobook.objects.get(prof_user=user_profile, product_id=product_id)
            liked_audiobook.delete()
            return Response({'message': 'Audiobook unliked successfully'}, status=status.HTTP_200_OK)
        except Audiobook.DoesNotExist:
            # Add the audiobook if not already liked
            audiobook = Audiobook.objects.create(
                prof_user=user_profile,
                product_id=product_id,
                title=request.data.get('title', 'Unknown'),
                link=request.data.get('link', 'http://example.com'),
                rating=request.data.get('rating'),
                author=request.data.get('author'),
                category=request.data.get('category'),
                downloads=request.data.get('downloads'),
                thumbnail=request.data.get('thumbnail'),
            )
            return Response({'message': 'Audiobook liked successfully'}, status=status.HTTP_201_CREATED)
    def get(self, request):
        user_profile = Profile.objects.get(username_id=request.user.id)
        liked_audiobooks = Audiobook.objects.filter(prof_user=user_profile)
        serializer = AudiobookSerializer(liked_audiobooks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
from django.core.files.base import ContentFile

class LikeMeditationAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_profile = Profile.objects.get(username_id=request.user.id)
        data = request.data

        title = data.get('title')
        image_url = data.get('image')
        audio_url = data.get('audio')
        duration = data.get('duration')
        # Handle relative URLs
        if image_url and image_url.startswith("/"):
            image_url = f"http://127.0.0.1:8081{image_url}"  # or your frontend domain

        if audio_url and audio_url.startswith("/"):
            audio_url = f"http://127.0.0.1:8081{audio_url}"

        # Check if already liked
        existing_meditation = Meditation.objects.filter(prof_userM=user_profile, title=title).first()

        if existing_meditation:
            existing_meditation.delete()
            return Response({'message': 'Meditation unliked and removed'}, status=200)

        # Download image
        image_response = requests.get(image_url)
        image_name = os.path.basename(image_url)
        image_file = ContentFile(image_response.content, name=image_name)

        # Download audio
        audio_response = requests.get(audio_url)
        audio_name = os.path.basename(audio_url)
        audio_file = ContentFile(audio_response.content, name=audio_name)

        # Create new Meditation
        Meditation.objects.create(
            prof_userM=user_profile,
            title=title,
            image=image_file,
            audio=audio_file,
            duration=duration
        )

        return Response({'message': 'Meditation liked and saved'}, status=201)
    def get(self, request):
        user_profile = Profile.objects.get(username_id=request.user.id)
        liked_meditations = Meditation.objects.filter(prof_userM=user_profile)
        print("liked_meditations:",liked_meditations)
        serializer = MeditationSerializer(liked_meditations, many=True, context={"request": request})
        return Response(serializer.data, status=200)

class MovieLikeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all liked movies by the logged-in user"""
        user_profile = Profile.objects.get(username_id=request.user.id)
        movies = Movie.objects.filter(user=user_profile)
        serializer = MovieSerializer(movies, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Toggle like/unlike a movie"""
        data = request.data
        title = data.get("title")
        user_profile = Profile.objects.get(username_id=request.user.id)
        if not title:
            return Response({"error": "Title is required"}, status=status.HTTP_400_BAD_REQUEST)

        existing_movie = Movie.objects.filter(user=user_profile, title=title).first()

        if existing_movie:
            # If movie exists (already liked), unlike it
            existing_movie.delete()
            return Response({"message": "Movie unliked successfully"}, status=status.HTTP_200_OK)

        # Otherwise, like it
        serializer = MovieSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=user_profile)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
    
class BlogRetrieveUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        blog = get_object_or_404(Blogs, pk=pk)
        profile = Profile.objects.get(username_id=request.user.id)
        # Ensure only the owner can edit
        if blog.author != profile:
            return Response({"detail": "You do not have permission to edit this blog."}, status=status.HTTP_403_FORBIDDEN)

        serializer = BlogSerializer(blog, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class BlogLikeToggleAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        blog = get_object_or_404(Blogs, pk=pk)
        profile = Profile.objects.get(username_id=request.user.id)

        if blog.likes.filter(pk=profile.pk).exists():
            blog.likes.remove(profile)
            liked = False
        else:
            blog.likes.add(profile)
            liked = True

        return Response({
            'liked': liked,
            'total_likes': blog.likes.count()
        }, status=status.HTTP_200_OK)
    
class BlogLikeStatusAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        blog = get_object_or_404(Blogs, pk=pk)
        profile = Profile.objects.get(username_id=request.user.id)
        liked = blog.likes.filter(pk=profile.pk).exists()

        return Response({
            'liked': liked,
            'total_likes': blog.likes.count()
        }, status=status.HTTP_200_OK)
from rest_framework import generics, permissions    

#Start Rule-Based Matching
class RuleBasedProfileRetrieveView(generics.RetrieveAPIView):
    serializer_class = RuleBasedProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        prof = Profile.objects.get(username_id=self.request.user.id)
        return RuleBasedProfile.objects.get(profile=prof)
    
class CreateRuleBasedProfileView(generics.CreateAPIView):
    serializer_class = RuleBasedProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

   

    def perform_create(self, serializer):
        # Set the user automatically
        prof = Profile.objects.get(username_id=self.request.user.id)
        if RuleBasedProfile.objects.filter(profile=prof).exists():
            raise ValidationError("Rule-based profile already exists.")

        serializer.save(profile=prof)

class UpdateRuleBasedProfileView(generics.UpdateAPIView):
    serializer_class = RuleBasedProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        prof = Profile.objects.get(username_id=self.request.user.id)
        try:
            return RuleBasedProfile.objects.get(profile=prof)
        except RuleBasedProfile.DoesNotExist:
            raise ValidationError("Rule-based profile does not exist. Please create it first.")
        
class RuleBasedProfileRemoveInterestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, interest_id):
        # 1. Get the current user's Profile
        prof = Profile.objects.get(username_id=request.user.id)
        # 2. Get or error if RuleBasedProfile does not exist
        try:
            rule_profile = RuleBasedProfile.objects.get(profile=prof)
        except RuleBasedProfile.DoesNotExist:
            raise ValidationError("Rule-based profile does not exist. Please create it first.")

        # 3. Find the interest in this profile
        try:
            interest = rule_profile.interests.get(id=interest_id)
        except Interest.DoesNotExist:
            raise ValidationError("Interest not found in this profile.")

        # 4. Remove the interest from the profile (many-to-many remove)
        rule_profile.interests.remove(interest)
        # Return HTTP 204 No Content on success
        return Response(status=status.HTTP_204_NO_CONTENT)

#End Rule-Based Matching