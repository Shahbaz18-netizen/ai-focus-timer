import urllib.request
import re

url = "https://html.duckduckgo.com/html/?q=site:youtube.com+10+hours+synthwave"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req).read().decode()
    vids = re.findall(r'v=([A-Za-z0-9_-]{11})', html)
    print("Found IDs:")
    for v in set(vids):
        print(v)
except Exception as e:
    print(e)
