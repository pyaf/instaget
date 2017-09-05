from django.conf.urls import url, include
from django.contrib import admin
from django.contrib.sitemaps.views import sitemap
from django.views.i18n import javascript_catalog
from django.views.i18n import JavaScriptCatalog
from .sitemapsettings import StaticSitemap
from django.contrib.sitemaps import ping_google

js_info_dict = {
	'domain': 'djangojs',
    'packages': ('insta',),
}
sitemaps = {
   'static': StaticSitemap(),
}

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^', include('insta.urls')),
    url(r'^i18n/', include('django.conf.urls.i18n')),
    url(r'^jsi18n/$', javascript_catalog, js_info_dict, name='javascript_catalog'),
	url(r'^sitemap\.xml$', sitemap, {'sitemaps': sitemaps}, name='django.contrib.sitemaps.views.sitemap'),
]

try:
	print('pinging google for sitemap')
	ping_google()
	print('done')
except Exception as e:
	print(e)