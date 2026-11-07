'use strict';
(() => {
  const byId = id => document.getElementById(id);
  const svg = byId('simulation-svg');
  const layer = byId('sim-bags');
  const ns = 'http://www.w3.org/2000/svg';
  const demand = byId('arrival-rate');
  const speed = byId('processing-speed');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let bags = [], nextId = 1, delivered = 0, selected = null, automated = false;
  let running = !reducedMotion.matches, last = 0, spawnClock = 0, readoutClock = 0;
  let visible = false;
  const palette = ['#e3aa63', '#b6d391', '#9ebdc8', '#d4a0a0'];
  const make = (name, attrs) => { const n=document.createElementNS(ns,name); for (const [k,v] of Object.entries(attrs)) n.setAttribute(k,v); return n; };
  const statusOf = b => ({approach:'Waiting to enter the scanner',scan:'Being scanned',out:'Travelling to the carousel',arrived:'Arrived at the carousel'})[b.phase];
  function inspect(b) {
    selected = b.id;
    byId('bag-status').textContent = `Bag ${b.id}: ${statusOf(b)}.`;
    for(const other of bags) other.node.classList.toggle('selected-bag',other.id===selected);
  }
  function addBag() {
    if (bags.filter(b => b.phase!=='arrived').length >= 36) {
      byId('sim-feedback').textContent='The demo belt is full (36 bags). Reduce arrivals or increase processing speed to clear the queue.';
      return false;
    }
    const b={id:nextId++,phase:'approach',x:40,y:150,progress:0,scan:0,age:0};
    const g=make('g',{role:'button',tabindex:'0','aria-label':`Inspect bag ${b.id}`,class:'sim-bag',transform:'translate(40 150)'});
    g.append(make('circle',{cx:0,cy:-2,r:21,fill:'none',stroke:'#234f43','stroke-width':2,class:'bag-halo'}));
    g.append(make('rect',{x:-12,y:-16,width:24,height:30,rx:4,fill:palette[(b.id-1)%palette.length],stroke:'#254c3f','stroke-width':1.8}));
    g.append(make('path',{d:'M-5-17v-6H5v6M-5-9V8M5-9V8',fill:'none',stroke:'#254c3f','stroke-width':1.8}));
    g.append(make('text',{x:0,y:4,'text-anchor':'middle','font-family':'ui-monospace,monospace','font-size':8,fill:'#183f3a'}));
    g.lastChild.textContent=String(b.id);
    g.addEventListener('click',()=>inspect(b));
    g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();inspect(b);}});
    b.node=g; layer.append(g); bags.push(b); return true;
  }
  function updateReadouts() {
    byId('sim-queue').textContent=String(bags.filter(b=>b.phase==='approach').length);
    byId('sim-delivered').textContent=String(delivered);
    byId('sim-active').textContent=String(bags.filter(b=>b.phase!=='arrived').length);
    const queue=bags.filter(b=>b.phase==='approach').length;
    byId('sim-queue-alert').setAttribute('visibility',queue>=5?'visible':'hidden');
    byId('scanner-light').setAttribute('fill',bags.some(b=>b.phase==='scan')?'#f2c365':'#c3ed9c');
    byId('sim-mode-label').textContent=automated?'AUTOMATED SCANNING':'BASELINE SCANNING';
  }
  function updateControls() {
    const n=Number(demand.value);
    byId('arrival-output').textContent=n<=1?'Quiet':n<=3?'Moderate':n<=5?'Busy':'Rush';
    byId('speed-output').textContent=speed.value+'%';
  }
  function syncPauseButton() {
    document.body.classList.toggle('paused',!running);
    byId('motion-toggle').setAttribute('aria-pressed',String(!running));
    byId('motion-toggle').textContent=running?'Pause animation Ⅱ':'Start animation ▷';
    byId('lab-play').textContent=running?'Pause lab Ⅱ':'Start lab ▷';
    byId('lab-play').setAttribute('aria-pressed',String(!running));
  }
  function reset() {
    bags=[]; layer.replaceChildren(); nextId=1;delivered=0;selected=null;spawnClock=0;readoutClock=0;
    byId('bag-status').textContent='Select any moving bag to follow its journey.';
    addBag(); updateReadouts();
    byId('sim-feedback').textContent='Fresh run. Adjust arrivals, add a bag, or switch scanning modes.';
  }
  function tick(dt) {
    spawnClock+=dt;
    const interval=3.6/Number(demand.value);
    if(spawnClock>=interval) {spawnClock=0;addBag();}
    let occupied=bags.some(b=>b.phase==='scan');
    const waiting=bags.filter(b=>b.phase==='approach');
    waiting.forEach((b,i)=>{
      const tx=276-(i%7)*31, ty=150+Math.floor(i/7)*32;
      const dx=tx-b.x,dy=ty-b.y,length=Math.hypot(dx,dy);
      if(length>0) {const t=Math.min(1,dt*95/length);b.x+=dx*t;b.y+=dy*t;}
      if(i===0 && !occupied && Math.hypot(tx-b.x,ty-b.y)<2) {b.phase='scan';b.x=349;b.y=150;b.scan=0;occupied=true;}
    });
    for(const b of bags) {
      b.age+=dt;
      if(b.phase==='scan') {
        b.scan+=dt;
        const duration=(automated?1.05:2.6)*100/Number(speed.value);
        b.x=329+Math.min(1,b.scan/duration)*38;
        if(b.scan>=duration) {b.phase='out';b.progress=0;}
      } else if(b.phase==='out') {
        b.progress+=dt*92;
        const d=b.progress;
        if(d<200) {b.x=373+d;b.y=150;}
        else if(d<260) {const t=(d-200)/60;b.x=573+37*Math.sin(t*Math.PI/2);b.y=150+45*(1-Math.cos(t*Math.PI/2));}
        else if(d<355) {const t=(d-260)/95;b.x=610+70*t;b.y=195+60*Math.sin(t*Math.PI/2);}
        else {b.phase='arrived';b.arrivalAge=0;delivered++;if(b.id===selected)byId('bag-status').textContent=`Bag ${b.id}: Arrived at the carousel.`;}
      } else if(b.phase==='arrived') {
        b.arrivalAge+=dt;b.node.style.opacity=String(Math.max(0,1-b.arrivalAge/1.3));
      }
      b.node.setAttribute('transform',`translate(${b.x.toFixed(1)} ${b.y.toFixed(1)})`);
      if(b.id===selected && b.phase!=='arrived') {const status=`Bag ${b.id}: ${statusOf(b)}.`;if(byId('bag-status').textContent!==status)byId('bag-status').textContent=status;}
    }
    bags=bags.filter(b=>{if(b.phase==='arrived' && b.arrivalAge>1.3){b.node.remove();return false;}return true;});
    byId('scan-beam').setAttribute('transform',`translate(0 ${Math.sin(performance.now()/140)*12+8})`);
    readoutClock+=dt;
    if(readoutClock>.15) {readoutClock=0;updateReadouts();}
  }
  function frame(now) {
    if(last && running && visible && !document.hidden) tick(Math.min((now-last)/1000,.06));
    last=now; requestAnimationFrame(frame);
  }
  demand.addEventListener('input',()=>{updateControls();byId('sim-feedback').textContent='Arrival pressure changed. Watch how many bags wait before the scanner.';});
  speed.addEventListener('input',()=>{updateControls();byId('sim-feedback').textContent='Processing speed changed. The scanner now completes bags at a different illustrative rate.';});
  byId('add-bag').addEventListener('click',()=>{if(addBag())byId('sim-feedback').textContent=`Bag ${nextId-1} added. Select it on the belt to follow its journey.`;updateReadouts();});
  byId('reset-sim').addEventListener('click',reset);
  byId('rush-hour').addEventListener('click',()=>{demand.value='8';for(let i=0;i<5;i++)addBag();updateControls();updateReadouts();byId('sim-feedback').textContent='Rush started: five bags added and arrivals increased. Try automated mode or a higher processing speed.';});
  byId('motion-toggle').addEventListener('click',()=>{running=!running;syncPauseButton();});
  byId('lab-play').addEventListener('click',()=>{running=!running;syncPauseButton();});
  document.querySelectorAll('[data-scenario]').forEach(button=>button.addEventListener('click',()=>{
    automated=button.dataset.scenario==='after';
    byId('sim-feedback').textContent=automated?'Automated mode uses a faster illustrative service rate. Watch the existing queue respond.':'Baseline mode uses a slower illustrative service rate. Demand and existing bags are preserved.';
    updateReadouts();
  }));
  reducedMotion.addEventListener('change',e=>{if(e.matches){running=false;syncPauseButton();}});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;},{rootMargin:'100px'}).observe(byId('baggage-sandbox'));
  updateControls();reset();syncPauseButton();requestAnimationFrame(frame);
})();
