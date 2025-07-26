from rest_framework import serializers
from django.contrib.auth.models import User


from django.contrib.auth import authenticate
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password

from . models import Profile,Blogs,Audiobook,Meditation,Movie,RuleBasedProfile, Interest,MatchPreference,PersonalityQuestion, PersonalityAnswer


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(
        label="Username",
        write_only=True
    )
    password = serializers.CharField(
        label="Password",
        # This will be used when the DRF browsable API is enabled
        style={'input_type': 'password'},
        trim_whitespace=False,
        write_only=True
    )

    def validate(self, attrs):
        # Take username and password from request
        username = attrs.get('username')
        password = attrs.get('password')
        if username and password:
            # Try to authenticate the user using Django auth framework.
            user = authenticate(request=self.context.get('request'),
                                username=username, password=password)
            if not user:
                # If we don't have a regular user, raise a ValidationError
                msg = 'Access denied: wrong username or password.'
                raise serializers.ValidationError(msg, code='authorization')
        else:
            msg = 'Both "username" and "password" are required.'
            raise serializers.ValidationError(msg, code='authorization')
        # We have a valid user, put it in the serializer's validated_data.
        # It will be used in the view.
        attrs['user'] = user
        return attrs
from rest_framework.exceptions import ValidationError
from django.db import IntegrityError
class RealizerSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        write_only=True,
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'password', 'password2')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match"})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        try:
            user = User.objects.create(
                username=validated_data['username'],
                email=validated_data['email'],
                first_name=validated_data['first_name'],
                last_name=validated_data['last_name']
            )
            user.set_password(validated_data['password'])
            user.save()
            return user
        except IntegrityError:
            raise ValidationError({"detail": "Username or email already exists."})
        
class ProfileSerializer(serializers.ModelSerializer):
    username=serializers.PrimaryKeyRelatedField(read_only=True)
    profile_name=serializers.SerializerMethodField("getName")
    num_connections=serializers.SerializerMethodField("getCon")
    class Meta:
        model=Profile
        fields=('id','username','first_name','last_name','email','about','pp','connections','access_token','slug','profile_name','num_connections',)
    def getName(self,instance):
        return instance.username.username
    def getCon(self,instance):
        return instance.connections.count()

class BlogSerializer(serializers.ModelSerializer):
    author = serializers.PrimaryKeyRelatedField(read_only=True)
    author_name = serializers.SerializerMethodField()
    liked_by_user = serializers.SerializerMethodField()
    total_likes = serializers.IntegerField(read_only=True)

    class Meta:
        model = Blogs
        fields = ['id', 'author', 'author_name', 'content', 'posted_on', 'liked_by_user', 'total_likes']


    def get_author_name(self, obj):
        return f"{obj.author.first_name}" if obj.author.first_name else obj.author.username
    
    def get_liked_by_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False
    
class AudiobookSerializer(serializers.ModelSerializer):
    #prof_user=serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = Audiobook
        fields = ['product_id']

class MeditationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meditation
        fields = [
            'id',
            'prof_userM',
            'title',
            'image',
            'audio',
            'duration',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

class MovieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = ['id', 'user', 'title', 'image', 'created_at']
        read_only_fields = ['user', 'created_at']

#Start Rule-Based Matching
class InterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interest
        fields = ['id', 'name']


class RuleBasedProfileSerializer(serializers.ModelSerializer):
    # Handle many-to-many with Interests
    interests = serializers.ListField(
        child=serializers.CharField(), write_only=True
    )
    slug = serializers.CharField(source='profile.slug', read_only=True)
    interest_objects = InterestSerializer(many=True, read_only=True, source="interests")
    pp = serializers.ImageField(source="profile.pp", read_only=True)
    profile_username = serializers.SerializerMethodField()

    class Meta:
        model = RuleBasedProfile
        fields = [
            'id',
            'profile',
            'slug',
            'gender',
            'birthdate',
            'height',
            'religion',
            'custom_religion',
            'education',
            'custom_education',
            'job',
            'profile_username',
            'custom_job',
            'interests',         # Used for writing plain names
            'interest_objects',  # Used for reading actual Interest objects
            'pp',
        ]
        read_only_fields = ['profile'] 
    def get_profile_username(self, obj):
        return obj.profile.username.username 

    def create(self, validated_data):
        interest_names = validated_data.pop('interests', [])
        instance = RuleBasedProfile.objects.create(**validated_data)

        # Handle many-to-many interest creation or linking
        for name in interest_names:
            interest, created = Interest.objects.get_or_create(name=name)
            instance.interests.add(interest)

        return instance

    def update(self, instance, validated_data):
        interest_names = validated_data.pop('interests', None)

        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update interests
        if interest_names is not None:
            instance.interests.clear()
            for name in interest_names:
                interest, created = Interest.objects.get_or_create(name=name)
                instance.interests.add(interest)

        return instance
class MatchPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchPreference
        fields = [
            "id",
            "user",  # or "user_id" depending on your frontend
            "q1_alcohol",
            "q2_smoke",
            "q3_children",
            "q4_long_distance",
            "q5_religion",
            "q6_living_together",
            "q7_exercise_partner",
            "q8_community",
            "q9_monogamy",
            "q10_pets",
            "updated_at",
        ]
        read_only_fields = ["updated_at","user"] 
#End Rule-Based Matching
'''
Compatibility Score Models Matching start
'''

class PersonalityQuestionSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='get_question_id_display', read_only=True)
    class Meta:
        model = PersonalityQuestion
        fields = ['id', 'question_id', 'get_question_id_display','question_text']
    
    #get_question_id_display = serializers.CharField(source='get_question_id_display', read_only=True)


class PersonalityAnswerSerializer(serializers.ModelSerializer):
    question = PersonalityQuestionSerializer(read_only=True)
    question_id = serializers.PrimaryKeyRelatedField(
        source='question', queryset=PersonalityQuestion.objects.all(), write_only=True
    )
    
    class Meta:
        model = PersonalityAnswer
        fields = ['id', 'user', 'question', 'question_id', 'answer', 'submitted_at']
        read_only_fields = ['submitted_at']

'''
Compatibility Score Models Matching end
'''