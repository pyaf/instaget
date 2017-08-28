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
    media_data = []
    max_id = None
    for author_name in users_posts_dict:
        while(True): # Will iterate till it finds all media links of this user
            posts, more_available = getPosts(author_name, max_id=max_id)
            for post in posts:
                try:
                    if users_posts_dict[author_name][post['id']]:
                        media_data.append(post)
                        del users_posts_dict[author_name][post['id']]
                        # will help in breaking the loop when value dict is empty
                except Exception as e:
                    pass
            if not users_posts_dict[author_name]: # all media links found
                break
            max_id = posts[-1]['id']
    return media_data

# ajax response funtion
def GetMultiPosts(request):
    if request.method == 'POST':
        shortcodes = request.POST.getlist('shortcodes[]', None)
        # print(shortcodes)
        users_posts_dict = defaultdict(dict)
        api_url = 'https://api.instagram.com/oembed/?url=https://instagram.com/p/{}/'
        for code in shortcodes:
            url = api_url.format(code)
            response = requests.get(url).json()
            users_posts_dict[response['author_name']][response['media_id']] = True
        # print(users_posts_dict)
        media_links = _GetAllMediaLinks(users_posts_dict)
        return HttpResponse(json.dumps(media_links),
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
