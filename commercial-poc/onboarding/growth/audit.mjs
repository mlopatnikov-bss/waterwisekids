import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'../../../');
const config=JSON.parse(readFileSync(resolve(here,'territory-program.json'),'utf8'));
const keywordMap=JSON.parse(readFileSync(resolve(root,config.keyword_map.replace(/^\//,'')),'utf8'));
const sitemap=readFileSync(resolve(root,'sitemap.xml'),'utf8');
const errors=[];
const page=(url)=>resolve(root,url.replace(/^\//,''));
const html=(url)=>readFileSync(page(url),'utf8');
const words=(s)=>s.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&[a-z0-9#]+;/gi,' ').trim().split(/\s+/).filter(Boolean).length;
const normalized=(s)=>s.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&(?:nbsp|amp|#39|quot);/gi,' ').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();

for(const t of config.territories){
  for(const url of [t.support_guide,t.directory,...t.primary_pages]) if(!existsSync(page(url))) errors.push(`${t.key}: missing ${url}`);
  if(errors.some((e)=>e.startsWith(`${t.key}: missing`))) continue;
  const guide=html(t.support_guide);
  if(!guide.includes(`<link rel="canonical" href="https://www.waterwisekids.com${t.support_guide}">`)) errors.push(`${t.key}: support guide canonical mismatch`);
  if(words(guide)<500) errors.push(`${t.key}: support guide has fewer than 500 visible words`);
  if((guide.match(/target="_blank" rel="noopener"/g)||[]).length<3) errors.push(`${t.key}: support guide needs three official-source links`);
  if(!guide.includes(t.directory)) errors.push(`${t.key}: support guide does not link to directory`);
  if(!sitemap.includes(`https://www.waterwisekids.com${t.support_guide}`)) errors.push(`${t.key}: support guide missing from sitemap`);
  const directory=html(t.directory);
  if(t.directory_support_link!==false&&!directory.includes(t.support_guide)) errors.push(`${t.key}: directory does not link to support guide`);
  if(!t.primary_pages.some((url)=>html(url).includes(t.support_guide))) errors.push(`${t.key}: no primary page links to support guide`);
}
const finder=html(config.finder);
for(const t of config.territories) if(!finder.includes(t.support_guide)) errors.push(`${t.key}: finder omits support guide`);
for(const territory of keywordMap.territories){
  if(!config.territories.some((item)=>item.key===territory.key)) errors.push(`keyword map: unknown territory ${territory.key}`);
  for(const check of territory.page_checks){
    if(!existsSync(page(check.page))){errors.push(`${territory.key}: keyword page missing ${check.page}`);continue}
    const text=normalized(html(check.page));
    for(const concept of check.concepts){
      if(!concept.any.some((phrase)=>text.includes(normalized(phrase)))) errors.push(`${territory.key}: ${check.page} omits keyword concept ${concept.label}`);
    }
  }
}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`Territory growth audit passed: ${config.territories.length} territories, ${config.territories.reduce((n,t)=>n+t.primary_pages.length,0)} primary pages.`);
