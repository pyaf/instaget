from django.shortcuts import render, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import requests
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
    return response['items']


@csrf_exempt
def getVideoLink(request):
    if request.method == "POST":
        media_id = request.POST['media_id']
        author_name = request.POST['author_name']
        foundLink = False
        max_id = None
        while(not foundLink):
            print("Getting Posts..")
            posts = getPosts(author_name, max_id=max_id)
            for post in posts:
                if post['id'] == media_id:
                    videoLink = post['alt_media_url']
                    foundLink = True
            max_id = posts[-1]['id']
            print(max_id)
        print('foundLink: ', foundLink)
        print('videoLink: ', videoLink )
        return HttpResponse(videoLink)
