from django.conf.urls import url, include

from insta.views import *

urlpatterns = [
    url(r'^$', IndexView),
    url(r'^video/$', VideoView),
    url(r'^getVideoLink/$', getVideoLink),
    url(r'^privacy-policy/$', PrivacyPolicy),
]
