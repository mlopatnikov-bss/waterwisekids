/*! WWK parent lesson finder. No storage, cookies, location lookup or personal data. */
(function(){
  'use strict';
  var form=document.querySelector('[data-wwk-lesson-finder]');
  if(!form)return;
  var result=form.querySelector('[data-wwk-finder-result]');
  var title=form.querySelector('[data-wwk-finder-title]');
  var copy=form.querySelector('[data-wwk-finder-copy]');
  var primary=form.querySelector('[data-wwk-finder-primary]');
  var secondary=form.querySelector('[data-wwk-finder-secondary]');
  var routes={
    pa:{label:'Philadelphia and nearby Pennsylvania suburbs',directory:'/swim-lessons/directory/pennsylvania.html',guide:'/education/philadelphia-suburbs-swim-lesson-checklist.html',general:'/swim-lessons/cheltenham-pa.html',toddler:'/toddler-swim-lessons-cheltenham-pa.html',beginner:'/beginner-swim-lessons-cheltenham-pa.html'},
    nj:{label:'Jersey Shore and central New Jersey',directory:'/swim-lessons/directory/new-jersey.html',guide:'/education/jersey-shore-swim-lesson-checklist.html',general:'/swim-lessons/jersey-shore.html',toddler:'/toddler-swim-lessons-jersey-shore.html',beginner:'/swim-lessons/howell-nj.html'},
    ny:{label:'Manhattan',directory:'/swim-lessons/directory/new-york.html',guide:'/education/manhattan-swim-lesson-checklist.html',general:'/swim-lessons/manhattan-ny.html',toddler:'/swim-lessons/manhattan-ny.html',beginner:'/swim-lessons/manhattan-ny.html'}
  };
  function show(){
    var territory=form.elements.territory.value;
    var stage=form.elements.stage.value;
    var priority=form.elements.priority.value;
    if(!routes[territory]){result.hidden=true;return;}
    var r=routes[territory];
    var href=priority==='compare'?r.directory:(priority==='prepare'?r.guide:(r[stage]||r.general));
    var label=priority==='compare'?'Compare listed programs':(priority==='prepare'?'Open the parent checklist':'See the best local starting page');
    title.textContent='Your starting point: '+r.label;
    copy.textContent=priority==='travel'?'Start with the closest practical page, then confirm the exact pool, class time, check-in process and make-up policy with each provider.':priority==='prepare'?'Use the local checklist before contacting a program so you can compare the same questions across schools.':'Review the local options and verify current details directly with each program.';
    primary.href=href;primary.textContent=label;primary.dataset.cta='lesson-finder-'+territory+'-'+priority;
    secondary.href=r.directory;secondary.dataset.cta='lesson-finder-'+territory+'-directory';
    result.hidden=false;
    result.focus();
  }
  form.addEventListener('submit',function(e){e.preventDefault();show();});
})();
