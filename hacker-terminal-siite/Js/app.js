/* Utility */
const qs = s => document.querySelector(s);
const qsa = s => [...document.querySelectorAll(s)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/* Matrix Rain */
const canvas = qs('#matrix');
const ctx = canvas.getContext('2d');
const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
resize(); addEventListener('resize', resize);
const glyphs = '01░▒▓█▚▝▗▐▌▖▙▜▛⚡⟊⟡⟢⟣⟤⟧⟨⟩⌁⟇⟞⟟⟡';
const fontSize = 16; const columns = () => Math.floor(canvas.width / fontSize);
let drops = Array(columns()).fill(1);
function matrixStep(){
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--green') || '#22ff88';
  ctx.font = fontSize + 'px "Share Tech Mono", monospace';
  for(let i=0;i<drops.length;i++){
    const text = glyphs.charAt(rand(0,glyphs.length-1));
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);
    if(drops[i] * fontSize > canvas.height && Math.random() > 0.975){ drops[i] = 0; }
    drops[i]++;
  }
}
setInterval(matrixStep, 42);
addEventListener('resize', () => { drops = Array(columns()).fill(1); });

/* Boot text */
const term = qs('#term');
const bootLines = [
  '[BOOT] vector unit online',
  '[BOOT] entropy pool: seeded',
  '[NET]  handshake: x25519 + chacha20-poly1305',
  '[AUTH] rotating keys... ok',
  '[FS]   mounting /dev/ghost on /mnt/blackice',
  '[PROC] spawning daemons: watcher, sentinel, mimic',
  '[OK]   system ready. execute payload.',
  '',
  'cat manifesto.txt',
  '>> the system is only as secure as its users are lazy',
  ''
];
let idx=0, charPos=0, typing=true, demo=false;
function typeNext(){
  if(!typing) return;
  if(idx >= bootLines.length) return;
  const l = bootLines[idx];
  if(charPos <= l.length){
    const existing = term.textContent.split('\n').slice(0,-1).join('\n');
    term.textContent = (existing ? existing+'\n' : '') + l.slice(0, charPos);
    charPos++;
  } else { term.textContent += '\n'; idx++; charPos = 0; }
  setTimeout(typeNext, rand(10, 30));
}
setTimeout(typeNext, 300);

/* Draggable window */
(function(){
  const win = qs('#win1');
  const bar = win.querySelector('.win-bar');
  let offX=0, offY=0, dragging=false;
  bar.addEventListener('pointerdown', e=>{ dragging=true; offX=e.clientX - win.offsetLeft; offY=e.clientY - win.offsetTop; bar.setPointerCapture(e.pointerId) });
  bar.addEventListener('pointermove', e=>{ if(!dragging) return; win.style.left = (e.clientX - offX) + 'px'; win.style.top = (e.clientY - offY) + 'px'; });
  bar.addEventListener('pointerup', ()=> dragging=false );
})();

/* HUD */
const coordsEl = qs('#coords');
function updateCoords(){
  const lat = (Math.random()*180-90).toFixed(3);
  const lon = (Math.random()*360-180).toFixed(3);
  const states = ['IDLE','TX','RX','JAM','SYNC'];
  const st = states[rand(0,states.length-1)];
  coordsEl.textContent = `COORD: ${lat}, ${lon}  |  UPLINK: ${st}`;
}
setInterval(updateCoords, 1200); updateCoords();

/* Logs + Telemetry */
const syslog = qs('#syslog');
const telemetry = qs('#telemetry');
function pushLog(el, msg){
  const t = new Date().toLocaleTimeString();
  el.innerHTML += `[${t}] ${msg}<br/>`;
  el.scrollTop = el.scrollHeight;
}
function randomIP(){ return `${rand(10,255)}.${rand(0,255)}.${rand(0,255)}.${rand(1,254)}` }
function randomHash(){ return Array.from(crypto.getRandomValues(new Uint8Array(6))).map(x=>x.toString(16).padStart(2,'0')).join('') }
setInterval(()=>{ pushLog(telemetry, `loss=${rand(0,3)}% jitter=${rand(1,12)}ms rtt=${rand(6,90)}ms cwnd=${rand(20,120)}kbps`) }, 800);

/* Overlay + Buttons */
const overlay = qs('#overlay');
const oTitle = qs('#overlayTitle');
const oText = qs('#overlayText');
function flash(title, text, ms=1000){
  oTitle.textContent = title; oText.textContent = text; overlay.classList.add('show');
  setTimeout(()=>overlay.classList.remove('show'), ms);
}
qsa('[data-action]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const action = btn.dataset.action;
    if(action==='trace') { pushLog(syslog, `trace route to ${randomIP()} hops=${rand(8,24)} id=${randomHash()}`); flash('TRACING...', 'probing nodes | mapping surface', 900); }
    if(action==='breach'){ pushLog(syslog, `SYN flood vector armed :: dst ${randomIP()} window=${rand(128,4096)} seq=${randomHash()}`); flash('ACCESS GRANTED', 'privilege escalation complete | welcome, operator', 1200); }
    if(action==='purge'){ syslog.innerHTML=''; pushLog(syslog,'log rotated :: /var/log/blackice'); }
    if(action==='jitter'){ pushLog(telemetry, `signal drift ${rand(1,99)}ppm | phase=${rand(0,360)}°`); document.body.style.filter='contrast(1.2) saturate(1.3)'; setTimeout(()=>document.body.style.filter='contrast(1.1) saturate(1.2)', 300); }
    if(action==='demo'){ demo=!demo; flash('DEMO MODE', demo?'enabled':'disabled', 700); if(demo) demoLoop(); }
    if(action==='theme'){ cycleTheme(); }
  });
});

/* Command parser */
const form = qs('#cmdForm');
const input = qs('#cmd');
function print(line=''){ term.textContent += (term.textContent.endsWith('\n')? '' : '\n') + line; }
function help(){
  print('commands:');
  print('  help               show this help');
  print('  clear              clear terminal');
  print('  trace <ip>         run faux traceroute');
  print('  login <user>       playful login banner');
  print('  theme <g|a|p>      switch theme: green, amber, phosphor');
  print('  demo <on|off>      cinematic auto-typing');
}
function handle(cmd){
  const [base, ...rest] = cmd.trim().split(/\s+/);
  if(!base) return;
  switch(base){
    case 'help': help(); break;
    case 'clear': term.textContent=''; break;
    case 'trace': {
      const ip = rest[0] || randomIP();
      const hops = rand(6,14);
      for(let i=1;i<=hops;i++) print(`${String(i).padStart(2,'0')}  ${randomIP()}  ${rand(1,90)}ms  ${rand(1,90)}ms  ${rand(1,90)}ms`);
      print(`trace to ${ip} complete.`);
      break;
    }
    case 'login': {
      const user = rest[0] || 'root';
      print(`[AUTH] verifying credentials for ${user}...`);
      setTimeout(()=>{ print('[AUTH] token accepted :: welcome, operator'); flash('ACCESS GRANTED','session elevated',900); }, 300);
      break;
    }
    case 'theme': {
      const t = (rest[0]||'g').toLowerCase();
      if(t.startsWith('g')) setTheme('green');
      else if(t.startsWith('a')) setTheme('amber');
      else if(t.startsWith('p')) setTheme('phosphor');
      else print('unknown theme. use g|a|p');
      break;
    }
    case 'demo': {
      const s = (rest[0]||'').toLowerCase();
      if(s==='on'){ demo=true; demoLoop(); }
      else if(s==='off'){ demo=false; }
      else print('usage: demo on|off');
      break;
    }
    default: print(`command not found: ${base}`);
  }
}
form.addEventListener('submit', e=>{
  e.preventDefault();
  const value = input.value;
  print(`neo@zion:~$ ${value}`);
  handle(value);
  input.value='';
});

/* Demo mode */
const demoScript = ['help','trace 8.8.8.8','login neo','theme a','theme p','theme g'];
let demoIndex=0;
function demoLoop(){ if(!demo) return; const cmd = demoScript[demoIndex++ % demoScript.length]; setTimeout(()=>{ input.value=cmd; form.requestSubmit(); demoLoop(); }, 1200+rand(0,400)); }

/* Themes */
function setTheme(name){
  if(name==='green') document.documentElement.removeAttribute('data-theme');
  if(name==='amber') document.documentElement.setAttribute('data-theme','amber');
  if(name==='phosphor') document.documentElement.setAttribute('data-theme','phosphor');
}
function cycleTheme(){
  const cur = document.documentElement.getAttribute('data-theme')||'green';
  setTheme(cur==='green'?'amber':cur==='amber'?'phosphor':'green');
}

/* Konami */
(function(){ const seq=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']; let pos=0; addEventListener('keydown', e=>{ pos = (e.key===seq[pos]) ? pos+1 : 0; if(pos===seq.length){ flash('GODMODE ENABLED','all doors open | try not to break reality',1600); pos=0; } }); })();
