from django.contrib import admin
from .models import Profile,Blogs,Audiobook,Meditation,Movie,Interest,RuleBasedProfile,MatchPreference,PersonalityQuestion,PersonalityAnswer
# Register your models here.

admin.site.register(Profile)
admin.site.register(Blogs)
admin.site.register(Audiobook)
admin.site.register(Meditation)
admin.site.register(Movie)
admin.site.register(Interest)
admin.site.register(RuleBasedProfile)
admin.site.register(MatchPreference)
admin.site.register(PersonalityQuestion)
admin.site.register(PersonalityAnswer)