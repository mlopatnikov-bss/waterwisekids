import re,os,json,sys
DIR='/tmp/scout9/swim-lessons/directory'
raw=open(os.path.join(DIR,'schools-data.js')).read()

# ---- parse data.js into ordered per-state rows -------------------------------
def parse():
    data={}
    for sm in re.finditer(r"\n  \"([A-Z]{2})\": \[\n(.*?)\n  \],?(?=\n)", raw, re.S):
        st=sm.group(1); body=sm.group(2)
        rows=[]
        for line in body.split('\n'):
            line=line.strip()
            if not line.startswith('{'): continue
            def g(k):
                m=re.search(k+r': "([^"]*)"',line); return m.group(1) if m else None
            progs=re.search(r'programs: \[([^\]]*)\]',line)
            plist=[p.strip().strip('"') for p in progs.group(1).split(',')] if progs and progs.group(1).strip() else []
            rows.append(dict(name=g('name'),chain=g('chain'),city=g('city'),state=g('state'),
                website=g('website'),programs=plist,
                indoor='indoor: true' in line, yearRound='yearRound: true' in line, raw=line))
        data[st]=rows
    return data
DATA=parse()

STATE_FILE={}
for f in os.listdir(DIR):
    if f.endswith('.html') and f!='index.html': STATE_FILE[f]=os.path.join(DIR,f)

def esc(s): return s.replace('&','&amp;')
PL={'infant':'Infants','toddler':'Toddlers','preschool':'Preschool','school-age':'School-age','adult':'Adults'}

def card(r):
    badges=''.join(f'<span class="program-badge">{PL[p]}</span>' for p in r['programs'] if p in PL)
    typ=('Indoor' if r['indoor'] else 'Outdoor')+(' &bull; Year-round' if r['yearRound'] else '')
    n=esc(r['name'])
    return (f'<div class="school-card"><div class="school-header"><div>'
            f'<h3 class="school-name">{n}</h3><span class="school-chain">{esc(r["chain"])}</span>'
            f'</div></div><div class="school-info"><div><strong>City:</strong> {esc(r["city"])}, {r["state"]}</div>'
            f'<div><strong>Type:</strong> {typ}</div></div>'
            f'<div class="school-programs">{badges}</div>'
            f'<div class="school-contact"><a href="{r["website"]}" target="_blank" rel="noopener" '
            f'class="visit-site-btn" aria-label="Visit the {n} website (opens in a new tab)">Visit Website &rarr;</a>'
            f'</div></div>')

def cards(rows): return ''.join(card(r) for r in rows)

# ---- canary ------------------------------------------------------------------
report={}
for fn,path in sorted(STATE_FILE.items()):
    h=open(path).read()
    m=re.search(r'<div class="schools-list" id="schoolsList">(.*?)</div>\n    <noscript>', h, re.S)
    if not m:
        m=re.search(r'<div class="schools-list" id="schoolsList">(.*)', h, re.S)
    # find state code from a card
    cands=set(re.findall(r'<strong>City:</strong> [^<]*?, ([A-Z]{2})<', h))
    st=list(cands)[0] if len(cands)==1 else (sorted(cands)[0] if cands else None)
    if st is None or st not in DATA:
        report[fn]=('NOSTATE',st); continue
    rows=DATA[st]
    got=m.group(1) if m else ''
    # trim the trailing </div> that closes schoolsList
    got_inner=got
    want=cards(rows)
    report[fn]=('OK' if got_inner==want else 'DIFF', st, len(rows), len(got_inner), len(want))
ok=[k for k,v in report.items() if v[0]=='OK']
bad={k:v for k,v in report.items() if v[0]!='OK'}
print("CARD CANARY  ok=%d  bad=%d  (of %d)"%(len(ok),len(bad),len(report)))
for k,v in list(bad.items())[:6]: print("  ",k,v)
# show first diff detail
if bad:
    k=list(bad.keys())[0]; v=bad[k]
    if v[0]=='DIFF':
        h=open(STATE_FILE[k]).read()
        m=re.search(r'<div class="schools-list" id="schoolsList">(.*?)</div>\n    <noscript>', h, re.S)
        got=m.group(1)[:-6] if m else ''
        want=cards(DATA[v[1]])
        for i in range(min(len(got),len(want))):
            if got[i]!=want[i]:
                print("\nfirst mismatch at",i,"\nGOT :",repr(got[max(0,i-120):i+160]),"\nWANT:",repr(want[max(0,i-120):i+160]))
                break
        else:
            print("\nprefix equal; len got",len(got),"want",len(want))
            print("GOT tail:",repr(got[-300:]));print("WANT tail:",repr(want[-300:]))
