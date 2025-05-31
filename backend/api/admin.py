from django.contrib import admin
from .models import Profile,Blogs,Audiobook,Meditation,Movie
# Register your models here.

admin.site.register(Profile)
admin.site.register(Blogs)
admin.site.register(Audiobook)
admin.site.register(Meditation)
admin.site.register(Movie)