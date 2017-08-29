from django.shortcuts import render, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import requests
import json
from collections import defaultdict
# Create your views here.
def IndexView(request):
    template = 'index.html'
    context = {}
    return render(request, template, context)

def MultiView(request):
    template = 'multi.html'
    return render(request, template, {})


def VideoView(request):
    template = 'video.html'
    context = {}
    return render(request, template, context)

def PrivacyPolicy(request):
    template = 'privacy-policy.html'
    return render(request, template, {})


def getPosts(author_name, max_id = ''):
    url = 'https://www.instagram.com/%s/media/?max_id=%s' % (author_name, max_id)
    response = requests.get(url).json()
    return (response['items'], response['more_available'])


def GetVideoLink(request):
    if request.method == "POST":
        media_id = request.POST['media_id']
        author_name = request.POST['author_name']
        foundLink = False
        max_id = None
        while(not foundLink):
            print("Getting Posts..")
            posts, more_available = getPosts(author_name, max_id=max_id)
            for post in posts:
                if post['id'] == media_id:
                    videoLink = post['alt_media_url']
                    foundLink = True
            max_id = posts[-1]['id']
            # print(max_id)
        print('foundLink: ', foundLink)
        print('videoLink: ', videoLink )
        return HttpResponse(videoLink)
    else:
        return HttpResponse("Bad Request")

def _GetAllMediaLinks(users_posts_dict): # irrespective of img or video
    media_data = defaultdict() # key is shortcode and value is post data (../username/media/) has all info
    max_id = None
    for author_name in users_posts_dict:
        while(True): # Will iterate till it finds all media links of this user
            posts, more_available = getPosts(author_name, max_id=max_id)
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
        print('requests', request.POST)
        users_posts_dict = json.loads(request.POST.get('users_posts_dict'))
        print(users_posts_dict)
        media_data = _GetAllMediaLinks(users_posts_dict)
        return HttpResponse(json.dumps(media_data),
                    content_type = "application/json")
    else:
        return HttpResponse("Not allowed")

def BackupView(request):
    template = 'backup.html'
    return render(request, template, {})


def GetUserData(request):
    if request.method == "POST":
        username = request.POST['username']
        max_id = request.POST['max_id']
        posts, more_available = getPosts(author_name=username, max_id=max_id)
        response_data = {}
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
'''
