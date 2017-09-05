from insta.urls import urlpatterns as instaUrls
from django.core.urlresolvers import reverse
from django.contrib.sitemaps import Sitemap

class StaticSitemap(Sitemap):
     priority = 0.8
     changefreq = 'weekly'

     # The below method returns all urls defined in urls.py file
     def items(self):
        mylist = [ ]
        for url in instaUrls:
            if url.name is not None:
                mylist.append(url.name) 
        return mylist

     def location(self, item):
         return reverse(item)