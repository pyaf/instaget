from django.conf.urls import url, include

from insta.views import *

urlpatterns = [
    url(r'^$', MultiView),
    url(r'^lang/$', langView),
    url(r'^story/$', StoryView),
    url(r'^getUserStory/$', GetUserStory),
    url(r'^account/$', AccountView),
    url(r'^getUserData/$', GetUserData),
    url(r'^getMultiPosts/$', GetMultiPosts),
    url(r'^privacy-policy/$', PrivacyPolicy),
    
]
