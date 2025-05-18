from django.db import models
from django.contrib.auth.models import User
from django.template.defaultfilters import slugify
from datetime import datetime
# Create your models here.

import uuid

def get_random_code():
    code=str(uuid.uuid4())[:8].replace('-','').lower()
    return code

class Profile(models.Model):
    username=models.ForeignKey(User,on_delete=models.CASCADE,related_name="profile_users")
    first_name=models.CharField(max_length=200,null=True,blank=True)
    last_name=models.CharField(max_length=200,null=True,blank=True)
    email=models.EmailField(max_length=200,null=True,blank=True)
    about=models.TextField(max_length=255,default="No description")
    pp=models.ImageField(default="cover2.jpeg",upload_to="Profile_picture",blank=True,null=True)
    ##For unique
    slug=models.SlugField(unique=True,blank=True)
    
    connections=models.ManyToManyField(User,related_name="connections",blank=True)
    access_token=models.CharField(max_length=265,blank=True)
    created=models.DateTimeField(auto_now_add=True)
    updated=models.DateTimeField(auto_now_add=True)

    #For dynamically creating unique slug if users have similar name
    def save(self,*args,**kwargs):
        b=False
        if self.first_name and self.last_name:
            to_slug=slugify(str(self.first_name)+""+str(self.last_name))
            b=Profile.objects.filter(slug=to_slug).exists()
            
            while b:
                to_slug=slugify(to_slug+""+str(get_random_code()))
                b=Profile.objects.filter(slug=to_slug).exists()
        else:
            to_slug=str(self.username)
        self.slug=to_slug
        super().save(*args,**kwargs)
    
    def __str__(self):
        return str(self.username.username)
    
class Blogs(models.Model):
    author = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="post_author")
    content = models.TextField()
    posted_on = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(Profile, related_name='liked_blogs', blank=True)

    def __str__(self):
        return str(self.id)

    def total_likes(self):
        return self.likes.count()

class Audiobook(models.Model):
    prof_user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='liked_audiobooks')
    title = models.CharField(max_length=255)
    link = models.URLField()
    product_id = models.CharField(max_length=100, unique=True)
    rating = models.FloatField(null=True, blank=True)
    author = models.CharField(max_length=255, null=True, blank=True)
    category = models.CharField(max_length=255, null=True, blank=True)
    downloads = models.CharField(max_length=255, null=True, blank=True)
    thumbnail = models.URLField(null=True, blank=True)
    liked_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.prof_user.username})"