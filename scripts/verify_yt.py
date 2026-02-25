import urllib.request
import re
import time
import urllib.parse
import json

def search_and_verify(query):
    url = 'https://html.duckduckgo.com/html/?q=' + urllib.parse.quote('site:youtube.com ' + query)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        html = urllib.request.urlopen(req).read().decode()
    except Exception as e:
        return 'Error: ' + str(e)
    
    vids = re.findall(r'v=([A-Za-z0-9_-]{11})', html)
    seen = set()
    vids = [x for x in vids if not (x in seen or seen.add(x))]
    
    for vid in vids[:8]:
        try:
            yt_url = 'https://www.youtube.com/watch?v=' + vid
            yt_req = urllib.request.Request(yt_url, headers={'User-Agent': 'Mozilla/5.0'})
            yt_html = urllib.request.urlopen(yt_req).read().decode()
            
            # Check for playableInEmbed flag
            if '"playableInEmbed":true' in yt_html and '"status":"OK"' in yt_html:
                return vid
        except Exception as e:
            continue
        time.sleep(0.5)
    return 'Not found or not embeddable'

queries = {
    'lofi': 'lofi girl beats to relax study 10 hours',
    'rain': 'heavy rain window ambience 10 hours',
    'forest': '4k forest river nature sounds 10 hours',
    'cyberpunk': 'cyberpunk city window rain ambience 10 hours',
    'space': 'space station ambient sleep 10 hours',
    'library': 'dark academia library rain ambience 10 hours',
    'cabin': 'cozy cabin snow fireplace 10 hours',
    'fire': 'crackling fireplace 10 hours no music',
    'aquarium': '4k aquarium 10 hours',
    'ocean': 'tropical ocean waves beach 10 hours',
    'zen': 'japanese zen garden rain ambience',
    'jazz': 'cafe jazz bossa nova 10 hours',
    'classical': 'classical piano relaxing 10 hours'
}

for name, q in queries.items():
    print(f'{name}: {search_and_verify(q)}')
    time.sleep(1)
