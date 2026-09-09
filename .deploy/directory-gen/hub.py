exec(open('/tmp/scout9/.deploy/directory-gen/gen.py').read().split('# ---- canary')[0])
import collections
P='/tmp/scout9/swim-lessons/directory/index.html'
h=open(P).read()
allrows=[r for rs in DATA.values() for r in rs]
N=len(allrows); PAIRS=len({(r['city'],r['state']) for r in allrows}); IN=sum(1 for r in allrows if r['indoor'])
cnt=collections.Counter(r['chain'] for r in allrows)
states=collections.defaultdict(set)
for r in allrows: states[r['chain']].add(r['state'])
print("N",N,"pairs",PAIRS,"indoor",IN)
def rep(pat,new,exp,label):
    global h
    h2,k=re.subn(pat,new,h,flags=re.S); assert k==exp, f"{label}: expected {exp} got {k}"; h=h2
rep(r'\b770\b',str(N),15,'rowtotal')
rep(r'\b551\b',str(PAIRS),6,'pairs')
rep(r'\b767\b',str(IN),1,'indoor')
rep(r'\b38 independent\b',f"{cnt['Independent']} independent",2,'indep')
# narrative: rebuild the ranked sentence
top=[c for c,_ in sorted(cnt.items(),key=lambda x:(-x[1],x[0])) if c!='Independent'][:3]
sent=(f"{top[0]} is the largest chain in our directory with {cnt[top[0]]} locations across {len(states[top[0]])} states, "
      f"followed by {top[1]} with {cnt[top[1]]} locations in {len(states[top[1]])} states and {top[2]} with {cnt[top[2]]} locations in {len(states[top[2]])} states.")
rep(r'Goldfish Swim School is the largest chain in our directory with 218 locations across 40 states, followed by Aqua-Tots with 144 locations in 28 states and SafeSplash with \d+ locations in 27 states\.',
    sent.replace('\\','\\\\'),2,'narrative')
# table tbody
TD='style="padding:.55rem .7rem;border-bottom:1px solid #e2e8f0;'
rows_html=''
for c,n in sorted(cnt.items(),key=lambda x:(-x[1],x[0])):
    if c=='Independent' or n<9: continue
    rows_html+=(f'<tr><td {TD}font-weight:600;color:#0f172a;">{c}</td>'
                f'<td {TD}text-align:right;">{n}</td>'
                f'<td {TD}text-align:right;">{len(states[c])}</td></tr>')
rep(r'(by number of listed locations\..*?<tbody>).*?(</tbody>)', lambda m: m.group(1)+rows_html+m.group(2),1,'table')
open(P,'w').write(h)
print("hub table chains:",[ (c,cnt[c],len(states[c])) for c,n in sorted(cnt.items(),key=lambda x:(-x[1],x[0])) if c!='Independent' and n>=9])
print("narrative:",sent)
