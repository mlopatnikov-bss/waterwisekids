exec(open('/tmp/scout9/.deploy/directory-gen/gen.py').read().split('# ---- canary')[0])
import collections
TARGET={'ID','TX','SC','OH','AL','WI','TN','CT','IA','CA','CO','UT','NY','OK','GA','NE'}
NAMEOF={}
for fn,path in STATE_FILE.items():
    h=open(path).read()
    c=set(re.findall(r'<strong>City:</strong> [^<]*?, ([A-Z]{2})<', h))
    if len(c)==1: NAMEOF[sorted(c)[0]]=(fn,path,re.search(r'<h1>Swim Lessons in ([^<]+)</h1>',h).group(1))
def chainphrase(rows):
    cnt=collections.Counter(r['chain'] for r in rows)
    ch=sorted([c for c in cnt if c!='Independent']); n=cnt.get('Independent',0)
    s=', '.join(ch)
    if n: s=(s+' and ' if s else '')+f"{n} independent school{'' if n==1 else 's'}"
    return s
def sub1(h,pat,repl,label,fn,expect=1):
    new,k=re.subn(pat,repl,h,flags=re.S)
    assert k==expect, f"{fn}:{label} expected {expect} got {k}"
    return new
changed=[]
for st in sorted(TARGET):
    fn,path,label=NAMEOF[st]; h=open(path).read(); rows=DATA[st]; N=len(rows)
    cities=sorted({r['city'] for r in rows}); C=len(cities); IN=sum(1 for r in rows if r['indoor'])
    # 1 cards
    h=sub1(h,r'(<div class="schools-list" id="schoolsList">).*?(</div>\n    <noscript>)',
           lambda m: m.group(1)+cards(rows)+m.group(2), 'cards',fn)
    # 2 chips
    chips=' '.join(f'<a href="#schoolsList" class="dir-city-chip">{esc(c)} swim lessons</a>' for c in cities)
    h=sub1(h,r'(<p class="dir-city-line"[^>]*>).*?(</p>)', lambda m:m.group(1)+chips+m.group(2),'chips',fn)
    # 3 by-city
    bc=''.join(f'<li><strong>{esc(c)}</strong> &mdash; {", ".join(esc(n) for n in sorted(r["name"] for r in rows if r["city"]==c))}</li>' for c in cities)
    m=re.search(r'<ul[^>]*>\s*(?:<li><strong>.*?</li>\s*)+</ul>',h,re.S)
    assert m, fn+':bycity'
    block=m.group(0)
    head=block[:block.index('<li>')]; tail=block[block.rindex('</li>')+5:]
    h=h[:m.start()]+head+bc+tail+h[m.end():]
    # 4 intro numbers
    h=sub1(h,r'lists <strong>\d+ verified swim schools</strong> across \d+ cities',
           f'lists <strong>{N} verified swim schools</strong> across {C} cities','intro',fn)
    h=sub1(h,r'\d+ of the \d+ schools listed teach in an indoor pool',
           f'{IN} of the {N} schools listed teach in an indoor pool','indoor',fn)
    h=sub1(h,r'(Listings cover national and regional programs including )[^.]+\.',
           lambda m:m.group(1)+chainphrase(rows)+'.','chains',fn)
    # 5 schoolCount
    h=sub1(h,r'(<div class="school-count" id="schoolCount">)\d+( swim schools found in )',
           lambda m:m.group(1)+str(N)+m.group(2),'schoolCount',fn)
    # 6 noscript
    h=sub1(h,r'All \d+( [^<]*? swim school listings are shown above)',
           lambda m:f'All {N}'+m.group(1),'noscript',fn)
    # 7 ItemList
    h=sub1(h,r'"numberOfItems": \d+', f'"numberOfItems": {N}','noi',fn)
    h=sub1(h,r'"description": "Directory of \d+ swim schools', f'"description": "Directory of {N} swim schools','lddesc',fn)
    items=[]
    for i,r in enumerate(rows,1):
        items.append('    {\n      "@type": "ListItem",\n      "position": %d,\n      "item": {\n        "@type": "LocalBusiness",\n        "name": "%s",\n        "url": "%s",\n        "address": {\n          "@type": "PostalAddress",\n          "addressLocality": "%s",\n          "addressRegion": "%s",\n          "addressCountry": "US"\n        }\n      }\n    }'%(i,r['name'].replace('"','\\"'),r['website'],r['city'],r['state']))
    h=sub1(h,r'("@type": "ItemList".*?"itemListElement": \[\n).*?(\n  \]\n\})',
           lambda m:m.group(1)+',\n'.join(items)+m.group(2),'itemList',fn)
    # 8 titles / desc (only where a count exists)
    for pat,lab in [(r'(<title>Swim Lessons in [^<]*?: )\d+( Swim Schools)',(1)),
                    (r'(og:title" content="Swim Lessons in [^"]*?: )\d+( Swim Schools)',2),
                    (r'(twitter:title" content="Swim Lessons in [^"]*?: )\d+( Swim Schools)',3)]:
        h2,k=re.subn(pat,lambda m:m.group(1)+str(N)+m.group(2),h)
        h=h2
    h2,k=re.subn(r'(content="Compare )\d+',lambda m:m.group(1)+str(N),h); h=h2
    open(path,'w').write(h); changed.append((fn,N,C,IN))
print("pages rewritten:",len(changed))
for c in changed: print("  ",c)
