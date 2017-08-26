from django.conf.urls import url, include

from insta.views import *

urlpatterns = [
    url(r'^$', IndexView),
    url(r'^video/$', VideoView),
    url(r'^backup/$', BackupView),
    url(r'^getVideoLink/$', GetVideoLink),
    url(r'^getUserData/$', GetUserData),
    url(r'^privacy-policy/$', PrivacyPolicy),
]
