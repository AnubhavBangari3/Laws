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
    
'''
Start Rule-Based Matching
'''
RELIGION_CHOICES = [
    ("Hindu", "Hindu"),
    ("Muslim", "Muslim"),
    ("Christian", "Christian"),
    ("Sikh", "Sikh"),
    ("Agnostic", "Agnostic"),
    ("Other", "Other"),
]

EDUCATION_CHOICES = [
    ("High School", "High School"),
    ("Bachelor's", "Bachelor's"),
    ("Master's", "Master's"),
    ("PhD", "PhD"),
    ("Other", "Other"),
]

JOB_CHOICES = [
    ("Engineer", "Engineer"),
    ("Doctor", "Doctor"),
    ("Teacher", "Teacher"),
    ("Artist", "Artist"),
    ("Business", "Business"),
    ("Actor", "Actor"),
    ("Model", "Model"),
    ("Lawyer", "Lawyer"),
    ("Other", "Other"),
]
GENDER_CHOICES = [
    ("Male", "Male"),
    ("Female", "Female"),
    ("Others", "Others"),
]

# Separate model for interests to allow dropdown + custom addition
class Interest(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name
    
class RuleBasedProfile(models.Model):
    profile = models.OneToOneField(Profile, on_delete=models.CASCADE, related_name="rule_based")
    gender = models.CharField(null=True,max_length=10, choices=GENDER_CHOICES)
    birthdate = models.DateField()
    height = models.FloatField(help_text="Height in ft")

    religion = models.CharField(max_length=100, choices=RELIGION_CHOICES)
    custom_religion = models.CharField(max_length=100, blank=True, null=True, help_text="If religion is 'Other'")

    education = models.CharField(max_length=100, choices=EDUCATION_CHOICES)
    custom_education = models.CharField(max_length=100, blank=True, null=True)

    job = models.CharField(max_length=100, choices=JOB_CHOICES)
    custom_job = models.CharField(max_length=100, blank=True, null=True)

    # Multiple interests: gym, yoga, meditation, etc.
    interests = models.ManyToManyField(Interest, blank=True)

    def __str__(self):
        return f"RuleBasedProfile of {self.profile.username.username}"


class MatchPreference(models.Model):
    user = models.OneToOneField(Profile, on_delete=models.CASCADE, related_name="match_preference")

    q1_alcohol = models.CharField(max_length=30)
    q2_smoke = models.CharField(max_length=30)
    q3_children = models.CharField(max_length=30)
    q4_long_distance = models.CharField(max_length=30)
    q5_religion = models.CharField(max_length=30)
    q6_living_together = models.CharField(max_length=30)
    q7_exercise_partner = models.CharField(max_length=30)
    q8_community = models.CharField(max_length=30)
    q9_monogamy = models.CharField(max_length=30)
    q10_pets = models.CharField(max_length=30)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Match Preferences"

'''
End Rule-Based Matching
'''
'''
Compatibility Score Models Matching start
'''
class PersonalityQuestion(models.Model):
    QUESTION_CHOICES = [
        ("q1", "Q1. How do you recharge — alone or with others?"),
        ("q2", "Q2. Prefer concrete facts or abstract ideas?"),
        ("q3", "Q3. Logic or emotions in decisions?"),
        ("q4", "Q4. Structured or spontaneous lifestyle?"),
        ("q5", "Q5. Describe your ideal weekend"),
        ("q6", "Q6. How do you handle conflicts?"),
        ("q7", "Q7. What motivates you most at work?"),
        ("q8", "Q8. How would your friends describe you?"),
    ]

    question_id = models.CharField(max_length=10, choices=QUESTION_CHOICES, unique=True)
    

    def __str__(self):
        return self.get_question_id_display()


class PersonalityAnswer(models.Model):
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="personality_answers")
    question = models.ForeignKey(PersonalityQuestion, on_delete=models.CASCADE, related_name="answers")
    answer = models.TextField()
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'question')

    def __str__(self):
        return f"{self.user.username} - {self.question.question_id}"
    
class UserPersonalityProfile(models.Model):
    user = models.OneToOneField(Profile, on_delete=models.CASCADE,related_name="mbti_user")
    predicted_mbti = models.CharField(max_length=4,null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} → {self.predicted_mbti}"
    
'''
Compatibility Score Models Matching End
'''
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
    
class Meditation(models.Model):
    prof_userM = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='liked_meditation')
    title = models.CharField(max_length=255)
    image = models.ImageField(upload_to="meditation_images/")
    audio = models.FileField(upload_to="meditation_audios/")
    duration = models.PositiveIntegerField(help_text="Duration in milliseconds")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Movie(models.Model):
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='liked_movies')
    title = models.CharField(max_length=255)
    image = models.URLField()
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'title')  # So a user can't like the same movie twice

    def __str__(self):
        return f"{self.title} liked by {self.user.username}"