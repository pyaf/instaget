from django.shortcuts import render, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.translation import ugettext as _
import requests
import json
from collections import defaultdict
from instagram_private_api import Client
from django.contrib.gis.geoip2 import GeoIP2
from ipware.ip import get_ip
from django.utils.translation import get_language
from django.utils import translation
from instaget import settings
from django.utils import translation

username = 'riven5518'
password = 'qwer1234'
global api
geo = GeoIP2()
api = Client(username, password)


def getLang(request):
    try:
        ip = get_ip(request)
        if ip is not None:
            geoData = geo.country(ip)
            if geoData['country_name'] == 'China':
                return 'ch'    
    except Exception as e:
        pass
    return 'en'
    
# 3
def setSession(request): # Set language for this user
    lang_set = request.session.get('lang_set', None)
    if lang_set is None:
        lang =  getLang(request)
        request.session['_language'] = lang # will be set for upcomming views (not this view)
        translation.activate(lang) # set for current view
        request.session['lang_set'] = True
    return

def langView(request):
    setSession(request)
    context = {}
    try:
        ip = get_ip(request)    
        if ip is not None:
            context['ip'] = ip
            data = geo.country(ip)
            context['country_name'] =  data['country_name']
    except Exception as e:
        context['error'] = e
    template = 'lang.html'
    return render(request, template, context)

def instaView(request, shortcode):
    template = 'insta.html'
    context = {'shortcode': shortcode}
    return render(request, template, context)

def MultiView(request):
    template = 'multi.html'
    setSession(request)
    print(dict(request.session))
    return render(request, template, {})
    

def StoryView(request):
    template = 'story.html'
    setSession(request)
    return render(request, template, {})
    
def AccountView(request):
    template = 'account.html'
    setSession(request)
    return render(request, template, {})


def PrivacyPolicy(request):
    template = 'privacy-policy.html'
    setSession(request)
    return render(request, template, {})


def GetUserStory(request):
    global api
    if request.method == "POST":
        response_data = {}
        username = request.POST['username']
        print(username)
        url = 'https://instagram.com/'+username+'/?__a=1'
        response = requests.get(url)
        if (response.status_code == 404):
            response_data['status_code'] = 404
        else:
            user_id = response.json()['user']['id']
            print(user_id)
            try:
                stories = api.user_reel_media(user_id)
            except Exception as e:
                print(e) #may be session expired, relogin
                
                api = Client(username, password)
                stories = api.user_reel_media(user_id)

            # print(stories)
            response_data['stories'] = stories
        return HttpResponse(json.dumps(response_data),
                    content_type = "application/json")
    

def getPosts(author_name, max_id = ''):
    url = 'https://www.instagram.com/%s/media/?max_id=%s' % (author_name, max_id)
    response = requests.get(url)
    if response.status_code == 200:
        return (response.status_code, response.json()['items'], 
                response.json()['more_available'])
    else:
        return (response.status_code, {}, {})


def _GetAllMediaLinks(users_posts_dict): # irrespective of img or video
    media_data = defaultdict() # key is shortcode and value is post data (../username/media/) has all info
    max_id = None
    for author_name in users_posts_dict:
        while(True): # Will iterate till it finds all media links of this user
            status, posts, more_available = getPosts(author_name, max_id=max_id)
            if status==200: # else ?
                for post in posts:
                    try: # 2
                        if users_posts_dict[author_name][post['code']]: # post['code'] is shortcode of the post
                            media_data[post['code']] = post
                            del users_posts_dict[author_name][post['code']]
                            # will help in breaking the loop when value dict is empty
                    except Exception as e:
                        pass
            if not users_posts_dict[author_name]: # all media links found for this user
                break
            max_id = posts[-1]['id'] # not found in this iteration.
    return media_data

# 1
# ajax response funtion
def GetMultiPosts(request):
    if request.method == 'POST':
        # print('requests', request.POST)
        users_posts_dict = json.loads(request.POST.get('users_posts_dict'))
        # print(users_posts_dict)
        media_data = _GetAllMediaLinks(users_posts_dict)
        return HttpResponse(json.dumps(media_data),
                    content_type = "application/json")
    else:
        return HttpResponse("Not allowed")



def GetUserData(request):
    if request.method == "POST":
        username = request.POST['username']
        max_id = request.POST['max_id']
        status, posts, more_available = getPosts(author_name=username, max_id=max_id)
        response_data = {'status': status}
        response_data['posts'] = posts
        response_data['more_available'] = more_available
        return HttpResponse(
            json.dumps(response_data),
            content_type = "application/json"
            )
    else:
        return HttpResponse("Bad Request")


'''
# 1 : given a post's shortcode, we can know username, media_id etc..
but not source (standard media links), so we have to request to another api at
https://instagram.com/username/media which gives all the user posts and loop over
all of them to get the required ones


# 2 : here new key-value is not generated in value (a dict) of
users_posts_dict[author_name], also helps in breaking the loop.

# 3:
 setSession: for first time visitors it checks their ip, get's country, if china then sets
 key 'lang_set' as True, and '_language' as 'ch', next time user visits then check if lang_set is True
 if True then no need to set the lang according to geolocation, either it's been already set or user has already
 changed his/her language through language change form ;)
'''


'''
def GetVideoLink(request):
    if request.method == "POST":
        media_id = request.POST['media_id']
        author_name = request.POST['author_name']
        foundLink = False
        max_id = None
        while(not foundLink):
            print("Getting Posts..")
            status, posts, more_available = getPosts(author_name, max_id=max_id)
            for post in posts:
                if post['id'] == media_id:
                    videoLink = post['alt_media_url']
                    foundLink = True
            max_id = posts[-1]['id']
            # print(max_id)
        # print('foundLink: ', foundLink)
        # print('videoLink: ', videoLink )
        return HttpResponse(videoLink)
    else:
        return HttpResponse("Bad Request")
'''