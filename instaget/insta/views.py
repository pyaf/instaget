from django.shortcuts import render, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import requests
import json

# Create your views here.
def IndexView(request):
    template = 'index.html'
    context = {}
    return render(request, template, context)

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
            print(max_id)
        print('foundLink: ', foundLink)
        print('videoLink: ', videoLink )
        return HttpResponse(videoLink)
    else:
        return HttpResponse("Bad Request")


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
        for post in posts:
            print(post['alt_media_url'])
        return HttpResponse(
            json.dumps(response_data),
            content_type = "application/json"
            )
    else:
        return HttpResponse("Bad Request")
