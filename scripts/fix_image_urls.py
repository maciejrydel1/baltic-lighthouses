#!/usr/bin/env python3
"""
Skrypt naprawiający URL-e zdjęć z Wikimedia Commons.
Pobiera poprawne URL-e przez API.
"""

import json
import subprocess
import urllib.parse
import re
import os

# Ścieżka do pliku
GEOJSON_PATH = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'lighthouses.geojson')

def get_wikimedia_url(filename):
    """Pobierz poprawny URL z Wikimedia API przez curl"""
    encoded = urllib.parse.quote(filename)
    api_url = f"https://commons.wikimedia.org/w/api.php?action=query&titles=File:{encoded}&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json"

    try:
        result = subprocess.run(
            ['curl', '-s', '-A', 'Mozilla/5.0 LighthouseProject/1.0', api_url],
            capture_output=True, text=True, timeout=30
        )
        data = json.loads(result.stdout)
        pages = data['query']['pages']
        page = list(pages.values())[0]
        if 'imageinfo' in page:
            # Preferuj thumburl (mniejszy rozmiar), fallback na pełny url
            return page['imageinfo'][0].get('thumburl') or page['imageinfo'][0].get('url')
    except Exception as e:
        print(f"  Error: {e}")
    return None

def extract_filename(url):
    """Wyciągnij nazwę pliku z URL Wikimedia"""
    if not url:
        return None
    # Wzorzec dla thumbnail: .../thumb/hash/filename/widthpx-filename
    # Wzorzec dla pełnego: .../hash/filename
    match = re.search(r'/([^/]+\.(jpg|jpeg|png|gif))(?:/|$)', url, re.IGNORECASE)
    if match:
        return urllib.parse.unquote(match.group(1))
    return None

def main():
    # Wczytaj dane
    with open(GEOJSON_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    fixed = 0
    failed = 0

    for feature in data['features']:
        props = feature['properties']
        name = props.get('name', 'Unknown')
        old_url = props.get('imageUrl')

        if not old_url or old_url == 'null':
            print(f"⏭️  {name}: brak URL")
            continue

        if 'wikimedia' not in str(old_url):
            print(f"⏭️  {name}: nie-Wikimedia URL")
            continue

        filename = extract_filename(old_url)
        if not filename:
            print(f"❌ {name}: nie można wyciągnąć nazwy pliku")
            failed += 1
            continue

        print(f"🔄 {name}: {filename}")
        new_url = get_wikimedia_url(filename)

        if new_url:
            props['imageUrl'] = new_url
            print(f"   ✅ -> {new_url[:60]}...")
            fixed += 1
        else:
            print(f"   ❌ nie udało się pobrać URL")
            failed += 1

    # Zapisz
    with open(GEOJSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Naprawiono: {fixed}")
    print(f"❌ Błędów: {failed}")

if __name__ == '__main__':
    main()
