function u(e){
let{
name:t}=e,a=(0,o.useMemo)(()=>p(t).slice(0,2),[t]),r=Math.max(...a.map(e=>e.length));
return(0,i.jsxs)("svg",{
id:"ticket-overlay",className:"ticket-overlay",viewBox:"0 0 520 280",xmlns:"http://www.w3.org/2000/svg",children:[(0,i.jsx)("title",{
children:"Startup School 2026 admission ticket for ".concat(t)}),(0,i.jsx)("desc",{
children:"An animated orange event ticket for July 25–26 at Chase Center in San Francisco."}),(0,i.jsxs)("g",{
className:"ticket-copy ticket-small",children:[(0,i.jsx)("text",{
x:"36",y:"43",children:"Y COMBINATOR PRESENTS"}),(0,i.jsx)("text",{
x:"36",y:"60",children:"STARTUP SCHOOL 2026"})]}),(0,i.jsx)("g",{
className:"ticket-copy ticket-name","aria-label":t,style:{
fontSize:Math.max(16,Math.min(36,320/Math.max(r,7)))},children:a.map((e,t)=>(0,i.jsx)("text",{
x:"36",y:1===a.length?158:137+43*t,children:e},e))}),(0,i.jsx)("text",{
x:"36",y:"244",className:"ticket-copy ticket-small",children:"CHASE CENTER, SF \xb7 JULY 25–26"}),(0,i.jsx)("line",{
x1:"395.2",y1:"18",x2:"395.2",y2:"262",className:"ticket-separator"}),(0,i.jsx)("text",{
x:"451",y:"27",className:"ticket-copy ticket-admit",transform:"rotate(90 451 27)",children:"ADMIT ONE"}),(0,i.jsx)("text",{
x:"474",y:"13",className:"ticket-year",transform:"rotate(90 474 13)",children:"2026"})]})}async 