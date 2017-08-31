import json
import requests
import time
import random
from userinfo import UserInfo

STORIES_UA = 'Instagram 9.5.2 (iPhone7,2; iPhone OS 9_3_3; en_US; en-US; scale=2.00; 750x1334) AppleWebKit/420+'
STORIES_COOKIE = 'ds_user_id={0}; sessionid={1};'
class InstaBot:
    def __init__(self):
        self.user_login = 'agga_daku'
        self.user_password = 'rme141'
        self.s = requests.session()
        self.user_agent = ("Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/48.0.2564.103 Safari/537.36")
        self.accept_language = 'ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4'
        self.url = 'https://www.instagram.com/'
        self.url_login = 'https://www.instagram.com/accounts/login/ajax/'

    def login(self):
        log_string = 'Trying to login as %s...\n' % (self.user_login)
        self.write_log(log_string)
        self.s.cookies.update({
            'sessionid': '',
            'mid': '',
            'ig_pr': '1',
            'ig_vw': '1920',
            'csrftoken': '',
            's_network': '',
            'ds_user_id': ''
        })
        self.login_post = {
            'username': self.user_login,
            'password': self.user_password
        }
        self.s.headers.update({
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': self.accept_language,
            'Connection': 'keep-alive',
            'Content-Length': '0',
            'Host': 'www.instagram.com',
            'Origin': 'https://www.instagram.com',
            'Referer': 'https://www.instagram.com/',
            'User-Agent': self.user_agent,
            'X-Instagram-AJAX': '1',
            'X-Requested-With': 'XMLHttpRequest'
        })
        r = self.s.get(self.url)
        self.s.headers.update({'X-CSRFToken': r.cookies['csrftoken']})
        # time.sleep(5 * random.random())
        login = self.s.post(
            self.url_login, data=self.login_post, allow_redirects=True)
        self.s.headers.update({'X-CSRFToken': login.cookies['csrftoken']})
        self.csrftoken = login.cookies['csrftoken']
        # time.sleep(5 * random.random())

        if login.status_code == 200:
            r = self.s.get('https://www.instagram.com/')
            finder = r.text.find(self.user_login)
            if finder != -1:
                ui = UserInfo()
                self.user_id = ui.get_user_id_by_login(self.user_login)
                self.login_status = True
                log_string = '%s login success!' % (self.user_login)
                self.write_log(log_string)
                res = self.s.get('https://i.instagram.com/api/v1/feed/user/1401944043/reel_media/')
                # res = self.s.get('https://i.instagram.com/api/v1/feed/reels_tray/')
                print(json.loads(res.text))
                # id = ''2233742119 '2233742119'
	    			        # 'user-agent' : STORIES_UA,
    	        			# 'cookie'     : STORIES_COOKIE.format('2233742119', 'IGSC08adc60729310ecefbed3c4a32d12bf5f0143326eb0d32228b8676c281cd13fa%3A2ol3I6wrIpJhsHXa2VFPNh24ayCAKFx4%3A%7B%22_auth_user_id%22%3A2233742119%2C%22_auth_user_backend%22%3A%22accounts.backends.CaseInsensitiveModelBackend%22%2C%22_auth_user_hash%22%3A%22%22%2C%22_token_ver%22%3A2%2C%22_token%22%3A%222233742119%3AE81oDAp5IlhJphgTr4NVGMJCuy1hsXK5%3A2e7274f7139ed4be8efa787502b2d38cc1acbafc6caef0c56dbaeffea411de9b%22%2C%22_platform%22%3A4%2C%22last_refreshed%22%3A1504114463.9274711609%2C%22asns%22%3A%7B%22time%22%3A1504166449%2C%22220.227.197.138%22%3A18101%7D%7D')
            				# )
                # print(res2.text
            else:
                self.login_status = False
                self.write_log('Login error! Check your login data!')
        else:
            self.write_log('Login error! Connection error!')

    def write_log(self, log):
    	print(log)

I = InstaBot()
I.login()