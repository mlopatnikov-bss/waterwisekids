import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root=resolve(import.meta.dirname,'../../..');
test('growth program: all three territories pass the reusable activation audit',()=>{
  const r=spawnSync(process.execPath,[resolve(root,'commercial-poc/onboarding/growth/audit.mjs')],{encoding:'utf8'});
  assert.equal(r.status,0,r.stderr||r.stdout);
  assert.match(r.stdout,/3 territories/);
});
test('parent finder is privacy-preserving and has accessible result handling',()=>{
  const js=readFileSync(resolve(root,'assets/js/lesson-finder.js'),'utf8');
  const html=readFileSync(resolve(root,'find-swim-lessons.html'),'utf8');
  const executable=js.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'');
  assert.doesNotMatch(executable,/localStorage|sessionStorage|cookie|geolocation|fetch\(/i);
  assert.match(html,/aria-live="polite"/);
  assert.match(html,/does not ask for a ZIP code, store personal information or rank schools/i);
});
test('CTA experiment is anonymous, balanced and installed on all pilot guide cards',()=>{
  const js=readFileSync(resolve(root,'assets/js/wwk-sponsored-cta-test.js'),'utf8');
  const executable=js.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'');
  assert.doesNotMatch(executable,/localStorage|sessionStorage|document\.cookie|geolocation|email|phone/i);
  assert.match(js,/current_classes/);assert.match(js,/check_availability/);assert.match(js,/utm_term/);
  assert.match(js,/sponsor_cta_experiment_click/);assert.match(js,/placement_id/);assert.match(js,/destination_id/);
  const pages=['swim-lessons/cheltenham-pa.html','swim-lessons/howell-nj.html','swim-lessons/brick-nj.html','swim-lessons-toms-river-nj.html','swim-lessons/manhattan-ny.html','swim-lessons/northwest-philadelphia.html','swim-lessons/philadelphia.html','swim-lessons/jersey-shore.html'];
  for(const file of pages)assert.match(readFileSync(resolve(root,file),'utf8'),/wwk-sponsored-cta-test\.js\?v=1/,file);
  assert.doesNotMatch(readFileSync(resolve(root,'swim-lessons/directory/new-york.html'),'utf8'),/wwk-sponsored-cta-test/,'pinned directory stays unchanged');
});
