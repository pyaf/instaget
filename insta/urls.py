from django.conf.urls import url, include
from insta.views import *

urlpatterns = [
    url(r'^$', MultiView, name="multi"),
    url(r'^p/(?P<shortcode>[-\w]+)/$', instaView),
    url(r'^lang/$', langView),
    url(r'^story/$', StoryView, name="story"),
    url(r'^getUserStory/$', GetUserStory),
    url(r'^account/$', AccountView, name='account'),
    url(r'^getUserData/$', GetUserData),
    url(r'^getMultiPosts/$', GetMultiPosts),
    url(r'^privacy-policy/$', PrivacyPolicy, name="privacy-policy"),
]

