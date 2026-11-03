/*! WWK sponsored CTA experiment v2. Per-page random assignment; no storage or identity. */
(function(w){
  'use strict';
  var d=w&&w.document;if(!d||w.__wwkSponsoredCtaTest)return;w.__wwkSponsoredCtaTest=true;
  var variants=[{key:'current_classes',label:'View current classes'},{key:'check_availability',label:'Check availability'}];
  function choose(){try{var b=new Uint8Array(1);w.crypto.getRandomValues(b);return variants[b[0]%2];}catch(e){return variants[0];}}
  function replaceLabel(a,label){for(var i=0;i<a.childNodes.length;i++){if(a.childNodes[i].nodeType===3&&a.childNodes[i].nodeValue.trim()){a.childNodes[i].nodeValue=label;return;}}a.insertBefore(d.createTextNode(label),a.firstChild);}
  function send(card,a,v){
    try{
      w.dataLayer=w.dataLayer||[];
      (function(){w.dataLayer.push(arguments);})('event','sponsor_cta_'+v.key,{experiment_id:'sponsor_cta_v1',variant:v.key,placement_id:card.getAttribute('data-wwk-placement'),destination_id:a.getAttribute('data-wwk-destination'),source_path:w.location.pathname,send_to:'G-KP7R3NLS4F',transport_type:'beacon'});
    }catch(e){}
  }
  function apply(card){
    var links=card.querySelectorAll('.wwk-sponsored__links a[data-wwk-destination]');if(!links.length)return;
    var a=null;for(var i=0;i<links.length;i++)if(!links[i].hasAttribute('data-wwk-location'))a=links[i];
    if(!a)a=links[links.length-1];
    var v=choose();replaceLabel(a,v.label);a.setAttribute('data-wwk-cta-variant',v.key);
    try{var u=new URL(a.href,w.location.href);u.searchParams.set('utm_term','cta_'+v.key);a.href=u.toString();}catch(e){}
    a.addEventListener('click',function(){send(card,a,v);},{capture:true});
  }
  function init(){var cards=d.querySelectorAll('[data-wwk-sponsored-card]');for(var i=0;i<cards.length;i++)apply(cards[i]);}
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',init);else init();
})(typeof window!=='undefined'?window:undefined);
