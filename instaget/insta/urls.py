from django.conf.urls import url, include

from insta.views import *

urlpatterns = [
    url(r'^$', MultiView),
    url(r'^story/$', StoryView),
    url(r'^getUserStory/$', GetUserStory),
    url(r'^account/$', AccountView),
    url(r'^getVideoLink/$', GetVideoLink),
    url(r'^getUserData/$', GetUserData),
    url(r'^getMultiPosts/$', GetMultiPosts),
    url(r'^privacy-policy/$', PrivacyPolicy),
]
