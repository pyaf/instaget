from django.conf.urls import url, include
from django.contrib import admin
from django.views.i18n import javascript_catalog
from django.views.i18n import JavaScriptCatalog

js_info_dict = {
	'domain': 'djangojs',
    'packages': ('insta',),
}

urlpatterns = [
    url(r'^', include('insta.urls')),
    url(r'^i18n/', include('django.conf.urls.i18n')),
    url(r'^jsi18n/$', javascript_catalog, js_info_dict, name='javascript_catalog'),
]
