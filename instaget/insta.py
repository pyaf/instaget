import requests
url = 'https://api.instagram.com/oembed/?callback=&url=https://www.instagram.com/p/BYM5yatg17A/'
response = requests.get(url).json()

for i in response:
    print(i, response[i])
