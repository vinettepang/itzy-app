6750:function(e,t,a){
"use strict";
a.d(t,{
default:function(){
return x
}

}
);
var i=a(7437),r=a(6801),n=a(9099),o=a(2265),s=a(7776);
let l=["#FF6A00","#FC5E10","#FF8A30","#FFCB8E","#FFE4C2"],c={
size:.86,shadows:0,highlights:0,angle:0,distortion:.39,shift:0,stretch:0,blur:0,edges:.25,margin:0,grainMixer:0,grainOverlay:0,shape:"lines",distortionShape:"prism"
}
;
function d(){
let e=(0,o.useRef)(null);
return(0,o.useEffect)(()=>{
let t=e.current,a=null==t?void 0:t.getContext("2d");
if(!t||!a)return;
let i=a.createImageData(t.width,t.height);
for(let e=0;
e<i.data.length;
e+=4){
let t=255*Math.random();
i.data[e]=t,i.data[e+1]=t,i.data[e+2]=t,i.data[e+3]=255
}
a.putImageData(i,0,0)
}
,[]),(0,i.jsx)("canvas",{
ref:e,className:"paper-noise",width:"800",height:"400","aria-hidden":"true"
}
)
}
function h(e){
let{
progressRef:t,phase:a,reduced:r,name:n
}
=e,l=(0,o.useRef)(null),c=(0,o.useRef)(a);
return(0,o.useEffect)(()=>{
c.current=a
}
,[a]),(0,o.useEffect)(()=>{
let e;
let a=l.current;
if(!a)return;
let i=new s.WebGLRenderer({
canvas:a,alpha:!0,antialias:!0,powerPreference:"high-performance"
}
);
i.setPixelRatio(Math.min(window.devicePixelRatio,2)),i.outputColorSpace=s.SRGBColorSpace,i.shadowMap.enabled=!0,i.shadowMap.type=s.PCFSoftShadowMap;
let o=new s.Scene,d=new s.PerspectiveCamera(33,1,.1,40);
d.position.set(5.4,6.1,9.4),d.lookAt(-.45,.82,.45),o.add(new s.HemisphereLight(16767416,2364428,2.2));
let h=new s.DirectionalLight(16769994,4.8);
h.position.set(-3,9,7),h.castShadow=!0,h.shadow.mapSize.set(2048,2048),h.shadow.camera.left=-8,h.shadow.camera.right=8,h.shadow.camera.top=8,h.shadow.camera.bottom=-8,h.shadow.bias=-.00025,h.shadow.normalBias=.035,o.add(h);
let u=new s.PointLight(16738816,8.5,12);
u.position.set(4,2,4),o.add(u);
let m=new s.ShadowMaterial({
color:0,opacity:.26,transparent:!0
}
),f=new s.Mesh(new s.PlaneGeometry(30,24),m);
f.rotation.x=-Math.PI/2,f.position.y=-.015,f.receiveShadow=!0,o.add(f);
let x=function(e){
let t=!(arguments.length>1)||void 0===arguments[1]||arguments[1],a=document.createElement("canvas");
a.width=1040,a.height=560;
let i=a.getContext("2d"),r=i.createLinearGradient(0,0,a.width,a.height);
r.addColorStop(0,"#ffc487"),r.addColorStop(.48,"#ff6b18"),r.addColorStop(1,"#ffb36f"),i.fillStyle=r,i.fillRect(0,0,a.width,a.height);
let n=i.createRadialGradient(760,170,20,760,170,440);
n.addColorStop(0,"rgba(255,238,205,.92)"),n.addColorStop(.46,"rgba(255,154,74,.3)"),n.addColorStop(1,"rgba(255,93,14,0)"),i.fillStyle=n,i.fillRect(0,0,a.width,a.height),i.fillStyle="#4a301d",i.font='400 22px "Martian Mono", monospace',i.fillText("Y COMBINATOR PRESENTS",72,86),i.fillText("STARTUP SCHOOL 2026",72,121);
let o=p(e);
i.font='500 68px "Martian Mono", monospace',o.slice(0,2).forEach((e,t)=>i.fillText(e,72,o.length>1?278+82*t:320)),i.font='400 22px "Martian Mono", monospace',i.fillText("CHASE CENTER, SF \xb7 JULY 25–26",72,495),i.save(),i.globalAlpha=.42,i.font='500 74px "Martian Mono", monospace',i.translate(914,52),i.rotate(Math.PI/2),i.fillText("ADMIT ONE",0,0),i.restore(),i.setLineDash([8,10]),i.strokeStyle="rgba(74,48,29,.28)",i.lineWidth=3,i.beginPath(),i.moveTo(790,28),i.lineTo(790,532),i.stroke(),i.beginPath(),i.moveTo(18,20),i.lineTo(18,540),i.stroke(),i.setLineDash([]);
let l=i.getImageData(0,0,a.width,a.height);
for(let e=0;
e<l.data.length;
e+=4){
let t=(Math.random()-.5)*32;
l.data[e]+=t,l.data[e+1]+=t,l.data[e+2]+=t
}
if(i.putImageData(l,0,0),t){
for(let[e,t,a]of(i.save(),i.globalCompositeOperation="destination-out",[[0,0,32],[1040,0,32],[0,560,32],[1040,560,32],[790,0,28],[790,560,28]]))i.beginPath(),i.arc(e,t,a,0,2*Math.PI),i.fill();
i.restore()
}
let c=new s.CanvasTexture(a);
return c.colorSpace=s.SRGBColorSpace,c.anisotropy=8,c
}
(n),y=function(){
let e=document.createElement("canvas");
e.width=1024,e.height=512;
let t=e.getContext("2d"),a=t.createLinearGradient(0,0,e.width,e.height);
a.addColorStop(0,"#ffd09a"),a.addColorStop(.42,"#ff8734"),a.addColorStop(1,"#f45b16"),t.fillStyle=a,t.fillRect(0,0,e.width,e.height),t.fillStyle="rgba(73,42,25,.48)",t.font='500 22px "Martian Mono", monospace',t.textBaseline="top";
for(let e=0;
e<2;
e+=1){
let a=512*e+44;
t.fillText("Y COMBINATOR",a,42),t.font='500 15px "Martian Mono", monospace',t.fillText("STARTUP SCHOOL 2026",a,80),t.fillText("ADMIT ONE  \xb7  07.25",a,400),t.setLineDash([5,7]),t.strokeStyle="rgba(73,42,25,.25)",t.beginPath(),t.moveTo(a-30,0),t.lineTo(a-30,512),t.stroke(),t.setLineDash([]),t.font='500 22px "Martian Mono", monospace'
}
let i=t.getImageData(0,0,e.width,e.height);
for(let e=0;
e<i.data.length;
e+=4){
let t=(Math.random()-.5)*34;
i.data[e]+=t,i.data[e+1]+=t,i.data[e+2]+=t
}
t.putImageData(i,0,0);
let r=new s.CanvasTexture(e);
return r.colorSpace=s.SRGBColorSpace,r.wrapS=s.RepeatWrapping,r.wrapT=s.RepeatWrapping,r.anisotropy=4,r
}
();
y.wrapS=s.RepeatWrapping,y.wrapT=s.ClampToEdgeWrapping,y.repeat.set(1,1);
let g=function(){
let e=document.createElement("canvas");
e.width=1024,e.height=1024;
let t=e.getContext("2d");
t.fillStyle="#ee9a61",t.fillRect(0,0,e.width,e.height);
let a=e.width/2;
t.beginPath();
for(let e=0;
e<=6200;
e+=1){
let i=e/6200,r=62*i*Math.PI*2,n=168+342*i+.7*Math.sin(.73*r),o=a+Math.cos(r)*n,s=a+Math.sin(r)*n;
0===e?t.moveTo(o,s):t.lineTo(o,s)
}
t.strokeStyle="rgba(100,49,27,.24)",t.lineWidth=1.25,t.stroke();
for(let e=176;
e<507;
e+=18)t.beginPath(),t.strokeStyle="rgba(255,214,169,.08)",t.lineWidth=1,t.arc(a,a,e,0,2*Math.PI),t.stroke();
for(let e=0;
e<1200;
e+=1){
let e=Math.random()*Math.PI*2,i=168+342*Math.random();
t.fillStyle="rgba(78,38,20,".concat(.12*Math.random(),")"),t.fillRect(a+Math.cos(e)*i,a+Math.sin(e)*i,1+2*Math.random(),1)
}
let i=new s.CanvasTexture(e);
return i.colorSpace=s.SRGBColorSpace,i.anisotropy=8,i
}
(),M=new s.Group;
M.position.set(-2.8,1.08,0),o.add(M);
let w=new s.MeshStandardMaterial({
map:y,color:16777215,roughness:.97,metalness:0,side:s.DoubleSide
}
),v=new s.CylinderGeometry(1.34,1.34,2.16,128,18,!0),b=v.attributes.position;
for(let e=0;
e<b.count;
e+=1){
let t=b.getX(e),a=b.getY(e),i=b.getZ(e),r=Math.hypot(t,i),n=Math.atan2(i,t),o=(a+1.08)/2.16,s=(r+(.009*Math.sin(7*n+2.2*o)+.0045*Math.sin(19*n-5.4*o)))/r;
b.setXYZ(e,t*s,a,i*s)
}
b.needsUpdate=!0,v.computeVertexNormals();
let S=new s.Mesh(v,w);
S.castShadow=!0,M.add(S);
let T=new s.MeshStandardMaterial({
color:16228454,roughness:.9,side:s.DoubleSide
}
),A=new s.MeshStandardMaterial({
map:g,color:16777215,roughness:1,side:s.DoubleSide
}
),C=new s.MeshStandardMaterial({
color:3744536,roughness:.95,side:s.DoubleSide
}
);
for(let e of[-1,1]){
let t=new s.Mesh(new s.RingGeometry(.46,1.42,96),e>0?A:T);
t.position.y=1.085*e,t.rotation.x=e*Math.PI/2,M.add(t);
let a=new s.Mesh(new s.CircleGeometry(.46,64),C);
a.position.y=e>0?.61:-1.09,a.rotation.x=e*Math.PI/2,M.add(a)
}
let z=new s.MeshStandardMaterial({
color:5913129,roughness:1,side:s.DoubleSide
}
),R=new s.CylinderGeometry(.46,.46,.48,64,1,!0),P=new s.Mesh(R,z);
P.position.y=.85,M.add(P);
let k=[];
for(let e=0;
e<22;
e+=1){
let t=new s.MeshBasicMaterial({
color:8077863,transparent:!0,opacity:.12+(e%4==0?.05:0)
}
);
k.push(t);
let a=new s.Mesh(new s.TorusGeometry(.49+.042*e,.0035,5,128),t);
a.position.y=1.098+.0015*Math.sin(1.7*e),a.rotation.x=Math.PI/2,M.add(a)
}
let E=new s.MeshBasicMaterial({
color:7289892,transparent:!0,opacity:.25
}
),N=new s.Mesh(new s.PlaneGeometry(.5,.012),E);
N.position.set(.88,1.102,0),N.rotation.x=-Math.PI/2,M.add(N);
let j=new s.MeshStandardMaterial({
color:6965815,roughness:.98
}
),I=new s.Mesh(new s.TorusGeometry(.47,.035,10,96),j);
I.position.y=1.107,I.rotation.x=Math.PI/2,M.add(I);
let B=18/1040*5.2,F=new s.BufferGeometry,G=new Float32Array(1971),D=new Float32Array(1314),L=[];
for(let e=0;
e<=72;
e+=1){
let t=e/72;
for(let a=0;
a<=8;
a+=1){
let i=a/8,r=9*e+a;
if(D[2*r]=t,D[2*r+1]=i,e<72&&a<8){
let e=r+8+1;
L.push(r,e,r+1,r+1,e,e+1)
}

}

}
F.setAttribute("position",new s.BufferAttribute(G,3)),F.setAttribute("uv",new s.BufferAttribute(D,2)),F.setIndex(L);
let U=new s.MeshStandardMaterial({
map:x,transparent:!0,alphaTest:.025,roughness:.72,metalness:0,side:s.DoubleSide
}
),O=new s.Mesh(F,U);
O.castShadow=!0,O.receiveShadow=!1;
let V=new s.Group;
V.position.set(-2.8,1.08,0),V.add(O),V.visible=!1,o.add(V);
let q=function(e,t){
let a=e.image,i=document.createElement("canvas");
i.width=4*a.width,i.height=a.height;
let r=i.getContext("2d");
for(let e=0;
e<4;
e+=1)r.drawImage(a,e*a.width,0);
let n=new s.CanvasTexture(i);
return n.colorSpace=s.SRGBColorSpace,n.anisotropy=8,n.wrapS=s.ClampToEdgeWrapping,n.wrapT=s.ClampToEdgeWrapping,n
}
(x,0),W=new s.BufferGeometry,Y=new Float32Array(7803),X=new Float32Array(5202),H=[];
for(let e=0;
e<=288;
e+=1){
let t=e/288;
for(let a=0;
a<=8;
a+=1){
let i=a/8,r=9*e+a;
if(X[2*r]=t,X[2*r+1]=i,e<288&&a<8){
let e=r+8+1;
H.push(r,e,r+1,r+1,e,e+1)
}

}

}
W.setAttribute("position",new s.BufferAttribute(Y,3)),W.setAttribute("uv",new s.BufferAttribute(X,2)),W.setIndex(H);
let _=new s.MeshStandardMaterial({
map:q,transparent:!1,alphaTest:.025,roughness:.72,metalness:0,side:s.DoubleSide
}
),J=new s.Mesh(W,_);
J.castShadow=!0,J.receiveShadow=!1;
let Q=new s.Group;
Q.position.set(-2.8,1.08,0),Q.add(J),o.add(Q);
let Z=new s.Group,K=[],$=[];
for(let e=0;
e<11;
e+=1){
let t=new s.PlaneGeometry(.035,.105),a=new s.MeshBasicMaterial({
color:5648671,transparent:!0,opacity:0,depthWrite:!1,side:s.DoubleSide
}
),i=new s.Mesh(t,a);
i.position.set(.025,-.9072+.18144*e,1.455),Z.add(i),K.push(a),$.push(t)
}
let ee=new s.MeshBasicMaterial({
color:15661311,transparent:!0,opacity:0,depthWrite:!1,blending:s.AdditiveBlending,side:s.DoubleSide
}
),et=new s.MeshBasicMaterial({
color:16774111,transparent:!0,opacity:0,depthWrite:!1,blending:s.AdditiveBlending,side:s.DoubleSide
}
),ea=new s.PlaneGeometry(.12,1.02),ei=new s.PlaneGeometry(.02,1.08),er=new s.Mesh(ea,ee),en=new s.Mesh(ei,et);
en.position.z=.006;
let eo=new s.Group;
eo.add(er,en),eo.position.set(.025,1.4040000000000001,1.48),eo.rotation.z=-.14,Z.add(eo);
let es=new s.PlaneGeometry(.07,.025),el=new s.MeshBasicMaterial({
color:16761229,transparent:!0,opacity:0,depthWrite:!1,side:s.DoubleSide
}
),ec=[{
x:-.02,y:.16,vx:-.42,vy:.38,spin:-4.2
}
,{
x:.02,y:.05,vx:.48,vy:.28,spin:3.4
}
,{
x:-.01,y:-.08,vx:-.36,vy:-.18,spin:5.1
}
,{
x:.03,y:-.2,vx:.4,vy:-.3,spin:-3.8
}
,{
x:0,y:.28,vx:.22,vy:.48,spin:4.6
}
,{
x:-.02,y:-.3,vx:-.2,vy:-.4,spin:-5.4
}
],ed=ec.map(()=>{
let e=new s.Mesh(es,el);
return e.position.z=1.49,Z.add(e),e
}
),eh=new s.TetrahedronGeometry(.052,0),ep=[16775404,16765608].map(e=>new s.MeshBasicMaterial({
color:e,transparent:!0,opacity:0,depthTest:!1,depthWrite:!1,blending:s.AdditiveBlending
}
)),eu=[{
x:-.02,y:.72,vx:-.42,vy:.5,vz:.22,rx:4.8,ry:-3.2,rz:5.5,scale:.72
}
,{
x:.01,y:.58,vx:.5,vy:.36,vz:.3,rx:-5.2,ry:4.4,rz:-3.8,scale:1
}
,{
x:-.01,y:.42,vx:-.65,vy:.2,vz:.18,rx:3.6,ry:5.1,rz:4.2,scale:.82
}
,{
x:.02,y:.27,vx:.72,vy:.28,vz:.24,rx:-4.3,ry:-3.8,rz:5.8,scale:.68
}
,{
x:0,y:.12,vx:-.52,vy:.1,vz:.34,rx:5.7,ry:3.1,rz:-4.6,scale:1.08
}
,{
x:-.01,y:-.02,vx:.58,vy:.18,vz:.26,rx:-3.9,ry:5.6,rz:4.9,scale:.76
}
,{
x:.02,y:-.17,vx:-.76,vy:-.06,vz:.2,rx:4.5,ry:-5.2,rz:-3.4,scale:.88
}
,{
x:0,y:-.3,vx:.68,vy:-.12,vz:.36,rx:-5.5,ry:3.7,rz:5.2,scale:.64
}
,{
x:-.02,y:-.44,vx:-.46,vy:-.28,vz:.28,rx:3.4,ry:4.8,rz:-5.7,scale:.94
}
,{
x:.01,y:-.59,vx:.54,vy:-.38,vz:.22,rx:-4.7,ry:-3.5,rz:4.1,scale:.74
}
,{
x:0,y:-.72,vx:-.34,vy:-.5,vz:.3,rx:5.1,ry:4.2,rz:-4.8,scale:.62
}
,{
x:.01,y:.36,vx:.34,vy:.66,vz:.42,rx:-3.2,ry:5.8,rz:3.9,scale:.58
}
,{
x:-.01,y:-.36,vx:-.28,vy:-.62,vz:.38,rx:4.2,ry:-4.9,rz:5.4,scale:.7
}
,{
x:.02,y:0,vx:.82,vy:.02,vz:.16,rx:-5.8,ry:3.3,rz:-4.3,scale:.56
}
],em=eu.map((e,t)=>{
let a=new s.Mesh(eh,ep[t%ep.length]);
return a.position.set(e.x,e.y,1.5),a.scale.setScalar(0),Z.add(a),a
}
),ef=new s.CircleGeometry(.18,6),ex=new s.MeshBasicMaterial({
color:16775401,transparent:!0,opacity:0,depthTest:!1,depthWrite:!1,blending:s.AdditiveBlending,side:s.DoubleSide
}
),ey=new s.Mesh(ef,ex);
ey.position.set(0,0,1.493),ey.scale.setScalar(0),Z.add(ey);
let eg=[16775662,16763291].map(e=>new s.MeshBasicMaterial({
color:e,transparent:!0,opacity:0,depthTest:!1,depthWrite:!1,blending:s.AdditiveBlending
}
)),eM=[{
x:-2.2,y:.86,vx:-.38,vy:.28,vz:.25,rx:4.8,ry:-3.5,rz:5.1,scale:.72
}
,{
x:-.95,y:1.02,vx:-.18,vy:.42,vz:.32,rx:-4.2,ry:5.2,rz:-3.8,scale:.58
}
,{
x:.72,y:1.02,vx:.15,vy:.45,vz:.28,rx:5.4,ry:3.8,rz:4.6,scale:.66
}
,{
x:2.18,y:.78,vx:.42,vy:.3,vz:.36,rx:-5.1,ry:-4.3,rz:3.9,scale:.82
}
,{
x:2.42,y:.14,vx:.5,vy:.04,vz:.22,rx:3.7,ry:5.6,rz:-4.8,scale:.56
}
,{
x:2.2,y:-.8,vx:.4,vy:-.32,vz:.3,rx:-4.9,ry:3.4,rz:5.5,scale:.74
}
,{
x:.9,y:-1.02,vx:.18,vy:-.46,vz:.34,rx:5.2,ry:-5.1,rz:-3.6,scale:.62
}
,{
x:-.72,y:-1.02,vx:-.15,vy:-.43,vz:.24,rx:-3.8,ry:4.7,rz:5.2,scale:.68
}
,{
x:-2.18,y:-.8,vx:-.42,vy:-.3,vz:.38,rx:4.5,ry:3.9,rz:-5.4,scale:.78
}
,{
x:-2.42,y:-.08,vx:-.52,vy:-.02,vz:.27,rx:-5.6,ry:-3.7,rz:4.1,scale:.54
}
],ew=eM.map((e,t)=>{
let a=new s.Mesh(eh,eg[t%eg.length]);
return a.position.set(e.x,e.y,.07),a.scale.setScalar(0),V.add(a),a
}
);
Q.add(Z);
let ev=q.clone();
ev.needsUpdate=!0,ev.repeat.set(.75,1),ev.offset.set(0,0);
let eb=new s.MeshStandardMaterial({
map:ev,transparent:!1,opacity:1,alphaTest:.025,roughness:.76,metalness:0,side:s.DoubleSide
}
),eS=W.clone(),eT=new s.Mesh(eS,eb);
eT.castShadow=!0,eT.receiveShadow=!1;
let eA=new s.Group;
eA.position.set(-2.8,1.08,0),eA.add(eT),eA.visible=!1,o.add(eA);
let eC=new s.Quaternion,ez=new s.Object3D;
ez.position.set(0,1.05,1.15),ez.lookAt(d.position);
let eR=ez.quaternion.clone(),eP=()=>{
let e=a.parentElement,t=e.clientWidth,r=e.clientHeight;
i.setSize(t,r,!1),d.aspect=t/Math.max(r,1),d.updateProjectionMatrix()
}
,ek=new ResizeObserver(eP);
ek.observe(a.parentElement),eP();
let eE=0,eN=0,ej=0,eI=c.current,eB=a=>{
let n=r?.68:t.current,l=s.MathUtils.smoothstep(n,.74,1),h=c.current,p="detached"===h,u="perforation"===h,m="chopping"===h,f="tearing"===h,x="holding"===h,y=f||x||"settling"===h,g="attached"===h&&n>.74;
"attached"===h&&"attached"!==eI&&(ej=0),u&&"perforation"!==eI&&(eN=a),m&&"chopping"!==eI&&(ej=a),f&&"tearing"!==eI&&(eE=a),eI=h;
let w=u?Math.min(1,(a-eN)/480):0,v=ej>0?a-ej:Number.POSITIVE_INFINITY,b=v>=0&&v<220&&(m||f),T=b?Math.min(1,v/220):0,A=v-62,C=A>=0&&A<310&&(m||f||x),z=C?Math.min(1,A/310):0,R=y?Math.max(0,a-eE):p?990:0,P=Math.max(0,Math.min(1,(R-130-240)/620)),k=s.MathUtils.smootherstep(P,0,.48),E=s.MathUtils.smootherstep(P,0,1),N=y||p?6.76:.9+5.859999999999999*n,j=W.attributes.position.array;
for(let e=0;
e<=288;
e+=1){
let t=e/288*20.8-(20.8-N),a=1.435-Math.min(.065,Math.max(0,-t)/(2*Math.PI)*.018),i=t<0?t/1.435:0,r=t>0?t/Math.max(N,.001):0,n=t>=0?t+l*Math.pow(r,2)*.11:a*Math.sin(i),o=t>=0?1.435:a*Math.cos(i),s=.17*Math.pow(r,1.65)*(1-.72*l);
for(let t=0;
t<=8;
t+=1){
let a=t/8,i=3*(9*e+t),r=(a-.5)*2.16;
j[i]=n,j[i+1]=Math.max(-1.062,r-s),j[i+2]=o
}

}
W.attributes.position.needsUpdate=!0,W.computeVertexNormals();
let I=F.attributes.position.array;
for(let e=0;
e<=72;
e+=1){
let t=e/72,a=5.2*t,i=Math.sin(Math.PI*t)*Math.sin(Math.PI*P)*.008;
for(let t=0;
t<=8;
t+=1){
let r=t/8,n=3*(9*e+t),o=(r-.5)*2.16;
I[n]=a-2.6,I[n+1]=o,I[n+2]=i
}

}
F.attributes.position.needsUpdate=!0,F.computeVertexNormals();
let G=eS.attributes.position.array;
for(let e=0;
e<=288;
e+=1){
let t=e/288*15.600000000000001-14.040000000000001,a=1.435-Math.min(.05,Math.max(0,-t)/(2*Math.PI)*.018),i=t<0?t/1.435:0,r=t>0?t/1.56:0,n=t>=0?t:a*Math.sin(i),o=t>=0?1.435:a*Math.cos(i),s=.05*Math.pow(r,1.65);
for(let t=0;
t<=8;
t+=1){
let a=t/8,i=3*(9*e+t),r=(a-.5)*2.16;
G[i]=n,G[i+1]=Math.max(-1.062,r-s),G[i+2]=o
}

}
eS.attributes.position.needsUpdate=!0,eS.computeVertexNormals(),S.rotation.z=0,M.visible=!p,M.position.x=-2.8-10*E,M.position.y=1.08,M.position.z=0-.22*E,M.rotation.x=0,M.rotation.z=0,M.rotation.y=-(N-.9)/1.435;
let D=y||p?V:Q;
Z.parent!==D&&D.add(Z),Z.visible=g||u||b||C,Z.position.x=y||p?-2.6+B:1.56+B,Z.position.z=y||p?-1.435:0;
let L=s.MathUtils.smoothstep(T,0,.9),O=T<.12?T/.12:1-s.MathUtils.smoothstep(T,.62,1);
K.forEach(e=>{
g?e.opacity=.16+.36*l:u?e.opacity=.52*s.MathUtils.smoothstep(w,0,.38):e.opacity=b?.52*(1-s.MathUtils.smoothstep(T,.58,1)):0
}
),ee.opacity=b?.52*O:0,et.opacity=b?O:0,eo.position.x=.025,eo.position.y=s.MathUtils.lerp(1.4040000000000001,-1.4040000000000001,L),eo.scale.set(1,.86+.18*O,1);
let q=Math.max(0,Math.min(1,(T-.34)/.66));
el.opacity=b?.9*Math.sin(Math.PI*q):0,ed.forEach((e,t)=>{
let a=ec[t];
e.position.x=a.x+a.vx*q,e.position.y=a.y+a.vy*q-.18*q*q,e.position.z=1.49+.08*Math.sin(q*Math.PI),e.rotation.z=a.spin*q
}
);
let Y=Math.min(1,7*z),X=1-Math.pow(1-z,2),H=C?Y*Math.pow(1-z,1.55):0;
ep[0].opacity=H,ep[1].opacity=.82*H,em.forEach((e,t)=>{
let a=eu[t];
e.position.x=a.x+a.vx*X,e.position.y=a.y+a.vy*X-.34*z*z,e.position.z=1.5+a.vz*Math.sin(z*Math.PI*.84),e.rotation.set(a.rx*z,a.ry*z,a.rz*z),e.scale.setScalar(a.scale*Y*(1-.52*z))
}
),ex.opacity=C?Math.min(1,8*z)*Math.pow(1-z,3.4)*.82:0,ey.scale.setScalar(C?.35+1.8*X:0),ey.rotation.z=.9*z;
let _=Math.max(0,Math.min(1,(P-.46)/.5)),J=Math.min(1,6*_),$=1-Math.pow(1-_,2),ea=J*Math.pow(1-_,1.45);
(eg[0].opacity=ea,eg[1].opacity=.84*ea,ew.forEach((e,t)=>{
let a=eM[t];
e.position.x=1.12*a.x+a.vx*$,e.position.y=1.18*a.y+a.vy*$-.08*_*_,e.position.z=.07+a.vz*Math.sin(_*Math.PI*.9),e.rotation.set(a.rx*_,a.ry*_,a.rz*_),e.scale.setScalar(1.7*a.scale*J*(1-.48*_))
}
),eA.visible=y&&!p,eb.opacity=1,eA.position.set(M.position.x,1.08,M.position.z),eA.scale.set(1,1,1),eT.scale.x=1,y||p)?y?(Q.visible=!1,V.visible=!0,U.opacity=1-s.MathUtils.smoothstep(P,.36,.47),V.position.set(s.MathUtils.lerp(1.3600000000000003+.3*(1-Math.pow(1-Math.min(1,R/130),3)),0,k),s.MathUtils.lerp(1.08,1.05,k),s.MathUtils.lerp(1.435,1.15,k)),V.quaternion.slerpQuaternions(eC,eR,k),V.scale.setScalar(1)):(Q.visible=!1,V.visible=!1):(Q.visible=!0,V.visible=!1,U.opacity=1,V.position.set(-2.8,1.08,0),V.quaternion.copy(eC),V.scale.setScalar(1)),r&&(M.visible=!1,Q.visible=!1,V.visible=!1,eA.visible=!1),i.render(o,d),r||(e=requestAnimationFrame(eB))
}
;
return e=requestAnimationFrame(eB),()=>{
cancelAnimationFrame(e),ek.disconnect(),i.dispose(),m.dispose(),f.geometry.dispose(),x.dispose(),y.dispose(),g.dispose(),w.dispose(),T.dispose(),A.dispose(),C.dispose(),z.dispose(),R.dispose(),k.forEach(e=>e.dispose()),E.dispose(),N.geometry.dispose(),j.dispose(),I.geometry.dispose(),K.forEach(e=>e.dispose()),$.forEach(e=>e.dispose()),ee.dispose(),et.dispose(),ea.dispose(),ei.dispose(),el.dispose(),es.dispose(),ep.forEach(e=>e.dispose()),eh.dispose(),ex.dispose(),ef.dispose(),eg.forEach(e=>e.dispose()),ev.dispose(),eb.dispose(),eS.dispose(),q.dispose(),_.dispose(),W.dispose(),U.dispose(),F.dispose(),S.geometry.dispose()
}

}
,[t,r,n]),(0,i.jsx)("canvas",{
ref:l,className:"roll-canvas","aria-hidden":"true"
}
)
}
function p(e){
let t=e.toUpperCase().split(" ").filter(Boolean);
if(t.length<=1)return[t[0]||"ANTHONY"];
if(2===t.length)return t;
let a=Math.ceil(t.length/2);
return[t.slice(0,a).join(" "),t.slice(a).join(" ")]
}
function u(e){
let{
name:t
}
=e,a=(0,o.useMemo)(()=>p(t).slice(0,2),[t]),r=Math.max(...a.map(e=>e.length));
return(0,i.jsxs)("svg",{
id:"ticket-overlay",className:"ticket-overlay",viewBox:"0 0 520 280",xmlns:"http://www.w3.org/2000/svg",children:[(0,i.jsx)("title",{
children:"Startup School 2026 admission ticket for ".concat(t)
}
),(0,i.jsx)("desc",{
children:"An animated orange event ticket for July 25–26 at Chase Center in San Francisco."
}
),(0,i.jsxs)("g",{
className:"ticket-copy ticket-small",children:[(0,i.jsx)("text",{
x:"36",y:"43",children:"Y COMBINATOR PRESENTS"
}
),(0,i.jsx)("text",{
x:"36",y:"60",children:"STARTUP SCHOOL 2026"
}
)]
}
),(0,i.jsx)("g",{
className:"ticket-copy ticket-name","aria-label":t,style:{
fontSize:Math.max(16,Math.min(36,320/Math.max(r,7)))
}
,children:a.map((e,t)=>(0,i.jsx)("text",{
x:"36",y:1===a.length?158:137+43*t,children:e
}
,e))
}
),(0,i.jsx)("text",{
x:"36",y:"244",className:"ticket-copy ticket-small",children:"CHASE CENTER, SF \xb7 JULY 25–26"
}
),(0,i.jsx)("line",{
x1:"395.2",y1:"18",x2:"395.2",y2:"262",className:"ticket-separator"
}
),(0,i.jsx)("text",{
x:"451",y:"27",className:"ticket-copy ticket-admit",transform:"rotate(90 451 27)",children:"ADMIT ONE"
}
),(0,i.jsx)("text",{
x:"474",y:"13",className:"ticket-year",transform:"rotate(90 474 13)",children:"2026"
}
)]
}
)
}
async function m(e){
let t=e.cloneNode(!0);
t.setAttribute("width","520"),t.setAttribute("height","280");
let a=document.createElementNS("http://www.w3.org/2000/svg","style");
a.textContent='\n    .ticket-copy{
fill:#4a301d;
font-family:"Martian Mono","Courier New",monospace
}
\n    .ticket-small{
font-size:11px;
font-weight:400;
letter-spacing:.04em
}
\n    .ticket-name{
font-weight:500;
letter-spacing:-.02em
}
\n    .ticket-separator{
stroke:#4a301d;
stroke-width:1.5;
stroke-dasharray:4 4;
opacity:.2
}
\n    .ticket-admit{
font-size:40px;
font-weight:500;
letter-spacing:-.02em;
opacity:.4
}
\n    .ticket-year{
fill:#fff;
font-family:"Martian Mono",monospace;
font-size:90px;
font-weight:700;
letter-spacing:.05em;
opacity:.15;
mix-blend-mode:overlay
}
\n  ',t.prepend(a);
let i=new XMLSerializer().serializeToString(t),r=URL.createObjectURL(new Blob([i],{
type:"image/svg+xml;
charset=utf-8"
}
)),n=new Image;
return await new Promise((e,t)=>{
n.onload=e,n.onerror=t,n.src=r
}
),URL.revokeObjectURL(r),n
}
async function f(e){
await document.fonts.ready;
let t=document.createElement("canvas");
t.width=1560,t.height=840;
let a=t.getContext("2d"),i=e.getBoundingClientRect();
for(let t of e.querySelectorAll("canvas")){
let e=t.getBoundingClientRect(),r=getComputedStyle(t);
a.save(),a.globalAlpha=Number.parseFloat(r.opacity)||1,r.mixBlendMode&&"normal"!==r.mixBlendMode&&(a.globalCompositeOperation=r.mixBlendMode),a.drawImage(t,(e.left-i.left)/i.width*1560,(e.top-i.top)/i.height*840,e.width/i.width*1560,e.height/i.height*840),a.restore()
}
let r=await m(e.querySelector("#ticket-overlay"));
a.drawImage(r,0,0,t.width,t.height),function(e,t,a,i){
for(let[i,r,n]of(e.save(),e.globalCompositeOperation="destination-out",[[0,0,16],[t,0,16],[0,a,16],[t,a,16],[.76*t,0,14],[.76*t,a,14]]))e.beginPath(),e.arc(i,r,3*n,0,2*Math.PI),e.fill();
e.restore()
}
(a,t.width,t.height,0);
let n=document.createElement("canvas");
n.width=2160,n.height=1560;
let o=n.getContext("2d");
return o.fillStyle="#2E1F15",o.fillRect(0,0,n.width,n.height),o.drawImage(t,300,360),new Promise(e=>n.toBlob(e,"image/png"))
}
function x(e){
let{
name:t
}
=e,a=function(){
let[e,t]=(0,o.useState)(!1);
return(0,o.useEffect)(()=>{
let e=window.matchMedia("(prefers-reduced-motion: reduce)"),a=()=>t(e.matches);
return e.addEventListener("change",a),()=>e.removeEventListener("change",a)
}
,[]),e
}
(),s=function(e){
let[t,a]=(0,o.useState)({
offsetX:.15,offsetY:-.21,scale:2.2
}
);
return(0,o.useEffect)(()=>{
let t;
if(e)return;
let i=performance.now(),r=0,n=e=>{
let o=(e-i)/1e3;
e-r>33&&(r=e,a({
offsetY:-.21+.2*Math.sin(.5*o),offsetX:.15+.15*Math.cos(.35*o),scale:2.2+.3*Math.sin(.3*o)
}
)),t=requestAnimationFrame(n)
}
;
return t=requestAnimationFrame(n),()=>cancelAnimationFrame(t)
}
,[e]),t
}
(a),p=function(e){
let t=(0,o.useRef)(null);
return(0,o.useEffect)(()=>{
let a;
let i=t.current;
if(!i)return;
let r=!1,n=0,o=0,s=0,l=0,c=0,d=0,h=performance.now(),p=t=>{
if("touch"===t.pointerType||e)return;
r=!0;
let a=i.getBoundingClientRect();
n=(t.clientX-a.left)/a.width-.5,o=(t.clientY-a.top)/a.height-.5
}
,u=()=>{
r=!1
}
,m=t=>{
let p=Math.min(.032,(t-h)/1e3);
h=t;
let u=e||!r?0:n,f=e||!r?0:o;
c+=(u-s)*100*p,d+=(f-l)*100*p,c*=Math.exp(-20*p),d*=Math.exp(-20*p),s+=c*p,l+=d*p,i.style.setProperty("--tilt-x","".concat((16*l).toFixed(3),"deg")),i.style.setProperty("--tilt-y","".concat((-(16*s)).toFixed(3),"deg")),i.style.setProperty("--ticket-x","".concat((16*s).toFixed(3),"px")),i.style.setProperty("--ticket-y","".concat((-(16*l)).toFixed(3),"px")),a=requestAnimationFrame(m)
}
;
return i.addEventListener("pointermove",p),i.addEventListener("pointerleave",u),a=requestAnimationFrame(m),()=>{
i.removeEventListener("pointermove",p),i.removeEventListener("pointerleave",u),cancelAnimationFrame(a)
}

}
,[e]),t
}
(a),m=(0,o.useRef)(null),[x,y]=(0,o.useState)(!1),g=function(e){
let t=(0,o.useRef)(null),a=(0,o.useRef)(e?.68:0),[i,r]=(0,o.useState)(e?"detached":"attached"),n=(0,o.useRef)(i),s=(0,o.useRef)({
active:!1,startX:0,startPull:0,pull:0,history:[]
}
),l=(0,o.useRef)(),c=(0,o.useRef)(),d=(0,o.useRef)(null),h=()=>{
if(!d.current){
let e=window.AudioContext||window.webkitAudioContext;
if(!e)return null;
let t=new e,a=t.createGain();
a.gain.value=.18,a.connect(t.destination),d.current={
context:t,master:a
}

}
let e=d.current;
return"suspended"===e.context.state&&e.context.resume().catch(()=>{

}
),e
}
,p=(e,t)=>{
let a=Math.ceil(e.sampleRate*t),i=e.createBuffer(1,a,e.sampleRate),r=i.getChannelData(0);
for(let e=0;
e<a;
e+=1)r[e]=2*Math.random()-1;
let n=e.createBufferSource();
return n.buffer=i,n
}
,u=(e,t)=>{
let a=Math.ceil(e.sampleRate*t),i=e.createBuffer(1,a,e.sampleRate),r=i.getChannelData(0),n=0;
for(let e=0;
e<a;
e+=1){
let t=e/a,i=Math.sin(Math.min(1,t/.035)*Math.PI*.5),o=Math.pow(1-t,.72),s=2*Math.random()-1;
n=.62*n+.38*s;
let l=Math.exp(-(23*t%1*19))*(2*Math.random()-1),c=Math.random()>.988?(2*Math.random()-1)*.85:0;
r[e]=Math.max(-1,Math.min(1,(.46*n+.16*s+.72*l+c)*i*o))
}
let o=e.createBufferSource();
return o.buffer=i,o
}
,m=()=>{
let e=h();
if(!e)return;
let{
context:t,master:a
}
=e,i=t.currentTime+.008,r=u(t,.28),n=t.createBiquadFilter(),o=t.createGain();
n.type="bandpass",n.frequency.setValueAtTime(2050,i),n.frequency.exponentialRampToValueAtTime(720,i+.28),n.Q.value=.68,o.gain.setValueAtTime(1e-4,i),o.gain.linearRampToValueAtTime(.66,i+.012),o.gain.exponentialRampToValueAtTime(1e-4,i+.28);
let s=t.createBiquadFilter(),l=t.createGain();
s.type="highpass",s.frequency.setValueAtTime(2850,i),l.gain.setValueAtTime(1e-4,i),l.gain.linearRampToValueAtTime(.24,i+.008),l.gain.exponentialRampToValueAtTime(1e-4,i+.25760000000000005),r.connect(n).connect(o).connect(a),r.connect(s).connect(l).connect(a),r.start(i),r.stop(i+.28)
}
,f=()=>{
let e=h();
if(!e)return;
let{
context:t,master:a
}
=e,i=t.currentTime+.012;
[880,1108.73,1318.51,1760].forEach((e,r)=>{
let n=i+.055*r,o=t.createOscillator(),s=t.createGain();
o.type=0===r?"triangle":"sine",o.frequency.setValueAtTime(e,n),o.frequency.exponentialRampToValueAtTime(1.018*e,n+.68),s.gain.setValueAtTime(1e-4,n),s.gain.linearRampToValueAtTime(0===r?.115:.085,n+.025),s.gain.exponentialRampToValueAtTime(1e-4,n+.76),o.connect(s).connect(a),o.start(n),o.stop(n+.78)
}
);
let r=p(t,.62),n=t.createBiquadFilter(),o=t.createGain();
n.type="highpass",n.frequency.setValueAtTime(5200,i),o.gain.setValueAtTime(1e-4,i),o.gain.linearRampToValueAtTime(.075,i+.035),o.gain.exponentialRampToValueAtTime(1e-4,i+.58),r.connect(n).connect(o).connect(a),r.start(i),r.stop(i+.62)
}
,x=e=>{
var i;
let r=Math.max(0,Math.min(1,e));
s.current.pull=r,a.current=r,null===(i=t.current)||void 0===i||i.style.setProperty("--pull","".concat(r))
}
,y=(e,t,a)=>{
cancelAnimationFrame(l.current);
let i=s.current.pull,r=performance.now(),n=o=>{
let s=Math.min(1,(o-r)/t);
x(i+(e-i)*(1-Math.pow(1-s,4))),s<1?l.current=requestAnimationFrame(n):null==a||a()
}
;
l.current=requestAnimationFrame(n)
}
,g=function(e){
let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,a=arguments.length>2?arguments[2]:void 0;
cancelAnimationFrame(l.current);
let i=s.current.pull,r=t,n=performance.now(),o=0===e?1:.86,c=2*Math.PI/.36,d=t=>{
let s=Math.min(.032,Math.max(.001,(t-n)/1e3));
n=t;
let h=-c*c*(i-e)-2*o*c*r;
r+=h*s,x(i+=r*s),Math.abs(i-e)>.001||Math.abs(r)>.004?l.current=requestAnimationFrame(d):(x(e),null==a||a())
}
;
l.current=requestAnimationFrame(d)
}
,M=function(){
let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0;
if("attached"!==n.current||e)return;
h(),n.current="tension",r("tension");
let a=Number.isFinite(t)?Math.max(0,t):0,i=()=>{
n.current="perforation",r("perforation"),c.current=window.setTimeout(()=>{
n.current="chopping",r("chopping"),m(),c.current=window.setTimeout(()=>{
n.current="tearing",r("tearing"),c.current=window.setTimeout(()=>{
n.current="holding",r("holding"),c.current=window.setTimeout(()=>{
n.current="settling",r("settling"),f(),c.current=window.setTimeout(()=>{
n.current="detached",r("detached"),x(.68)
}
,620)
}
,240)
}
,130)
}
,95)
}
,480)
}
;
a>.01?g(1,a,i):y(1,Math.max(300,(1-s.current.pull)*780),i)
}
;
return(0,o.useEffect)(()=>()=>{
var e;
cancelAnimationFrame(l.current),clearTimeout(c.current),null===(e=d.current)||void 0===e||e.context.close().catch(()=>{

}
)
}
,[]),{
dragRef:t,progressRef:a,phase:i,tear:M,reset:()=>{
clearTimeout(c.current),n.current="attached",r("attached"),x(0)
}
,onPointerDown:t=>{
"attached"!==n.current||e||(h(),cancelAnimationFrame(l.current),s.current.active=!0,s.current.startX=t.clientX,s.current.startPull=s.current.pull,s.current.history=[{
pull:s.current.pull,time:t.timeStamp
}
],t.currentTarget.setPointerCapture(t.pointerId))
}
,onPointerMove:e=>{
if(!s.current.active)return;
let t=s.current.startPull+(e.clientX-s.current.startX)/150;
if(t<=.74)x(t);
else{
let e=t-.74;
x(.74+.624*e/(.26+2.4*Math.abs(e)))
}
s.current.history.push({
pull:s.current.pull,time:e.timeStamp
}
);
let a=e.timeStamp-90;
s.current.history=s.current.history.filter(e=>e.time>=a).slice(-6)
}
,onPointerUp:()=>{
if(!s.current.active)return;
s.current.active=!1;
let e=s.current.history,t=e[0],a=e[e.length-1],i=t&&a?Math.max(16,a.time-t.time):16,r=t&&a?(a.pull-t.pull)/(i/1e3):0,n=s.current.pull+.14*r,o=s.current.pull>=.92&&r>-.08,l=s.current.pull>.775&&r>.12&&n>=.92;
if(o||l){
M(r);
return
}
g(s.current.pull>.58&&r>-.7?.74:0,r)
}

}

}
(a),M=async()=>{
if(!x&&m.current){
y(!0);
try{
let e=await f(m.current);
if(!e)throw Error("Ticket export failed");
let a=URL.createObjectURL(e),i=document.createElement("a");
i.href=a,i.download="startup-school-2026-".concat(t.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,""),".png"),i.click(),setTimeout(()=>URL.revokeObjectURL(a),1e3)
}
catch(e){
console.error(e)
}
finally{
y(!1)
}

}

}
;
return(0,i.jsxs)("div",{
className:"yc-root",children:[(0,i.jsx)("img",{
className:"page-background",src:"https://bookface-static.ycombinator.com/vite/assets/page-bg-C27Z9D2J.png",alt:"","aria-hidden":"true"
}
),(0,i.jsx)("a",{
className:"back-link",href:"/yc","aria-label":"YC ticket",children:"/yc"
}
),(0,i.jsx)("main",{
className:"page-shell",children:(0,i.jsxs)("section",{
className:"ticket-stage","aria-labelledby":"ticket-title",children:[(0,i.jsx)("h1",{
id:"ticket-title",className:"visually-hidden",children:"Startup School 2026 admission ticket"
}
),(0,i.jsxs)("div",{
className:"ticket-machine is-".concat(g.phase),children:["detached"===g.phase&&(0,i.jsxs)("div",{
className:"final-ticket-callout",role:"status",children:[(0,i.jsx)("span",{
children:"TICKET SECURED"
}
),(0,i.jsx)("strong",{
children:"Don’t lose it. You only get one… probably."
}
)]
}
),(0,i.jsx)(h,{
progressRef:g.progressRef,phase:g.phase,reduced:a,name:t
}
),(0,i.jsx)("div",{
className:"feed-shadow","aria-hidden":"true"
}
),(0,i.jsx)("div",{
className:"tear-seam","aria-hidden":"true",children:(0,i.jsx)("span",{

}
)
}
),(0,i.jsx)("div",{
ref:g.dragRef,className:"ticket-pull",onPointerDown:g.onPointerDown,onPointerMove:g.onPointerMove,onPointerUp:g.onPointerUp,onPointerCancel:g.onPointerUp,children:(0,i.jsx)("div",{
className:"ticket-perspective",children:(0,i.jsx)("div",{
ref:p,className:"ticket-tilt",children:(0,i.jsxs)("div",{
ref:m,id:"ticket-artwork",className:"ticket-artwork","data-capture-area":!0,role:"img","aria-label":"Startup School 2026 admission ticket for ".concat(t),children:[(0,i.jsx)("div",{
className:"mesh-layer","aria-hidden":"true",children:(0,i.jsx)(r.bL,{
width:"100%",height:"100%",colors:l,distortion:.6,swirl:.3,speed:a?0:1.8,grainMixer:0,grainOverlay:0,scale:1,rotation:0,offsetX:0,offsetY:0,webGlContextAttributes:{
preserveDrawingBuffer:!0
}

}
)
}
),(0,i.jsx)(d,{

}
),(0,i.jsx)("div",{
className:"glass-layer","aria-hidden":"true",children:(0,i.jsx)(n.k4,{
width:"100%",height:"100%",...c,offsetX:s.offsetX,offsetY:s.offsetY,scale:s.scale,fit:"cover",webGlContextAttributes:{
preserveDrawingBuffer:!0
}

}
)
}
),(0,i.jsx)(u,{
name:t
}
)]
}
)
}
)
}
)
}
)]
}
),(0,i.jsxs)("div",{
className:"ticket-actions",children:[(0,i.jsxs)("button",{
className:"tear-button",type:"button",onClick:"detached"===g.phase?g.reset:g.tear,disabled:"tension"===g.phase||"perforation"===g.phase||"chopping"===g.phase||"tearing"===g.phase||"holding"===g.phase||"settling"===g.phase,children:[(0,i.jsx)("span",{
children:"detached"===g.phase?"ROLL ANOTHER":"attached"===g.phase?"TEAR OFF TICKET":"perforation"===g.phase?"LINE IT UP…":"chopping"===g.phase?"CHOP!":"settling"===g.phase?"SETTLING…":"TEARING…"
}
),(0,i.jsx)("span",{
"aria-hidden":"true",children:"→"
}
)]
}
),(0,i.jsxs)("button",{
className:"save-button",type:"button",onClick:M,disabled:x||"detached"!==g.phase,children:[(0,i.jsx)("svg",{
"aria-hidden":"true",viewBox:"0 0 24 24",width:"12",height:"12",children:(0,i.jsx)("path",{
d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"
}
)
}
),(0,i.jsx)("span",{
children:x?"SAVING...":"SAVE"
}
)]
}
)]
}
),(0,i.jsx)("div",{
className:"caption-spacer","aria-hidden":"true"
}
)]
}
)
}
)]
}
)
}

}
,908:function(){

}

}
,function(e){
e.O(0,[284,689,983,971,23,744],function(){
return e(e.s=1827)
}
),_N_E=e.O()
}
]);
