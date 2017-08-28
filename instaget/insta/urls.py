from django.conf.urls import url, include

from insta.views import *

urlpatterns = [
    url(r'^$', IndexView),
    url(r'^multi/$', MultiView),
    url(r'^video/$', VideoView),
    url(r'^backup/$', BackupView),
    url(r'^getVideoLink/$', GetVideoLink),
    url(r'^getUserData/$', GetUserData),
    url(r'^getMultiPosts/$', GetMultiPosts),
    url(r'^privacy-policy/$', PrivacyPolicy),
]
