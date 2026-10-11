const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto');
const {JSDOM}=require('jsdom');
const repo=path.resolve(process.argv[2]||'.'),out=path.resolve(process.argv[3]||'wwk-mobile-preview');
if(out===repo||repo.startsWith(out+'/'))throw Error('Output must be isolated');
const bundle=repo;fs.mkdirSync(out,{recursive:true});
const head=cp.execFileSync('git',['-C',repo,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
const js=fs.readFileSync(path.join(repo,'assets/js/wwk-v4.js'),'utf8'),css=fs.readFileSync(path.join(repo,'assets/css/wwk-v4.css'),'utf8');
function hash(b){return crypto.createHash('sha256').update(b).digest('hex')}
const manifest={base:head,files:[],scope:'Isolated static mobile candidate; no publication or agent/schedule edits'};
const files=cp.execFileSync('git',['-C',repo,'ls-files'],{encoding:'utf8'}).trim().split('\n');
(async()=>{
const selected=process.env.BUILD_FILES?process.env.BUILD_FILES.split(','):files;
for(const file of selected){
 const p=path.join(repo,file),dest=path.join(out,file);if(!fs.statSync(p).isFile())continue;
 fs.mkdirSync(path.dirname(dest),{recursive:true});let raw=fs.readFileSync(p);
 if(file.endsWith('.html')){
 const dom=new JSDOM(raw.toString(),{url:'https://www.waterwisekids.com/'+file.replace(/index\.html$/,''),runScripts:'outside-only'});const w=dom.window,d=w.document;
 if(d.querySelector('header nav') && d.body && d.head && !d.documentElement.hasAttribute("data-v4-static")){
  w.matchMedia=()=>({matches:true,addEventListener(){}});w.innerWidth=390;w.innerHeight=844;w.PerformanceObserver={supportedEntryTypes:['paint']};w.performance.getEntriesByType=()=>[];
  w.getComputedStyle=()=>({getPropertyValue:()=> '1'});w.fetch=()=>new Promise(()=>{});w.ResizeObserver=class{observe(){}};
  [...d.body.children].forEach((n,i)=>{if(!['SCRIPT','STYLE','LINK','META'].includes(n.tagName)){n.style.setProperty('--v4-original-order',i);}});
  d.documentElement.setAttribute('data-v4-static','019');
  w.eval(js);
  if(!w.__wwkV4?.built)throw Error('build failed '+file);
  d.documentElement.removeAttribute('style');
  // Keep old navigation's original attributes until runtime hydrates it.
  const hamb=d.querySelector('header .hamburger');if(hamb){hamb.removeAttribute('data-v4-open');hamb.removeAttribute('aria-controls');hamb.removeAttribute('aria-haspopup');hamb.removeAttribute('aria-expanded');}
  for(const b of d.querySelectorAll('[data-v4-open]')){
   if(b.tagName==='BUTTON'){
    const a=d.createElement('a');for(const att of b.attributes)a.setAttribute(att.name,att.value);a.removeAttribute('type');a.href=b.dataset.v4Open==='more'?'#site-map':'/education/#articleSearch';a.innerHTML=b.innerHTML;b.replaceWith(a);
   }
  }
  // Existing footer remains the no-JS More destination, without duplicating text or links.
  const foot=d.querySelector('footer');if(foot&&!d.getElementById('site-map'))foot.id='site-map';
  const legacyCss=d.createElement('link');legacyCss.rel='stylesheet';legacyCss.href='/assets/css/m-app.css?v=20261009p1';legacyCss.media='(max-width:768px)';d.head.append(legacyCss);
  const csslink=d.createElement('link');csslink.rel='stylesheet';csslink.id='wwk-v4-css';csslink.href='/assets/css/wwk-v4.css?v=019static1';d.head.append(csslink);
  const nojs=d.createElement('noscript');nojs.innerHTML='<style>.v4-program-filters{display:none!important}</style>';d.head.append(nojs);
  const script=d.createElement('script');script.src='/assets/js/wwk-v4.js?v=019static1';script.defer=true;d.head.append(script);
  // Editorial introduction stays accessible; the mobile task blocks and library take priority.
  const intro=d.querySelector('.hub-intro');if(intro){intro.classList.add('v4-editorial-mobile');intro.parentElement.setAttribute('data-v4-guide-order','');[...intro.parentElement.children].forEach((n,i)=>n.style.setProperty('--v4-original-order',i));intro.parentElement.append(intro);var details=d.createElement('details');details.open=true;details.setAttribute('data-v4-disclosure','');var sum=d.createElement('summary');sum.textContent='Water safety basics and frequently asked questions';details.append(sum);while(intro.firstChild)details.append(intro.firstChild);intro.append(details);}
  for(const sel of d.querySelectorAll('.v4-home-states select,.v4-lessons-tasks select')) {
    const data=JSON.parse(fs.readFileSync(path.join(bundle,'assets/data/wwk-v4-data.json')));
    for(const st of data.states){const opt=d.createElement('option');opt.value=st.u;opt.textContent=st.n;sel.append(opt);}sel.setAttribute('data-v4-state-static','');
  }
  const box=d.querySelector('.search-box');if(box&&file.startsWith('swim-lessons/directory/'))box.classList.add('directory-search');
  if(file==='swim-lessons/index.html'||file==='swim-lessons/directory/index.html'||/^swim-lessons\/directory\/[^/]+\.html$/.test(file)){
   d.body.setAttribute('data-v4-task-order','');
   const qa=d.querySelector('.tldr-box');if(qa&&qa.closest('section')){var qasection=qa.closest('section');qasection.setAttribute('data-v4-editorial','');var resultsection=d.querySelector('#schoolSearch')?.closest('section');if(resultsection&&resultsection!==qasection)resultsection.insertAdjacentElement('afterend',qasection);}
  }
  const html=dom.serialize();raw=Buffer.from(html);
  manifest.files.push({path:file,before:hash(fs.readFileSync(p)),after:hash(raw)});
 }
 w.close();
 }
 if(!file.endsWith(".html")){if(fs.existsSync(dest))fs.unlinkSync(dest);fs.symlinkSync(p,dest);}else fs.writeFileSync(dest,raw);
 await new Promise(setImmediate);if(global.gc)global.gc();
 if(manifest.files.length && manifest.files.length%50===0 && file.endsWith(".html"))console.log("Rendered "+manifest.files.length+" pages; RSS "+Math.round(process.memoryUsage().rss/1048576)+"MB");
}
for(const [file,data] of [['assets/css/wwk-v4.css',css],['assets/js/wwk-v4.js',js],['assets/data/wwk-v4-data.json',fs.readFileSync(path.join(repo,'assets/data/wwk-v4-data.json'))]]){const p=path.join(out,file);fs.mkdirSync(path.dirname(p),{recursive:true});if(fs.existsSync(p))fs.unlinkSync(p);fs.writeFileSync(p,data);}
fs.writeFileSync(path.join(out,'mobile-static-manifest.json'),JSON.stringify(manifest,null,2));console.log(JSON.stringify({base:head,static_pages:manifest.files.length,out}));

})().catch(e=>{console.error(e);process.exit(1)});
