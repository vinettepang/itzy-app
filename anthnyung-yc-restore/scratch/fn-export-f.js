function f(e){
await document.fonts.ready;
let t=document.createElement("canvas");
t.width=1560,t.height=840;
let a=t.getContext("2d"),i=e.getBoundingClientRect();
for(let t of e.querySelectorAll("canvas")){
let e=t.getBoundingClientRect(),r=getComputedStyle(t);
a.save(),a.globalAlpha=Number.parseFloat(r.opacity)||1,r.mixBlendMode&&"normal"!==r.mixBlendMode&&(a.globalCompositeOperation=r.mixBlendMode),a.drawImage(t,(e.left-i.left)/i.width*1560,(e.top-i.top)/i.height*840,e.width/i.width*1560,e.height/i.height*840),a.restore()}let r=await m(e.querySelector("#ticket-overlay"));
a.drawImage(r,0,0,t.width,t.height),function(e,t,a,i){
for(let[i,r,n]of(e.save(),e.globalCompositeOperation="destination-out",[[0,0,16],[t,0,16],[0,a,16],[t,a,16],[.76*t,0,14],[.76*t,a,14]]))e.beginPath(),e.arc(i,r,3*n,0,2*Math.PI),e.fill();
e.restore()}(a,t.width,t.height,0);
let n=document.createElement("canvas");
n.width=2160,n.height=1560;
let o=n.getContext("2d");
return o.fillStyle="#2E1F15",o.fillRect(0,0,n.width,n.height),o.drawImage(t,300,360),new Promise(e=>n.toBlob(e,"image/png"))}