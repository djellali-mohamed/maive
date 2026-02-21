import urllib.request
import json
import os

wilayas_url = 'https://raw.githubusercontent.com/AbderrahmeneDZ/Wilaya-Of-Algeria/master/Wilaya_Of_Algeria.json'
communes_url = 'https://raw.githubusercontent.com/AbderrahmeneDZ/Wilaya-Of-Algeria/master/Commune_Of_Algeria.json'

print("Fetching Wilayas...")
with urllib.request.urlopen(wilayas_url) as response:
    wilayas = json.loads(response.read().decode())

print("Fetching Communes...")
with urllib.request.urlopen(communes_url) as response:
    communes = json.loads(response.read().decode())

algeriaData = {}

for w in wilayas:
    # w might have "id", "name"
    # let's map by id
    w_id = str(w['id'])
    algeriaData[w_id] = {
        'name': w['name'],
        'communes': []
    }

for c in communes:
    w_id = str(c['wilaya_id'])
    if w_id in algeriaData:
        algeriaData[w_id]['communes'].append(c['name'])

out_path = os.path.join(os.path.dirname(__file__), '../../frontend/js/algeria-cities.js')
with open(out_path, 'w', encoding='utf-8') as f:
    f.write('const algeriaData = ' + json.dumps(algeriaData, indent=2, ensure_ascii=False) + ';')

print(f"Success! Wrote {len(algeriaData)} wilayas to {out_path}")
