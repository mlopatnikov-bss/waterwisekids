import re,json
s=open('/tmp/scout9/swim-lessons/directory/schools-data.js').read()
rows=[m for m in re.finditer(r'\{ name: "([^"]+)", chain: "([^"]+)", city: "([^"]+)", state: "([^"]+)".*?website: "([^"]*)"', s)]
urls={r.group(5) for r in rows}
by_cs={}
for r in rows: by_cs.setdefault((r.group(3).lower(),r.group(4)),[]).append((r.group(1),r.group(2),r.group(5)))
H=[
("SafeSplash","SafeSplash - Coeur d'Alene","Coeur d'Alene","ID","https://www.safesplashswimlabs.com/locations/coeur-d-alene-id"),
("SafeSplash","SafeSplash - Edinburg","Edinburg","TX","https://www.safesplashswimlabs.com/locations/edinburg-mcallen-tx"),
("SafeSplash","SafeSplash - Fort Mill","Fort Mill","SC","https://www.safesplashswimlabs.com/locations/fort-mill-sc"),
("SafeSplash","SafeSplash - Holland","Holland","OH","https://www.safesplashswimlabs.com/locations/holland-oh"),
("SafeSplash","SafeSplash - Humble","Humble","TX","https://www.safesplashswimlabs.com/locations/humble-tx"),
("SafeSplash","SafeSplash - Huntsville Bridge Street","Huntsville","AL","https://www.safesplashswimlabs.com/locations/huntsville-bridge-street-al"),
("SafeSplash","SafeSplash - Katy West","Katy","TX","https://www.safesplashswimlabs.com/locations/katy-west-tx"),
("SafeSplash","SafeSplash - Kenosha","Kenosha","WI","https://www.safesplashswimlabs.com/locations/kenosha-wi"),
("SafeSplash","SafeSplash - Knoxville","Knoxville","TN","https://www.safesplashswimlabs.com/locations/knoxville-cedar-bluff-tn"),
("SafeSplash","SafeSplash - Nashville","Nashville","TN","https://www.safesplashswimlabs.com/locations/nashville-west-tn"),
("SafeSplash","SafeSplash - Newington","Newington","CT","https://www.safesplashswimlabs.com/locations/newington-ct"),
("SafeSplash","SafeSplash - Waukee","Waukee","IA","https://www.safesplashswimlabs.com/locations/waukee-ia"),
("SwimLabs","SwimLabs - El Dorado Hills","El Dorado Hills","CA","https://swimlabsedh.com/"),
("SwimLabs","SwimLabs - Highlands Ranch","Highlands Ranch","CO","https://www.swimlabs.com/locations/highlands-ranch-co"),
("SwimLabs","SwimLabs - Lake Forest","Lake Forest","CA","https://www.swimlabs.com/locations/orange-county-ca"),
("SwimLabs","SwimLabs - Littleton","Littleton","CO","https://swimlabslittleton.com/"),
("SwimLabs","SwimLabs - Sandy","Sandy","UT","https://swimlabssandy.com/"),
("SwimLabs","SwimLabs - Sugar Land","Sugar Land","TX","https://www.swimlabs.com/locations/sugar-land-tx-sl"),
("SwimLabs","SwimLabs - The Woodlands","The Woodlands","TX","https://www.swimlabs.com/locations/the-woodlands-north-tx"),
("Saf-T-Swim","Saf-T-Swim - Bellmore","Bellmore","NY","https://www.saf-t-swim.com/locations/bellmore-ny"),
("Saf-T-Swim","Saf-T-Swim - Bohemia","Bohemia","NY","https://www.saf-t-swim.com/locations/bohemia-ny"),
("Saf-T-Swim","Saf-T-Swim - Commack","Commack","NY","https://www.saf-t-swim.com/locations/commack-ny"),
("Saf-T-Swim","Saf-T-Swim - Coram","Coram","NY","https://www.saf-t-swim.com/locations/coram-ny"),
("Saf-T-Swim","Saf-T-Swim - Deer Park","Deer Park","NY","https://www.saf-t-swim.com/locations/deer-park-ny"),
("Saf-T-Swim","Saf-T-Swim - Levittown","Levittown","NY","https://www.saf-t-swim.com/locations/levittown-ny"),
("Saf-T-Swim","Saf-T-Swim - Little Neck","Little Neck","NY","https://www.saf-t-swim.com/locations/little-neck-ny"),
("Saf-T-Swim","Saf-T-Swim - Melville","Melville","NY","https://www.saf-t-swim.com/locations/melville-ny"),
("Saf-T-Swim","Saf-T-Swim - Nesconset","Nesconset","NY","https://www.saf-t-swim.com/locations/smithtown-ny"),
("Saf-T-Swim","Saf-T-Swim - New Hyde Park","New Hyde Park","NY","https://www.saf-t-swim.com/locations/new-hyde-park-ny"),
("Saf-T-Swim","Saf-T-Swim - Oceanside","Oceanside","NY","https://www.saf-t-swim.com/locations/oceanside-ny"),
("Saf-T-Swim","Saf-T-Swim - Riverhead","Riverhead","NY","https://www.saf-t-swim.com/locations/riverhead-ny"),
("Saf-T-Swim","Saf-T-Swim - Uniondale","Uniondale","NY","https://www.saf-t-swim.com/locations/garden-city-ny"),
("Miller Swim School","Miller Swim School - Jenks","Jenks","OK","https://www.millerswimschool.com/locations/jenks-ok"),
("Miller Swim School","Miller Swim School - Owasso","Owasso","OK","https://www.millerswimschool.com/locations/owasso-ok"),
("Miller Swim School","Miller Swim School - Tulsa","Tulsa","OK","https://www.millerswimschool.com/locations/tulsa-ok"),
("Miller Swim School","Miller Swim School - Tulsa South","Tulsa","OK","https://www.millerswimschool.com/locations/tulsa-south-ok"),
("Sharkie's Academy","Sharkie's Academy - Smyrna","Smyrna","GA","https://sharkiesacademy.com/locations/atlanta-ga"),
("Swimtastic","Swimtastic - Franklin","Franklin","WI","https://www.swimtastic.com/locations/franklin-wi"),
("Swimtastic","Swimtastic - Waukesha","Waukesha","WI","https://www.swimtastic.com/locations/waukesha-wi"),
("Swimtastic","Swimtastic - La Vista","La Vista","NE","https://www.swimtastic.com/locations/la-vista-ne"),
("Swimtastic","Swimtastic - Lincoln","Lincoln","NE","https://www.swimtastic.com/locations/lincoln-ne"),
("Swimtastic","Swimtastic - Lincoln Firethorn","Lincoln","NE","https://www.swimtastic.com/locations/lincoln-the-firethorn-resort-ne"),
("Swimtastic","Swimtastic - Omaha Southwest","Omaha","NE","https://www.swimtastic.com/locations/omaha-southwest-ne"),
("Swimtastic","Swimtastic - Omaha Northwest","Omaha","NE","https://www.swimtastic.com/locations/omaha-northwest-ne"),
("Swimtastic","Swimtastic - Elkhorn","Omaha","NE","https://www.swimtastic.com/locations/elkhorn-ne"),
]
dup=[];new=[]
for chain,name,city,st,url in H:
    if url in urls: dup.append((name,url,"URL ALREADY LISTED")); continue
    same=[x for x in by_cs.get((city.lower(),st),[]) if x[1]==chain]
    new.append((chain,name,city,st,url,same))
print("ALREADY LISTED BY URL:",len(dup))
for d in dup: print("   ",d[0])
print("\nNEW ROWS:",len(new))
for c,n,city,st,u,same in new:
    flag = "  <-- SAME-CHAIN ROW IN CITY: %s"%same if same else ""
    print(f"   {st} | {n} | {u}{flag}")
states={}
for c,n,city,st,u,s2 in new: states[st]=states.get(st,0)+1
print("\nBY STATE:",states)
