from django.conf.urls import url, include

from insta.views import *

urlpatterns = [
    url(r'^$', IndexView),
    url(r'^privacy-policy$', PrivacyPolicy),
]
