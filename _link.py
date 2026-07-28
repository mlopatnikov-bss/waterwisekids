import os, re, json
from bs4 import BeautifulSoup
edu="education"
slugs=set(os.listdir(edu))

# (target, [(phrase_regex, dest_slug, display_optional)])  first valid match per pair inserted
PLAN={
"boating-safety-children.html":[
  (r"life jacket requirements","life-jacket-guide.html"),
  (r"cold water","cold-water-shock.html"),
  (r"emergency preparedness","cpr-basics-parents.html"),
  (r"fall overboard","open-water-survival-skills.html"),
],
"swim-clinics-intensive-camps.html":[
  (r"formal swim lessons","choosing-a-swim-school.html"),
  (r"competitive team","swim-team-readiness.html"),
  (r"private lessons","private-vs-group-swim-lessons.html"),
  (r"weekly lessons","intensive-vs-weekly-swim-lessons.html"),
],
"open-water-survival-skills.html":[
  (r"survival float","teach-child-to-float.html"),
  (r"rip current","rip-current-safety.html"),
  (r"cold water","cold-water-shock.html"),
  (r"self-rescue","two-self-rescue-skills-children.html"),
],
"bath-time-safety-infants.html":[
  (r"constant supervision","drowning-prevention-guide.html"),
  (r"water confidence","toddler-water-safety.html"),
  (r"swim lessons","when-to-start-swim-lessons.html"),
  (r"safety devices","pool-safety-rules.html"),
],
"measuring-swimming-progress.html":[
  (r"swim milestones","swim-milestones-by-age.html"),
  (r"ribbons?","ribbon-reward-system-swim-lessons.html"),
  (r"safety skills","water-safety-beyond-the-pool.html"),
  (r"goal setting|goals","swim-lesson-goal-setting-worksheet.html"),
],
"isr-vs-traditional-swim-lessons.html":[
  (r"when to start","when-to-start-swim-lessons.html"),
  (r"self-rescue","can-babies-learn-self-rescue.html"),
  (r"cost","swim-lessons-cost.html"),
  (r"group or private|group lessons","intensive-vs-weekly-swim-lessons.html"),
],
"two-self-rescue-skills-children.html":[
  (r"survival float","teach-child-to-float.html"),
  (r"open water","open-water-survival-skills.html"),
  (r"home pool","self-rescue-home-pool-practice.html"),
  (r"street clothes","survival-swim-street-clothes-science.html"),
],
"child-swimming-nutrition-hydration.html":[
  (r"heat illness|overheating","heat-illness-young-swimmers.html"),
  (r"swimmer'?s? ear","swimmers-ear-prevention.html"),
  (r"sunscreen","sunscreen-swimmers-guide.html"),
  (r"competitive swim","competitive-swimming-safety.html"),
],
}

def in_link_or_tag(pre):
    # inside a tag?
    if pre.rfind("<")>pre.rfind(">"): return True
    # inside an anchor?
    if pre.rfind("<a ")>pre.rfind("</a>"): return True
    return False

report={}
for tgt,pairs in PLAN.items():
    path=os.path.join(edu,tgt)
    html=open(path,encoding="utf-8").read()
    ms=html.find("<main"); me=html.find("</main>")
    if ms<0: ms=0
    if me<0: me=len(html)
    added=[]
    for phrase,dest in pairs:
        if len(added)>=3: break
        if dest not in slugs:
            continue
        # find first valid occurrence in main body region, in text, not in link, not already adjacent link
        for m in re.finditer(phrase,html[ms:me],re.I):
            gs=ms+m.start(); ge=ms+m.end()
            pre=html[:gs]
            if in_link_or_tag(pre): continue
            # avoid double-space/tag right after (ensure plain text char after)
            after=html[ge:ge+1]
            if after=="<": 
                # phrase ends right before a tag; still ok but skip to be safe if next is </a
                pass
            matched=html[gs:ge]
            repl=f'<a href="/education/{dest}">{matched}</a>'
            html=html[:gs]+repl+html[ge:]
            # shift me
            me+=len(repl)-len(matched)
            added.append((matched,dest))
            break
    if added:
        open(path,"w",encoding="utf-8").write(html)
    report[tgt]=added

for t,a in report.items():
    print(t)
    for txt,d in a: print(f"    '{txt}' -> {d}")
    if not a: print("    (none inserted)")
json.dump(report,open("/tmp/wwk-link/_report.json","w"))
