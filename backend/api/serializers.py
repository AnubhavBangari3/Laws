from rest_framework import serializers
from django.contrib.auth.models import User


from django.contrib.auth import authenticate
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password

from . models import Profile,Blogs,Audiobook,Meditation


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