import{
u as be,_ as ke
}
from"./DjdLXwKG.js";
import{
_ as ye
}
from"./Cz5EEHz1.js";
import{
u as Ee,_ as Te
}
from"./BStdxgwG.js";
import{
u as xe,a as Le,c as N,o as Ce,n as O,p as De,b as Me,w as Pe,d as Se,e as f,f as c,F as $,r as oe,g as a,h as j,i as V,j as x,k as u,l as Y,m as se,t as W,q as Ae
}
from"./DrDZC_3w.js";
import{
u as He
}
from"./DxBSiGkk.js";
import{
_ as $e
}
from"./DlAUqK2U.js";
const je=["onClick","onMouseup"],Ye={
class:"-z-1 absolute left-0 w-full lg:w-[59%] lg:left-[41%] top-[calc(40dvh-34px)] sm:top-[calc(25dvh-34px)] lg:top-[calc(50dvh-34px-0.625rem)]-- lg:top-[calc(50dvh-34px)] flex justify-between px-2.5 bg-[yellow]--"
}
,Re={
key:0,class:"text-light"
}
,Fe={
key:1
}
,Be={
key:0,class:"inline-block"
}
,Ie={
class:"-z-1 absolute lg:w-[59%] lg:left-[41%] bg-[yellow]-- px-2.5 pb-2.5 bottom-0 max-lg:hidden indent-6"
}
,Ue=["innerHTML"],ze=4,Ne=.25,ne=2.5,Oe=1.5,re=500,Ve=36,We=0,qe={
__name:"index",async setup(Ge){
let P,q;
He();
const ie=xe(),t=x(null),R=x(null),s=x([]),L=x([]),k=x(0),F=x(!1),B=Le(),S=e=>{
R.value&&(R.value.style.transform=`translateY(${
-e
}
px)`)
}
;
let d=0,p=0,v=!1,g=!1,m=!1,y=0,A=0,C=!0,D=null,E=null,w=!1,I=!0,G=0;
const ce=N(()=>typeof navigator>"u"?!1:/^((?!chrome|android).)*safari/i.test(navigator.userAgent)),ue=()=>typeof window<"u"&&("ontouchstart"in window||navigator.maxTouchPoints>0||navigator.msMaxTouchPoints>0)||!1,de=(e,l,r)=>e+(l-e)*r,ve=()=>{
if(w||!t.value||s.value.length===0)return;
w=!0;
const e=[...s.value],l=t.value.scrollHeight;
L.value.unshift(...e),O(()=>{
const n=t.value.scrollHeight-l;
d+=n,p+=n,S(p),w=!1
}
)
}
,fe=()=>{
w||s.value.length===0||(w=!0,L.value.push(...s.value),O(()=>{
w=!1
}
))
}
,U=(e=!0)=>{
if(!t.value||I||w)return;
const l=p,r=t.value.scrollHeight,n=t.value.clientHeight;
l<re&&ve(),r-(l+n)<re&&fe(),e&&ge(l,n)
}
,ge=(e,l)=>{
const r=B.isLessThan("lg")?t.value.getBoundingClientRect().top:l/2,n=document.querySelectorAll(".carouselContainer > div > div");
if(n.length===0)return;
let h=0;
for(let o=0;
o<n.length&&n[o].getBoundingClientRect().top<=r;
o++)h=o;
k.value=h
}
,z=()=>{
C=!1,D&&clearTimeout(D),D=setTimeout(()=>{
C=!0,v||(v=!0,_())
}
,We)
}
,J=e=>{
if(m)return;
const l=e.target?.closest("a");
l&&l.click()
}
;
let M=null;
const _=e=>{
if(!t.value)return;
E&&cancelAnimationFrame(E);
const l=e??performance.now(),r=M===null?1/60:Math.min((l-M)/1e3,.1);
M=l,C&&!g&&(d+=Ve*r);
const n=p,h=d,o=1-Math.pow(1-Ne,r*60);
G++;
const i=G%ze===0;
if(Math.abs(n-h)>.1){
const H=de(n,h,o);
p=H,S(H),U(i),E=requestAnimationFrame(_)
}
else p=h,S(h),U(i),v=!1,C?E=requestAnimationFrame(_):M=null
}
,K=e=>{
g=!0,m=!1,y=e.clientY,A=d,document.body.style.cursor="grabbing",document.body.style.userSelect="none",z()
}
,Q=e=>{
B.isLessThan("lg")||e.preventDefault(),g=!0,m=!1,y=e.touches[0].clientY,A=d,z()
}
,X=e=>{
if(!g||!t.value)return;
e.preventDefault();
const l=(y-e.touches[0].clientY)*ne;
Math.abs(y-e.touches[0].clientY)>3&&(m=!0),d=Math.max(0,Math.min(A+l,t.value.scrollHeight-t.value.clientHeight)),v||(v=!0,_())
}
,Z=e=>{
g&&(g=!1,!m&&!B.isLessThan("lg")&&J(e))
}
,ee=e=>{
if(!g||!t.value)return;
const l=(y-e.clientY)*ne;
Math.abs(y-e.clientY)>3&&(m=!0),d=Math.max(0,Math.min(A+l,t.value.scrollHeight-t.value.clientHeight)),v||(v=!0,_())
}
,te=e=>{
g&&(g=!1,document.body.style.cursor="",document.body.style.userSelect="",m||J(e))
}
,le=e=>{
t.value&&(e.preventDefault(),z(),d+=ce?e.deltaY:e.deltaY*Oe,d=Math.max(0,Math.min(d,t.value.scrollHeight-t.value.clientHeight)),v||(v=!0,_()))
}
,me=()=>{
if(!t.value||s.value.length===0){
I=!1;
return
}
const e=t.value.scrollHeight/3;
d=e,p=e,S(e),I=!1,U()
}
;
Ce(async()=>{
F.value=ue(),t.value&&(F.value?(t.value.addEventListener("touchstart",Q,{
passive:!1
}
),t.value.addEventListener("touchmove",X,{
passive:!1
}
),t.value.addEventListener("touchend",Z,{
passive:!1
}
)):(t.value.addEventListener("mousedown",K,{
passive:!1
}
),t.value.addEventListener("wheel",le,{
passive:!1
}
),document.addEventListener("mousemove",ee),document.addEventListener("mouseup",te))),await O(),me(),C=!0,v=!0,_(),s.value.forEach(e=>{
e.is_coming_soon||(De(`/work/${
e.slug
}
`),$fetch(`/work/${
e.slug
}
/_payload.json`,{
method:"GET"
}
).catch(()=>{

}
))
}
)
}
),Me(()=>{
t.value&&(F.value?(t.value.removeEventListener("touchstart",Q),t.value.removeEventListener("touchmove",X),t.value.removeEventListener("touchend",Z)):(t.value.removeEventListener("mousedown",K),t.value.removeEventListener("wheel",le),document.removeEventListener("mousemove",ee),document.removeEventListener("mouseup",te))),D&&clearTimeout(D),E&&cancelAnimationFrame(E),M=null
}
);
const{
data:b
}
=([P,q]=Pe(()=>Ee("page-work",()=>$fetch("/api/page-work"))),P=await P,q(),P),ae=N(()=>b?.value?.data?.page_work);
b?.value?.data?.projects&&(s.value=b.value.data.projects,L.value=[...b.value.data.projects,...b.value.data.projects,...b.value.data.projects]),Se(()=>b?.value?.data?.projects,e=>{
e&&e.length>0&&s.value.length===0&&(s.value=e,L.value=[...e,...e,...e])
}
);
const T=N(()=>L.value),he=(e,l)=>{
m||l()
}
,pe=e=>{
const{
href:l
}
=ie.resolve({
path:`/work/${
e
}
`
}
);
window.open(l,"_blank","noopener,noreferrer")
}
,we=e=>{
m&&e.preventDefault()
}
;
return be(ae?.value?.seo_settings),(e,l)=>{
const r=ke,n=ye,h=Te;
return u(),f("div",null,[c("section",null,[c("div",{
ref_key:"carouselContainer",ref:t,class:"max-lg:pr-2.5 box-layout max-lg:fixed max-lg:w-full max-lg:bottom-0 h-[calc(60dvh+0.625rem)] sm:h-[calc(75dvh+0.625rem)] lg:h-[calc(100dvh-34px)] lg:relative overflow-hidden carouselContainer"
}
,[c("div",{
ref_key:"carouselInner",ref:R,style:{
"will-change":"transform"
}

}
,[(u(!0),f($,null,oe(a(T),(o,i)=>(u(),f("div",{
key:i,class:"h-auto! pb-px-- pb-[2px]-- media-divider-- pl-2.5 lg:pr-[59%] relative group even:bg-[pink]/90-- w-full border-b-- border-white"
}
,[o.is_coming_soon?(u(),f($,{
key:0
}
,[j(r,{
fileData:o.cover,containerClasses:"relative overflow-hidden aspect-[5/3.5] media-divider",mediaClasses:"media-object scale-[1.005]--",sizes:"sm:100vw lg:40vw",draggable:"false",eager:i>=a(s).length&&i<a(s).length+2
}
,null,8,["fileData","eager"]),c("div",{
class:"absolute inset-0",onDragstart:l[0]||(l[0]=Y(()=>{

}
,["prevent"]))
}
,null,32)],64)):(u(),f($,{
key:1
}
,[l[3]||(l[3]=c("div",{
class:"bg-[blue]/60-- absolute right-0 w-[calc(60vw-2.25rem)] z-10000000 h-full max-lg:hidden"
}
,null,-1)),e.$viewport.isLessThan("lg")?(u(),se(n,{
key:0,to:`/work/${
o.slug
}
`,onClick:we,class:"cursor-pointer w-auto block"
}
,{
default:V(()=>[j(r,{
fileData:o.cover,containerClasses:"relative overflow-hidden aspect-[5/3.5] media-divider",mediaClasses:"media-object scale-[1.005]--",sizes:"sm:100vw lg:40vw",draggable:"false",eager:i>=a(s).length&&i<a(s).length+2
}
,null,8,["fileData","eager"]),c("div",{
class:"absolute inset-0",onDragstart:l[1]||(l[1]=Y(()=>{

}
,["prevent"]))
}
,null,32)]),_:2
}
,1032,["to"])):(u(),se(n,{
key:1,to:`/work/${
o.slug
}
`,custom:""
}
,{
default:V(({
navigate:H
}
)=>[c("div",{
onClick:_e=>he(o.slug,H),onMouseup:Y(_e=>pe(o.slug),["middle","prevent"]),class:"cursor-pointer w-auto"
}
,[j(r,{
fileData:o.cover,containerClasses:"relative overflow-hidden aspect-[5/3.5] media-divider",mediaClasses:"media-object scale-[1.005]--",sizes:"sm:100vw lg:40vw",draggable:"false",eager:i>=a(s).length&&i<a(s).length+2
}
,null,8,["fileData","eager"]),c("div",{
class:"absolute inset-0",onDragstart:l[2]||(l[2]=Y(()=>{

}
,["prevent"]))
}
,null,32)],40,je)]),_:2
}
,1032,["to"]))],64))]))),128))],512)],512),j(h,null,{
default:V(()=>[c("div",Ye,[c("div",null,W(a(T)[a(k)]?.title),1),a(T)[a(k)]?.is_coming_soon?(u(),f("div",Re," Coming Soon ")):(u(),f("ul",Fe,[(u(!0),f($,null,oe(a(T)[a(k)]?.areas.slice(0,e.$viewport.isLessThan("lg")?2:10),(o,i)=>(u(),f("li",{
key:i,class:"inline-block after:mr-0.5 last:after:hidden after:content-[',']"
}
,W(o.areas_id.title),1))),128)),a(T)[a(k)]?.areas.length>(e.$viewport.isLessThan("lg")?2:10)?(u(),f("li",Be,[c("span",null,"(+"+W(a(T)[a(k)]?.areas.length-(e.$viewport.isLessThan("lg")?2:10))+")",1)])):Ae("",!0)]))])]),_:1
}
),c("div",Ie,[c("div",{
innerHTML:a(ae).text,class:"text-rich pr-2.5-- absolute-- bottom-0-- w-full"
}
,null,8,Ue)])])])
}

}

}
,tt=$e(qe,[["__scopeId","data-v-12a05fc2"]]);
export{
tt as default
}
;

