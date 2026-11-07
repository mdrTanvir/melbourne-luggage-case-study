'use strict';
const data={
T1:{time:[4.769,4.952],bags:[4529.882,4699.263],automated:false,heading:'A higher average arrival time.',copy:'Mean time increased while daily baggage volume also rose. The tables show deterioration in this measure, despite the report’s narrative describing an improvement.',test:'Reported year comparison: p < .001. Direction is taken from Figure 1’s means.'},
T2:{time:[4.274,3.809],bags:[14734.899,13112.847],automated:true,heading:'Lower time. Lower workload, too.',copy:'Mean arrival time fell after scanners were added. Daily bag volume also fell by 11.0%, so the time change alone cannot isolate the effect of automation.',test:'Reported paired test: t(364) = −42.829, p < .001. This t-statistic is not seconds saved.'},
T3:{time:[7.604,6.670],bags:[4758.167,5307.622],automated:true,heading:'Lower time, despite more bags.',copy:'Mean arrival time fell while daily bag volume rose by 11.5%. This makes T3 a useful candidate for a deeper operational investigation of the observed improvement.',test:'Reported paired test: t(364) = −47.002, p < .001. Causal attribution requires further controls.'},
T4:{time:[7.170,7.137],bags:[3669.496,2798.962],automated:false,heading:'A small, inconclusive time change.',copy:'Mean arrival time fell slightly, alongside a 23.7% reduction in daily volume. The reported year comparison does not establish a change at the .05 significance threshold.',test:'Section 3.3 reports p = .088 for T4. The source table’s T2 caption appears inconsistent with that section.'}
};
let terminal='T3',metric='time';
const el=id=>document.getElementById(id);
const change=values=>(values[1]-values[0])/values[0]*100;
const pct=n=>(n>0?'+':n<0?'−':'')+Math.abs(n).toFixed(1)+'%';
const count=n=>n.toLocaleString('en-AU',{maximumFractionDigits:1,minimumFractionDigits:1});
function render(){const d=data[terminal],values=d[metric],isTime=metric==='time',max=isTime?8:16000;
document.querySelectorAll('[data-terminal]').forEach(b=>{const active=b.dataset.terminal===terminal;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
document.querySelectorAll('[data-metric]').forEach(b=>{const active=b.dataset.metric===metric;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
el('chart-title').textContent='Terminal '+terminal.slice(1);el('chart-sub').textContent=isTime?'Mean first-bag arrival time · source time units · lower is better':'Mean daily luggage handled · bags per day · workload, not capacity';
[2018,2019].forEach((year,i)=>{el('bar-'+year).style.width=(values[i]/max*100)+'%';el('value-'+year).textContent=isTime?values[i].toFixed(3):count(values[i]);});
el('axis').replaceChildren(...Array.from({length:5},(_,i)=>{const s=document.createElement('span');s.textContent=(i*max/4).toLocaleString('en-AU');return s;}));
el('comparison-chart').setAttribute('aria-label',terminal+' '+(isTime?'mean arrival time in source units':'mean bags per day')+': 2018 '+values[0]+', 2019 '+values[1]+'. Change '+pct(change(values))+'.');
el('chart-source').textContent='Source: report Figure '+(isTime?'1, printed p. 5.':'2, printed p. 6.')+' Bars share a zero baseline across terminals.';
el('finding-label').textContent='TERMINAL '+terminal.slice(1)+' / '+(d.automated?'SCANNERS ADDED':'NO NEW SCANNERS');
el('finding-stat').textContent=pct(change(d.time));el('finding-heading').textContent=d.heading;el('finding-copy').textContent=d.copy;el('time-change').textContent=pct(change(d.time));el('volume-change').textContent=pct(change(d.bags));el('finding-test').textContent=d.test;
}
document.querySelectorAll('[data-terminal]').forEach(b=>b.addEventListener('click',()=>{terminal=b.dataset.terminal;render();}));
document.querySelectorAll('[data-metric]').forEach(b=>b.addEventListener('click',()=>{metric=b.dataset.metric;render();}));
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{document.body.classList.toggle('technical-visible',b.dataset.mode==='technical');document.querySelectorAll('[data-mode]').forEach(other=>{const active=other===b;other.classList.toggle('active',active);other.setAttribute('aria-pressed',String(active));});}));
document.querySelectorAll('[data-scenario]').forEach(b=>b.addEventListener('click',()=>{const after=b.dataset.scenario==='after';el('baggage-sandbox').classList.toggle('after',after);document.querySelectorAll('[data-scenario]').forEach(other=>{const active=other===b;other.classList.toggle('active',active);other.setAttribute('aria-pressed',String(active));});el('process-title').textContent=after?'A change to investigate.':'Start with a baseline.';el('process-copy').textContent=after?'T2 and T3 recorded 10.9% and 12.3% lower mean first-bag times in 2019. These are observed terminal-level changes; the diagram does not attribute a measured saving to the scanner stage.':'2018 establishes the reference point for each terminal. The interactive lab lets you vary demand and processing speed; its queues are illustrative, not observed airport data.';}));
el('motion-toggle').addEventListener('click',()=>{const paused=document.body.classList.toggle('paused');el('motion-toggle').setAttribute('aria-pressed',String(paused));el('motion-toggle').textContent=paused?'Resume animation ▷':'Pause animation Ⅱ';});
for(const [key,d] of Object.entries(data)){const tr=document.createElement('tr');const cells=[key,d.time[0].toFixed(3),d.time[1].toFixed(3),pct(change(d.time)),count(d.bags[0]),count(d.bags[1])];cells.forEach((v,i)=>{const cell=document.createElement(i===0?'th':'td');if(i===0)cell.scope='row';cell.textContent=v;tr.append(cell);});el('data-rows').append(tr);}
el('year').textContent=String(new Date().getFullYear());render();
