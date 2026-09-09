exec(open('/tmp/scout9/.deploy/directory-gen/gen.py').read().split('# ---- canary')[0])
import collections
files=sorted(STATE_FILE.items())
def code(h):
    c=set(re.findall(r'<strong>City:</strong> [^<]*?, ([A-Z]{2})<', h))
    return sorted(c)[0] if c else None
def chainphrase(rows):
    cnt=collections.Counter(r['chain'] for r in rows)
    ch=sorted([c for c in cnt if c!='Independent'])
    n=cnt.get('Independent',0)
    s=', '.join(ch)
    if n: s=(s+' and ' if s else '')+f"{n} independent school{'' if n==1 else 's'}"
    return s
res=collections.Counter()
fails=collections.defaultdict(list)
for fn,path in files:
    h=open(path).read(); st=code(h); rows=DATA[st]; N=len(rows)
    cities=sorted({r['city'] for r in rows})
    indoor=sum(1 for r in rows if r['indoor'])
    # 1 chain phrase
    m=re.search(r'Listings cover national and regional programs including ([^.]+)\.', h)
    if m:
        res['chain_ok' if m.group(1)==chainphrase(rows) else 'chain_BAD']+=1
        if m.group(1)!=chainphrase(rows): fails['chain'].append((fn,m.group(1),chainphrase(rows)))
    else: res['chain_absent']+=1
    # 2 schoolCount
    m=re.search(r'<div class="school-count" id="schoolCount">([^<]*)</div>',h)
    if m:
        want=f"{N} swim schools found in {{}}"
        res['count_ok' if re.fullmatch(rf'{N} swim schools found in .+', m.group(1)) else 'count_BAD']+=1
        if not re.fullmatch(rf'{N} swim schools found in .+', m.group(1)): fails['count'].append((fn,m.group(1),N))
    else: res['count_absent']+=1
    # 3 chips
    m=re.search(r'<p class="dir-city-line"[^>]*>(.*?)</p>',h,re.S)
    if m:
        want=' '.join(f'<a href="#schoolsList" class="dir-city-chip">{esc(c)} swim lessons</a>' for c in cities)
        res['chips_ok' if m.group(1)==want else 'chips_BAD']+=1
        if m.group(1)!=want: fails['chips'].append((fn,m.group(1)[:160],want[:160]))
    else: res['chips_absent']+=1
    # 4 by-city ul
    m=re.search(r'(<ul[^>]*>\s*(?:<li><strong>.*?</li>\s*)+</ul>)',h,re.S)
    if m:
        bycity=collections.OrderedDict()
        for c in cities: bycity[c]=sorted([r['name'] for r in rows if r['city']==c])
        want=''.join(f'<li><strong>{esc(c)}</strong> &mdash; {", ".join(esc(n) for n in ns)}</li>' for c,ns in bycity.items())
        got=''.join(re.findall(r'<li><strong>.*?</li>',m.group(1),re.S))
        got_n=re.sub(r'\s*\n\s*','',got)
        res['bycity_ok' if got_n==want else 'bycity_BAD']+=1
        if got_n!=want: fails['bycity'].append((fn,got_n[:200],want[:200]))
    else: res['bycity_absent']+=1
    # 5 noscript
    m=re.search(r'All (\d+) ([^ ]+(?: [^ ]+)*?) swim school listings are shown above',h)
    if m: res['nos_ok' if int(m.group(1))==N else 'nos_BAD']+=1
    else: res['nos_absent']+=1
    # 6 ItemList
    m=re.search(r'"numberOfItems": (\d+)',h); res['noi_ok' if m and int(m.group(1))==N else 'noi_BAD']+=1
    m=re.search(r'"description": "Directory of (\d+) swim schools',h); res['lddesc_ok' if m and int(m.group(1))==N else 'lddesc_BAD']+=1
    ils=re.findall(r'"@type": "LocalBusiness",\s*\n\s*"name": "([^"]*)",\s*\n\s*"url": "([^"]*)",\s*\n\s*"address": \{\s*\n\s*"@type": "PostalAddress",\s*\n\s*"addressLocality": "([^"]*)"',h)
    want=[(r['name'].replace('"','\\"'),r['website'],r['city']) for r in rows]
    res['ildetail_ok' if ils==want else 'ildetail_BAD']+=1
    if ils!=want and len(fails['il'])<1: fails['il'].append((fn,len(ils),len(want),ils[:2],want[:2]))
    # 7 titles
    for tag,pat in [('title',r'<title>([^<]*)</title>'),('og',r'og:title" content="([^"]*)"'),('tw',r'twitter:title" content="([^"]*)"')]:
        mm=re.search(pat,h)
        if mm:
            nums=re.findall(r'\b(\d+)\b',mm.group(1))
            if nums: res[f'{tag}_ok' if int(nums[0])==N else f'{tag}_BAD']+=1
            else: res[f'{tag}_nocount']+=1
    mm=re.search(r'name="description" content="([^"]*)"',h)
    nums=re.findall(r'Compare (\d+)',mm.group(1)) if mm else []
    if nums: res['desc_ok' if int(nums[0])==N else 'desc_BAD']+=1
    else: res['desc_nocount']+=1
print(json.dumps(dict(sorted(res.items())),indent=0))
for k,v in fails.items():
    print("\n--",k,len(v)); 
    for x in v[:2]: print("   ",x)
