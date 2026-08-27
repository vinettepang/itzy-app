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
i.data[e]=t,i.data[e+1]=t,i.data[e+2]=t,i.data[e+3]=255}a.putImageData(i,0,0)},[]),(0,i.jsx)("canvas",{
ref:e,className:"paper-noise",width:"800",height:"400","aria-hidden":"true"})}