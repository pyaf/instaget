from django.shortcuts import render

# Create your views here.
def IndexView(request):
    template = 'index.html'
    context = {}
    if request.method=='POST':
        post = request.POST
        post_link = post['post_link']
        print(post_link)
        url = 'https://api.instagram.com/oembed/?callback=&url=https://www.instagram.com/p/BYM5yatg17A/'
    return render(request, template, context)
