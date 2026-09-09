import re,sys
P='/tmp/scout9/swim-lessons/directory/schools-data.js'
raw=open(P).read()
SS=["toddler","preschool","school-age","adult"]          # SafeSplash house convention
SL=["infant","toddler","preschool","school-age","adult"] # SwimLabs house convention
SWT=["infant","toddler","preschool","school-age"]        # Swimtastic house convention
NEW=[
("ID","SafeSplash - Coeur d'Alene","SafeSplash","Coeur d'Alene","https://www.safesplashswimlabs.com/locations/coeur-d-alene-id",SS),
("TX","SafeSplash - Edinburg","SafeSplash","Edinburg","https://www.safesplashswimlabs.com/locations/edinburg-mcallen-tx",SS),
("TX","SafeSplash - Humble","SafeSplash","Humble","https://www.safesplashswimlabs.com/locations/humble-tx",SS),
("TX","SafeSplash - Katy West","SafeSplash","Katy","https://www.safesplashswimlabs.com/locations/katy-west-tx",SS),
("SC","SafeSplash - Fort Mill","SafeSplash","Fort Mill","https://www.safesplashswimlabs.com/locations/fort-mill-sc",SS),
("OH","SafeSplash - Holland","SafeSplash","Holland","https://www.safesplashswimlabs.com/locations/holland-oh",SS),
("AL","SafeSplash - Huntsville Bridge Street","SafeSplash","Huntsville","https://www.safesplashswimlabs.com/locations/huntsville-bridge-street-al",SS),
("WI","SafeSplash - Kenosha","SafeSplash","Kenosha","https://www.safesplashswimlabs.com/locations/kenosha-wi",SS),
("TN","SafeSplash - Knoxville","SafeSplash","Knoxville","https://www.safesplashswimlabs.com/locations/knoxville-cedar-bluff-tn",SS),
("TN","SafeSplash - Nashville","SafeSplash","Nashville","https://www.safesplashswimlabs.com/locations/nashville-west-tn",SS),
("CT","SafeSplash - Newington","SafeSplash","Newington","https://www.safesplashswimlabs.com/locations/newington-ct",SS),
("IA","SafeSplash - Waukee","SafeSplash","Waukee","https://www.safesplashswimlabs.com/locations/waukee-ia",SS),
("CA","SwimLabs - El Dorado Hills","SwimLabs","El Dorado Hills","https://swimlabsedh.com/",SL),
("CA","SwimLabs - Lake Forest","SwimLabs","Lake Forest","https://www.swimlabs.com/locations/orange-county-ca",SL),
("CO","SwimLabs - Highlands Ranch","SwimLabs","Highlands Ranch","https://www.swimlabs.com/locations/highlands-ranch-co",SL),
("CO","SwimLabs - Littleton","SwimLabs","Littleton","https://swimlabslittleton.com/",SL),
("UT","SwimLabs - Sandy","SwimLabs","Sandy","https://swimlabssandy.com/",SL),
("TX","SwimLabs - Sugar Land","SwimLabs","Sugar Land","https://www.swimlabs.com/locations/sugar-land-tx-sl",SL),
("TX","SwimLabs - The Woodlands","SwimLabs","The Woodlands","https://www.swimlabs.com/locations/the-woodlands-north-tx",SL),
("NY","Saf-T-Swim - Bellmore","Saf-T-Swim","Bellmore","https://www.saf-t-swim.com/locations/bellmore-ny",SS),
("NY","Saf-T-Swim - Bohemia","Saf-T-Swim","Bohemia","https://www.saf-t-swim.com/locations/bohemia-ny",SS),
("NY","Saf-T-Swim - Commack","Saf-T-Swim","Commack","https://www.saf-t-swim.com/locations/commack-ny",SS),
("NY","Saf-T-Swim - Coram","Saf-T-Swim","Coram","https://www.saf-t-swim.com/locations/coram-ny",SS),
("NY","Saf-T-Swim - Deer Park","Saf-T-Swim","Deer Park","https://www.saf-t-swim.com/locations/deer-park-ny",SS),
("NY","Saf-T-Swim - Levittown","Saf-T-Swim","Levittown","https://www.saf-t-swim.com/locations/levittown-ny",SS),
("NY","Saf-T-Swim - Little Neck","Saf-T-Swim","Little Neck","https://www.saf-t-swim.com/locations/little-neck-ny",SS),
("NY","Saf-T-Swim - Melville","Saf-T-Swim","Melville","https://www.saf-t-swim.com/locations/melville-ny",SS),
("NY","Saf-T-Swim - Nesconset","Saf-T-Swim","Nesconset","https://www.saf-t-swim.com/locations/smithtown-ny",SS),
("NY","Saf-T-Swim - New Hyde Park","Saf-T-Swim","New Hyde Park","https://www.saf-t-swim.com/locations/new-hyde-park-ny",SS),
("NY","Saf-T-Swim - Oceanside","Saf-T-Swim","Oceanside","https://www.saf-t-swim.com/locations/oceanside-ny",SS),
("NY","Saf-T-Swim - Riverhead","Saf-T-Swim","Riverhead","https://www.saf-t-swim.com/locations/riverhead-ny",SS),
("NY","Saf-T-Swim - Uniondale","Saf-T-Swim","Uniondale","https://www.saf-t-swim.com/locations/garden-city-ny",SS),
("OK","Miller Swim School - Jenks","Miller Swim School","Jenks","https://www.millerswimschool.com/locations/jenks-ok",SS),
("OK","Miller Swim School - Owasso","Miller Swim School","Owasso","https://www.millerswimschool.com/locations/owasso-ok",SS),
("OK","Miller Swim School - Tulsa","Miller Swim School","Tulsa","https://www.millerswimschool.com/locations/tulsa-ok",SS),
("OK","Miller Swim School - Tulsa South","Miller Swim School","Tulsa","https://www.millerswimschool.com/locations/tulsa-south-ok",SS),
("GA","Sharkie's Academy - Smyrna","Sharkie's Academy","Smyrna","https://sharkiesacademy.com/locations/atlanta-ga",SS),
("WI","Swimtastic - Franklin","Swimtastic","Franklin","https://www.swimtastic.com/locations/franklin-wi",SWT),
("WI","Swimtastic - Waukesha","Swimtastic","Waukesha","https://www.swimtastic.com/locations/waukesha-wi",SWT),
("NE","Swimtastic - La Vista","Swimtastic","La Vista","https://www.swimtastic.com/locations/la-vista-ne",SWT),
("NE","Swimtastic - Lincoln","Swimtastic","Lincoln","https://www.swimtastic.com/locations/lincoln-ne",SWT),
("NE","Swimtastic - Lincoln Firethorn","Swimtastic","Lincoln","https://www.swimtastic.com/locations/lincoln-the-firethorn-resort-ne",SWT),
("NE","Swimtastic - Omaha Northwest","Swimtastic","Omaha","https://www.swimtastic.com/locations/omaha-northwest-ne",SWT),
("NE","Swimtastic - Omaha Southwest","Swimtastic","Omaha","https://www.swimtastic.com/locations/omaha-southwest-ne",SWT),
("NE","Swimtastic - Elkhorn","Swimtastic","Omaha","https://www.swimtastic.com/locations/elkhorn-ne",SWT),
]
assert len(NEW)==45, len(NEW)
assert len({n[4] for n in NEW})==45, "duplicate URL in NEW"
for st,name,chain,city,url,progs in NEW:
    assert url not in raw, "already present: "+url
    line='    { name: "%s", chain: "%s", city: "%s", state: "%s", website: "%s", programs: [%s], indoor: true, yearRound: true },'%(
        name,chain,city,st,url,', '.join('"%s"'%p for p in progs))
    pat=re.compile(r'(\n  "%s": \[\n)(.*?)(\n  \],?)(?=\n)'%st, re.S)
    ms=pat.findall(raw); assert len(ms)==1, (st,len(ms))
    def rep(m): return m.group(1)+m.group(2)+'\n'+line+m.group(3)
    raw2=pat.sub(rep,raw,count=1); assert raw2!=raw; raw=raw2
open(P,'w').write(raw)
print("rows now:",len(re.findall(r'\{ name: "',raw)))
