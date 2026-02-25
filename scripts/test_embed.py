import urllib.request
import urllib.error

candidates = {
    # Lofi / Chill
    "Lofi Girl (Static)": "1fueZCTYkpA",
    "Chill Lofi Mix": "n61ULEU7CO0",
    
    # Jazz / Cafe
    "Coffee Shop Jazz": "aLqc8TdoLJ0",
    "Bossa Nova Cafe": "-5KAN9_CzSA",
    "Cozy Fall Jazz": "tNkZsRW7h2c",
    "Relaxing Jazz Mix": "DXUAyQQugT4",
    
    # Ghibli / Anime Piano
    "Studio Ghibli Piano": "Zz2I71wT8Z4",
    "Relaxing Anime Piano": "gN-GntBqK5k",
    "Spirited Away Mix": "jXofroEVyKA",
    
    # Synthwave / Retrowave
    "Synthwave Mix": "y7_vD6Z2qEE",
    "Chillwave": "MVPTGNGiI-4",

    # Zen
    "Japanese Zen Music": "3jWRrafhO7M",
    "Tibetan Bowls": "Qtz14g65t_o"
}

working = []

for name, vid in candidates.items():
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req)
        if response.getcode() == 200:
            working.append((name, vid))
            print(f"✅ {name} works!")
    except urllib.error.HTTPError as e:
        print(f"❌ {name} failed: {e.code}")
    except Exception as e:
        print(f"❌ {name} failed: {e}")

print("\n--- Embeddable Distinct Videos ---")
for w in working:
    print(w)
