function p(e){
let t=e.toUpperCase().split(" ").filter(Boolean);
if(t.length<=1)return[t[0]||"ANTHONY"];
if(2===t.length)return t;
let a=Math.ceil(t.length/2);
return[t.slice(0,a).join(" "),t.slice(a).join(" ")]}