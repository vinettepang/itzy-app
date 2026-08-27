function m(e){
let t=e.cloneNode(!0);
t.setAttribute("width","520"),t.setAttribute("height","280");
let a=document.createElementNS("http://www.w3.org/2000/svg","style");
a.textContent='\n    .ticket-copy{
fill:#4a301d;
font-family:"Martian Mono","Courier New",monospace}\n    .ticket-small{
font-size:11px;
font-weight:400;
letter-spacing:.04em}\n    .ticket-name{
font-weight:500;
letter-spacing:-.02em}\n    .ticket-separator{
stroke:#4a301d;
stroke-width:1.5;
stroke-dasharray:4 4;
opacity:.2}\n    .ticket-admit{
font-size:40px;
font-weight:500;
letter-spacing:-.02em;
opacity:.4}\n    .ticket-year{
fill:#fff;
font-family:"Martian Mono",monospace;
font-size:90px;
font-weight:700;
letter-spacing:.05em;
opacity:.15;
mix-blend-mode:overlay}\n  ',t.prepend(a);
let i=new XMLSerializer().serializeToString(t),r=URL.createObjectURL(new Blob([i],{
type:"image/svg+xml;
charset=utf-8"})),n=new Image;
return await new Promise((e,t)=>{
n.onload=e,n.onerror=t,n.src=r}),URL.revokeObjectURL(r),n}async 