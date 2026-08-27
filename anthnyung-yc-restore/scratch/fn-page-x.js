function x(e){
let{
name:t}=e,a=function(){
let[e,t]=(0,o.useState)(!1);
return(0,o.useEffect)(()=>{
let e=window.matchMedia("(prefers-reduced-motion: reduce)"),a=()=>t(e.matches);
return e.addEventListener("change",a),()=>e.removeEventListener("change",a)},[]),e}(),s=function(e){
let[t,a]=(0,o.useState)({
offsetX:.15,offsetY:-.21,scale:2.2});
return(0,o.useEffect)(()=>{
let t;
if(e)return;
let i=performance.now(),r=0,n=e=>{
let o=(e-i)/1e3;
e-r>33&&(r=e,a({
offsetY:-.21+.2*Math.sin(.5*o),offsetX:.15+.15*Math.cos(.35*o),scale:2.2+.3*Math.sin(.3*o)})),t=requestAnimationFrame(n)};
return t=requestAnimationFrame(n),()=>cancelAnimationFrame(t)},[e]),t}(a),p=function(e){
let t=(0,o.useRef)(null);
return(0,o.useEffect)(()=>{
let a;
let i=t.current;
if(!i)return;
let r=!1,n=0,o=0,s=0,l=0,c=0,d=0,h=performance.now(),p=t=>{
if("touch"===t.pointerType||e)return;
r=!0;
let a=i.getBoundingClientRect();
n=(t.clientX-a.left)/a.width-.5,o=(t.clientY-a.top)/a.height-.5},u=()=>{
r=!1},m=t=>{
let p=Math.min(.032,(t-h)/1e3);
h=t;
let u=e||!r?0:n,f=e||!r?0:o;
c+=(u-s)*100*p,d+=(f-l)*100*p,c*=Math.exp(-20*p),d*=Math.exp(-20*p),s+=c*p,l+=d*p,i.style.setProperty("--tilt-x","".concat((16*l).toFixed(3),"deg")),i.style.setProperty("--tilt-y","".concat((-(16*s)).toFixed(3),"deg")),i.style.setProperty("--ticket-x","".concat((16*s).toFixed(3),"px")),i.style.setProperty("--ticket-y","".concat((-(16*l)).toFixed(3),"px")),a=requestAnimationFrame(m)};
return i.addEventListener("pointermove",p),i.addEventListener("pointerleave",u),a=requestAnimationFrame(m),()=>{
i.removeEventListener("pointermove",p),i.removeEventListener("pointerleave",u),cancelAnimationFrame(a)}},[e]),t}(a),m=(0,o.useRef)(null),[x,y]=(0,o.useState)(!1),g=function(e){
let t=(0,o.useRef)(null),a=(0,o.useRef)(e?.68:0),[i,r]=(0,o.useState)(e?"detached":"attached"),n=(0,o.useRef)(i),s=(0,o.useRef)({
active:!1,startX:0,startPull:0,pull:0,history:[]}),l=(0,o.useRef)(),c=(0,o.useRef)(),d=(0,o.useRef)(null),h=()=>{
if(!d.current){
let e=window.AudioContext||window.webkitAudioContext;
if(!e)return null;
let t=new e,a=t.createGain();
a.gain.value=.18,a.connect(t.destination),d.current={
context:t,master:a}}let e=d.current;
return"suspended"===e.context.state&&e.context.resume().catch(()=>{
}),e},p=(e,t)=>{
let a=Math.ceil(e.sampleRate*t),i=e.createBuffer(1,a,e.sampleRate),r=i.getChannelData(0);
for(let e=0;
e<a;
e+=1)r[e]=2*Math.random()-1;
let n=e.createBufferSource();
return n.buffer=i,n},u=(e,t)=>{
let a=Math.ceil(e.sampleRate*t),i=e.createBuffer(1,a,e.sampleRate),r=i.getChannelData(0),n=0;
for(let e=0;
e<a;
e+=1){
let t=e/a,i=Math.sin(Math.min(1,t/.035)*Math.PI*.5),o=Math.pow(1-t,.72),s=2*Math.random()-1;
n=.62*n+.38*s;
let l=Math.exp(-(23*t%1*19))*(2*Math.random()-1),c=Math.random()>.988?(2*Math.random()-1)*.85:0;
r[e]=Math.max(-1,Math.min(1,(.46*n+.16*s+.72*l+c)*i*o))}let o=e.createBufferSource();
return o.buffer=i,o},m=()=>{
let e=h();
if(!e)return;
let{
context:t,master:a}=e,i=t.currentTime+.008,r=u(t,.28),n=t.createBiquadFilter(),o=t.createGain();
n.type="bandpass",n.frequency.setValueAtTime(2050,i),n.frequency.exponentialRampToValueAtTime(720,i+.28),n.Q.value=.68,o.gain.setValueAtTime(1e-4,i),o.gain.linearRampToValueAtTime(.66,i+.012),o.gain.exponentialRampToValueAtTime(1e-4,i+.28);
let s=t.createBiquadFilter(),l=t.createGain();
s.type="highpass",s.frequency.setValueAtTime(2850,i),l.gain.setValueAtTime(1e-4,i),l.gain.linearRampToValueAtTime(.24,i+.008),l.gain.exponentialRampToValueAtTime(1e-4,i+.25760000000000005),r.connect(n).connect(o).connect(a),r.connect(s).connect(l).connect(a),r.start(i),r.stop(i+.28)},f=()=>{
let e=h();
if(!e)return;
let{
context:t,master:a}=e,i=t.currentTime+.012;
[880,1108.73,1318.51,1760].forEach((e,r)=>{
let n=i+.055*r,o=t.createOscillator(),s=t.createGain();
o.type=0===r?"triangle":"sine",o.frequency.setValueAtTime(e,n),o.frequency.exponentialRampToValueAtTime(1.018*e,n+.68),s.gain.setValueAtTime(1e-4,n),s.gain.linearRampToValueAtTime(0===r?.115:.085,n+.025),s.gain.exponentialRampToValueAtTime(1e-4,n+.76),o.connect(s).connect(a),o.start(n),o.stop(n+.78)});
let r=p(t,.62),n=t.createBiquadFilter(),o=t.createGain();
n.type="highpass",n.frequency.setValueAtTime(5200,i),o.gain.setValueAtTime(1e-4,i),o.gain.linearRampToValueAtTime(.075,i+.035),o.gain.exponentialRampToValueAtTime(1e-4,i+.58),r.connect(n).connect(o).connect(a),r.start(i),r.stop(i+.62)},x=e=>{
var i;
let r=Math.max(0,Math.min(1,e));
s.current.pull=r,a.current=r,null===(i=t.current)||void 0===i||i.style.setProperty("--pull","".concat(r))},y=(e,t,a)=>{
cancelAnimationFrame(l.current);
let i=s.current.pull,r=performance.now(),n=o=>{
let s=Math.min(1,(o-r)/t);
x(i+(e-i)*(1-Math.pow(1-s,4))),s<1?l.current=requestAnimationFrame(n):null==a||a()};
l.current=requestAnimationFrame(n)},g=function(e){
let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,a=arguments.length>2?arguments[2]:void 0;
cancelAnimationFrame(l.current);
let i=s.current.pull,r=t,n=performance.now(),o=0===e?1:.86,c=2*Math.PI/.36,d=t=>{
let s=Math.min(.032,Math.max(.001,(t-n)/1e3));
n=t;
let h=-c*c*(i-e)-2*o*c*r;
r+=h*s,x(i+=r*s),Math.abs(i-e)>.001||Math.abs(r)>.004?l.current=requestAnimationFrame(d):(x(e),null==a||a())};
l.current=requestAnimationFrame(d)},M=function(){
let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0;
if("attached"!==n.current||e)return;
h(),n.current="tension",r("tension");
let a=Number.isFinite(t)?Math.max(0,t):0,i=()=>{
n.current="perforation",r("perforation"),c.current=window.setTimeout(()=>{
n.current="chopping",r("chopping"),m(),c.current=window.setTimeout(()=>{
n.current="tearing",r("tearing"),c.current=window.setTimeout(()=>{
n.current="holding",r("holding"),c.current=window.setTimeout(()=>{
n.current="settling",r("settling"),f(),c.current=window.setTimeout(()=>{
n.current="detached",r("detached"),x(.68)},620)},240)},130)},95)},480)};
a>.01?g(1,a,i):y(1,Math.max(300,(1-s.current.pull)*780),i)};
return(0,o.useEffect)(()=>()=>{
var e;
cancelAnimationFrame(l.current),clearTimeout(c.current),null===(e=d.current)||void 0===e||e.context.close().catch(()=>{
})},[]),{
dragRef:t,progressRef:a,phase:i,tear:M,reset:()=>{
clearTimeout(c.current),n.current="attached",r("attached"),x(0)},onPointerDown:t=>{
"attached"!==n.current||e||(h(),cancelAnimationFrame(l.current),s.current.active=!0,s.current.startX=t.clientX,s.current.startPull=s.current.pull,s.current.history=[{
pull:s.current.pull,time:t.timeStamp}],t.currentTarget.setPointerCapture(t.pointerId))},onPointerMove:e=>{
if(!s.current.active)return;
let t=s.current.startPull+(e.clientX-s.current.startX)/150;
if(t<=.74)x(t);
else{
let e=t-.74;
x(.74+.624*e/(.26+2.4*Math.abs(e)))}s.current.history.push({
pull:s.current.pull,time:e.timeStamp});
let a=e.timeStamp-90;
s.current.history=s.current.history.filter(e=>e.time>=a).slice(-6)},onPointerUp:()=>{
if(!s.current.active)return;
s.current.active=!1;
let e=s.current.history,t=e[0],a=e[e.length-1],i=t&&a?Math.max(16,a.time-t.time):16,r=t&&a?(a.pull-t.pull)/(i/1e3):0,n=s.current.pull+.14*r,o=s.current.pull>=.92&&r>-.08,l=s.current.pull>.775&&r>.12&&n>=.92;
if(o||l){
M(r);
return}g(s.current.pull>.58&&r>-.7?.74:0,r)}}}(a),M=async()=>{
if(!x&&m.current){
y(!0);
try{
let e=await f(m.current);
if(!e)throw Error("Ticket export failed");
let a=URL.createObjectURL(e),i=document.createElement("a");
i.href=a,i.download="startup-school-2026-".concat(t.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,""),".png"),i.click(),setTimeout(()=>URL.revokeObjectURL(a),1e3)}catch(e){
console.error(e)}finally{
y(!1)}}};
return(0,i.jsxs)("div",{
className:"yc-root",children:[(0,i.jsx)("img",{
className:"page-background",src:"https://bookface-static.ycombinator.com/vite/assets/page-bg-C27Z9D2J.png",alt:"","aria-hidden":"true"}),(0,i.jsx)("a",{
className:"back-link",href:"/yc","aria-label":"YC ticket",children:"/yc"}),(0,i.jsx)("main",{
className:"page-shell",children:(0,i.jsxs)("section",{
className:"ticket-stage","aria-labelledby":"ticket-title",children:[(0,i.jsx)("h1",{
id:"ticket-title",className:"visually-hidden",children:"Startup School 2026 admission ticket"}),(0,i.jsxs)("div",{
className:"ticket-machine is-".concat(g.phase),children:["detached"===g.phase&&(0,i.jsxs)("div",{
className:"final-ticket-callout",role:"status",children:[(0,i.jsx)("span",{
children:"TICKET SECURED"}),(0,i.jsx)("strong",{
children:"Don’t lose it. You only get one… probably."})]}),(0,i.jsx)(h,{
progressRef:g.progressRef,phase:g.phase,reduced:a,name:t}),(0,i.jsx)("div",{
className:"feed-shadow","aria-hidden":"true"}),(0,i.jsx)("div",{
className:"tear-seam","aria-hidden":"true",children:(0,i.jsx)("span",{
})}),(0,i.jsx)("div",{
ref:g.dragRef,className:"ticket-pull",onPointerDown:g.onPointerDown,onPointerMove:g.onPointerMove,onPointerUp:g.onPointerUp,onPointerCancel:g.onPointerUp,children:(0,i.jsx)("div",{
className:"ticket-perspective",children:(0,i.jsx)("div",{
ref:p,className:"ticket-tilt",children:(0,i.jsxs)("div",{
ref:m,id:"ticket-artwork",className:"ticket-artwork","data-capture-area":!0,role:"img","aria-label":"Startup School 2026 admission ticket for ".concat(t),children:[(0,i.jsx)("div",{
className:"mesh-layer","aria-hidden":"true",children:(0,i.jsx)(r.bL,{
width:"100%",height:"100%",colors:l,distortion:.6,swirl:.3,speed:a?0:1.8,grainMixer:0,grainOverlay:0,scale:1,rotation:0,offsetX:0,offsetY:0,webGlContextAttributes:{
preserveDrawingBuffer:!0}})}),(0,i.jsx)(d,{
}),(0,i.jsx)("div",{
className:"glass-layer","aria-hidden":"true",children:(0,i.jsx)(n.k4,{
width:"100%",height:"100%",...c,offsetX:s.offsetX,offsetY:s.offsetY,scale:s.scale,fit:"cover",webGlContextAttributes:{
preserveDrawingBuffer:!0}})}),(0,i.jsx)(u,{
name:t})]})})})})]}),(0,i.jsxs)("div",{
className:"ticket-actions",children:[(0,i.jsxs)("button",{
className:"tear-button",type:"button",onClick:"detached"===g.phase?g.reset:g.tear,disabled:"tension"===g.phase||"perforation"===g.phase||"chopping"===g.phase||"tearing"===g.phase||"holding"===g.phase||"settling"===g.phase,children:[(0,i.jsx)("span",{
children:"detached"===g.phase?"ROLL ANOTHER":"attached"===g.phase?"TEAR OFF TICKET":"perforation"===g.phase?"LINE IT UP…":"chopping"===g.phase?"CHOP!":"settling"===g.phase?"SETTLING…":"TEARING…"}),(0,i.jsx)("span",{
"aria-hidden":"true",children:"→"})]}),(0,i.jsxs)("button",{
className:"save-button",type:"button",onClick:M,disabled:x||"detached"!==g.phase,children:[(0,i.jsx)("svg",{
"aria-hidden":"true",viewBox:"0 0 24 24",width:"12",height:"12",children:(0,i.jsx)("path",{
d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),(0,i.jsx)("span",{
children:x?"SAVING...":"SAVE"})]})]}),(0,i.jsx)("div",{
className:"caption-spacer","aria-hidden":"true"})]})})]})}},908:function(){
}},function(e){
e.O(0,[284,689,983,971,23,744],function(){
return e(e.s=1827)}),_N_E=e.O()}]);
