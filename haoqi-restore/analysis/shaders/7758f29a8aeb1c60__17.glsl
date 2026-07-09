,position:"absolute",height:2,width:10,borderRadius:1,backgroundColor:"currentColor"},"&::after":{transform:"rotate(45deg)"},"&::before":{transform:"rotate(-45deg)"}});var lF=nS({component:function(){let{label:e,value:t,onUpdate:r,disabled:n}=n9(),{popinRef:i,wrapperRef:o,shown:a,show:l,hide:s}=lo(),c=(0,u.useCallback)(e=>{e.length&&r(e[0])},[r]),f=(0,u.useCallback)(e=>{e.stopPropagation(),r(void 0)},[r]),{getRootProps:d,getInputProps:h,isDragAccept:p}=a4({maxFiles:1,accept:"image/*",onDrop:c,disabled:n});return u.default.createElement(i_,{input:!0},u.default.createElement(ik,null,e),u.default.createElement(lw,null,u.default.createElement(lR,{ref:i,hasImage:!!t,onPointerDown:()=>!!t&&l(),onPointerUp:s,style:{backgroundImage:t?`url(${t})`:"none"}}),a&&!!t&&u.default.createElement(iD,null,u.default.createElement(iR,{onPointerUp:s,style:{cursor:"pointer"}}),u.default.createElement(lS,{ref:o,style:{backgroundImage:`url(${t})`}})),u.default.createElement(lM,d({isDragAccept:p}),u.default.createElement("input",h()),u.default.createElement(lT,null,p?"drop image":"click or drop")),u.default.createElement(lD,{onClick:f,disabled:!t})))}},lE);let lP=I().number(),lI=e=>({min:e[0],max:e[1]}),lk=(e,{bounds:[t,r]},n)=>{let i=Array.isArray(e)?lI(e):e,{min:o,max:a}=nS(nS({},{min:n[0],max:n[1]}),i);return[nT(Number(o),t,Math.max(t,a)),nT(Number(a),Math.min(r,o),r)]};var lO=Object.freeze({__proto__:null,schema:(e,t)=>I().array().length(2).every.number().test(e)&&I().schema({min:lP,max:lP}).test(t),format:lI,sanitize:lk,normalize:({value:e,min:t,max:r})=>{let n={min:t,max:r},i=nS(nS({},of(lI(e),{min:n,max:n})),{},{bounds:[t,r]});return{value:lk(lI(e),i,e),settings:i}}});let lG=["value","bounds","onDrag"],lL=["bounds"],lH=ir("div",{display:"grid",columnGap:"$colGap",gridTemplateColumns:"auto calc($sizes$numberInputMinWidth * 2 + $space$rowGap)"});function l_(e){let{value:t,bounds:[r,n],onDrag:i}=e,o=nd(e,lG),a=(0,u.useRef)(null),l=(0,u.useRef)(null),s=(0,u.useRef)(null),c=(0,u.useRef)(0),f=il("sizes","scrubberWidth"),d=iU(({event:e,first:u,xy:[d],movement:[h],memo:p={}})=>{if(u){let{width:i,left:o}=a.current.getBoundingClientRect();c.current=i-parseFloat(f);let u=(null==e?void 0:e.target)===l.current||(null==e?void 0:e.target)===s.current;p.pos=nI((d-o)/i,r,n);let h=Math.abs(p.pos-t.min)-Math.abs(p.pos-t.max);p.key=h<0||0===h&&p.pos<=t.min?"min":"max",u&&(p.pos=t[p.key])}let m=p.pos+nI(h/c.current,0,n-r);return i({[p.key]:iq(m,o[p.key])}),p}),h=`calc(${nP(t.min,r,n)} * (100% - ${f} - 8px) + 4px)`,p=`calc(${1-nP(t.max,r,n)} * (100% - ${f} - 8px) + 4px)`;return u.default.createElement(iW,n1({ref:a},d()),u.default.createElement(iz,null,u.default.createElement(iY,{style:{left:h,right:p}})),u.default.createElement(iV,{position:"left",ref:l,style:{left:h}}),u.default.createElement(iV,{position:"right",ref:s,style:{right:p}}))}var lj=nS({component:function(){let{label:e,displayValue:t,onUpdate:r,settings:n}=n9(),i=nd(n,lL);return u.default.createElement(u.default.Fragment,null,u.default.createElement(i_,{input:!0},u.default.createElement(ik,null,e),u.default.createElement(lH,null,u.default.createElement(l_,n1({value:t},n,{onDrag:r})),u.default.createElement(oc,{value:t,settings:i,onUpdate:r,innerLabelTrim:0}))))}},lO);let lU=["type","value"],lN=["onChange","transient","onEditStart","onEditEnd"],lJ=new function(){var e;let t,r,n,i,o,a,l,s,c,f=(l="function"==typeof(t=()=>({data:{}}),e=(e,r,n)=>{let i=n.subscribe;return n.subscribe=(e,t,r)=>{let o=e;if(t){let i=(null==r?void 0:r.equalityFn)||Object.is,a=e(n.getState());o=r=>{let n=e(r);if(!i(a,n)){let e=a;t(a=n,e)}},(null==r?void 0:r.fireImmediately)&&t(a,a)}return i(o)},t(e,r,n)})?(n=new Set,i=(e,t)=>{let i="function"==typeof e?e(r):e;if(i!==r){let e=r;r=t?i:Object.assign({},r,i),n.forEach(t=>t(r,e))}},o=()=>r,a={setState:i,getState:o,subscribe:(e,t,i)=>t||i?((e,t=o,i=Object.is)=>{console.warn("[DEPRECATED] Please use `subscribeWithSelector` middleware");let a=t(r);function l(){let n=t(r);if(!i(a,n)){let t=a;e(a=n,t)}}return n.add(l),()=>n.delete(l)})(e,t,i):(n.add(e),()=>n.delete(e)),destroy:()=>n.clear()},r=e(i,o,a),a):e,Object.assign(s=(e=l.getState,t=Object.is)=>{let r,[,n]=(0,u.useReducer)(e=>e+1,0),i=l.getState(),o=(0,u.useRef)(i),a=(0,u.useRef)(e),s=(0,u.useRef)(t),c=(0,u.useRef)(!1),f=(0,u.useRef)();void 0===f.current&&(f.current=e(i));let d=!1;(o.current!==i||a.current!==e||s.current!==t||c.current)&&(r=e(i),d=!t(f.current,r)),le(()=>{d&&(f.current=r),o.current=i,a.current=e,s.current=t,c.current=!1});let h=(0,u.useRef)(i);le(()=>{let e=()=>{try{let e=l.getState(),t=a.current(e);s.current(f.current,t)||(o.current=e,f.current=t,n())}catch(e){c.current=!0,n()}},t=l.subscribe(e);return l.getState()!==h.current&&e(),t},[]);let p=d?r:f.current;return(0,u.useDebugValue)(p),p},l),s[Symbol.iterator]=function(){console.warn("[useStore, api] = create() is deprecated and will be removed in v4");let e=[s,l];return{next(){let t=e.length<=0;return{value:e.shift(),done:t}}}},s),d=(c=new Map,{on:(e,t)=>{let r=c.get(e);void 0===r&&(r=new Set,c.set(e,r)),r.add(t)},off:(e,t)=>{let r=c.get(e);void 0!==r&&(r.delete(t),0===r.size&&c.delete(e))},emit:(e,...t)=>{let r=c.get(e);if(void 0!==r)for(let e of r)e(...t)}});this.storeId="_"+Math.random().toString(36).substr(2,9),this.useStore=f;let h={},p=new Set;this.getVisiblePaths=()=>{let e=this.getData(),t=Object.keys(e),r=[];Object.entries(h).forEach(([e,n])=>{n.render&&t.some(t=>0===t.indexOf(e))&&!n.render(this.get)&&r.push(e+".")});let n=[];return p.forEach(t=>{t in e&&e[t].__refCount>0&&r.every(e=>-1===t.indexOf(e))&&(!e[t].render||e[t].render(this.get))&&n.push(t)}),n},this.setOrderedPaths=e=>{e.forEach(e=>p.add(e))},this.orderPaths=e=>(this.setOrderedPaths(e),e),this.disposePaths=e=>{f.setState(t=>{let r=t.data;return e.forEach(e=>{if(e in r){let t=r[e];t.__refCount--,0===t.__refCount&&t.type in n_&&delete r[e]}}),{data:r}})},this.dispose=()=>{f.setState(()=>({data:{}}))},this.getFolderSettings=e=>h[e]||{},this.getData=()=>f.getState().data,this.addData=(e,t)=>{f.setState(r=>{let n=r.data;return Object.entries(e).forEach(([e,r])=>{let i=n[e];if(i){let{type:n,value:o}=r,a=nd(r,lU);n!==i.type?ng(nh.INPUT_TYPE_OVERRIDE,e,i.type,n):((0===i.__refCount||t)&&Object.assign(i,a),i.__refCount++)}else n[e]=nS(nS({},r),{},{__refCount:1})}),{data:n}})},this.setValueAtPath=(e,t,r)=>{f.setState(n=>{let i=n.data;return nK(i[e],t,e,this,r),{data:i}})},this.setSettingsAtPath=(e,t)=>{f.setState(r=>{let n=r.data;return n[e].settings=nS(nS({},n[e].settings),t),{data:n}})},this.disableInputAtPath=(e,t)=>{f.setState(r=>{let n=r.data;return n[e].disabled=t,{data:n}})},this.set=(e,t)=>{f.setState(r=>{let n=r.data;return Object.entries(e).forEach(([e,r])=>{try{nK(n[e],r,void 0,void 0,t)}catch(e){}}),{data:n}})},this.getInput=e=>{try{return this.getData()[e]}catch(t){ng(nh.PATH_DOESNT_EXIST,e)}},this.get=e=>{var t;return null==(t=this.getInput(e))?void 0:t.value},this.emitOnEditStart=e=>{d.emit(`onEditStart:${e}`,this.get(e),e,nS(nS({},this.getInput(e)),{},{get:this.get}))},this.emitOnEditEnd=e=>{d.emit(`onEditEnd:${e}`,this.get(e),e,nS(nS({},this.getInput(e)),{},{get:this.get}))},this.subscribeToEditStart=(e,t)=>{let r=`onEditStart:${e}`;return d.on(r,t),()=>d.off(r,t)},this.subscribeToEditEnd=(e,t)=>{let r=`onEditEnd:${e}`;return d.on(r,t),()=>d.off(r,t)};let m=(e,t,r)=>{let n={};return Object.entries(e).forEach(([e,i])=>{if(""===e)return ng(nh.EMPTY_KEY);let o=ln(t,e);if(i.type===n_.FOLDER)Object.assign(n,m(i.schema,o,r)),o in h||(h[o]=i.settings);else if(e in r)ng(nh.DUPLICATE_KEYS,e,o,r[e].path);else{let t=function(e,t,r,n){let i=function e(t,r,n={},i){var o,a;let l;if("object"!=typeof t||Array.isArray(t))return{type:i,input:t,options:nS({key:r,label:r,optional:!1,disabled:!1,order:0},n)};if("__customInput"in t){let{type:n,__customInput:i}=t;return e(i,r,nd(t,nU),n)}let{render:s,label:u,optional:c,order:f=0,disabled:d,hint:h,onChange:p,onEditStart:m,onEditEnd:g,transient:v}=t,A=nd(t,nN),y=nS({render:s,key:r,label:null!=u?u:r,hint:h,transient:null!=v?v:!!p,onEditStart:m,onEditEnd:g,disabled:d,optional:c,order:f},n),{type:b}=A,x=nd(A,nJ);if((b=null!=i?i:b)in n_)return{type:b,input:x,options:y};if(i&&nH(x)&&"value"in x)l=x.value;else l=nH(x)&&0===Object.keys(x).length?void 0:x;return{type:b,input:l,options:nS(nS({},y),{},{onChange:p,optional:null!=(o=y.optional)&&o,disabled:null!=(a=y.disabled)&&a})}}(e,t),{type:o,input:a,options:l}=i;if(o)return o in n_?i:{type:o,input:nw(o,a,r,n),options:l};let s=nB(a);return s?{type:s,input:nw(s,a,r,n),options:l}:!!(s=nB({value:a}))&&{type:s,input:nw(s,{value:a},r,n),options:l}}(i,e,o,n);if(t){let{type:i,options:a,input:l}=t,{onChange:s,transient:u,onEditStart:c,onEditEnd:f}=a,d=nd(a,lN);n[o]=nS(nS(nS({type:i},d),l),{},{fromPanel:!0}),r[e]={path:o,onChange:s,transient:u,onEditStart:c,onEditEnd:f}}else ng(nh.UNKNOWN_INPUT,o,i)}}),n};this.getDataFromSchema=e=>{let t={};return[m(e,"",t),t]}},lK={collapsed:!1};function l$(e,t){return{type:n_.FOLDER,schema:e,settings:nS(nS({},lK),t)}}let lz=["type","label","path","valueKey","value","settings","setValue","disabled"];function lV(e){let{type:t,label:r,path:n,valueKey:i,value:o,settings:a,setValue:l,disabled:s}=e,c=nd(e,lz),{displayValue:f,onChange:d,onUpdate:h}=ij({type:t,value:o,settings:a,setValue:l}),p=nC[t].component;return p?u.default.createElement(n2.Provider,{value:nS({key:i,path:n,id:""+n,label:r,displayValue:f,value:o,onChange:d,onUpdate:h,settings:a,setValue:l,disabled:s},c)},u.default.createElement(iM,{disabled:s},u.default.createElement(p,null))):(ng(nh.NO_COMPONENT_FOR_TYPE,t,n),null)}let lW=ir("button",{display:"block",$reset:"",fontWeight:"$button",height:"$rowHeight",borderStyle:"none",borderRadius:"$sm",backgroundColor:"$elevation1",color:"$highlight1","&:not(:disabled)":{color:"$highlight3",backgroundColor:"$accent2",cursor:"pointer",$hover:"$accent3",$active:"$accent3 $accent1",$focus:""}}),lY=ir("div",{$flex:"",justifyContent:"flex-end",gap:"$colGap"}),lQ=ir("button",{$reset:"",cursor:"pointer",borderRadius:"$xs","&:hover":{backgroundColor:"$elevation3"}}),lX=ir("canvas",{height:"$monitorHeight",width:"100%",display:"block",borderRadius:"$sm"}),lZ=(0,u.forwardRef)(function({initialValue:e},t){let r,n,i,o=il("colors","highlight3"),a=il("colors","elevation2"),l=il("colors","highlight1"),[s,c]=(0,u.useMemo)(()=>[oN(l).alpha(.4).toRgbString(),oN(l).alpha(.1).toRgbString()],[l]),f=(0,u.useRef)([e]),d=(0,u.useRef)(e),h=(0,u.useRef)(e),p=(0,u.useRef)(),m=(0,u.useCallback)((e,t)=>{if(!e)return;let{width:r,height:n}=e,i=new Path2D,l=r/100,u=.05*n;for(let e=0;e<f.current.length;e++){let t=nP(f.current[e],d.current,h.current),r=l*e,o=n-t*(n-2*u)-u;i.lineTo(r,o)}t.clearRect(0,0,r,n);let p=new Path2D(i);p.lineTo(l*(f.current.length+1),n),p.lineTo(0,n),p.lineTo(0,0);let m=t.createLinearGradient(0,0,0,n);m.addColorStop(0,s),m.addColorStop(1,c),t.fillStyle=m,t.fill(p),t.strokeStyle=a,t.lineJoin="round",t.lineWidth=14,t.stroke(i),t.strokeStyle=o,t.lineWidth=2,t.stroke(i)},[o,a,s,c]),[g,v]=(r=(0,u.useRef)(null),n=(0,u.useRef)(null),i=(0,u.useRef)(!1),(0,u.useEffect)(()=>{let e=nV(()=>{r.current.width=r.current.offsetWidth*window.devicePixelRatio,r.current.height=r.current.offsetHeight*window.devicePixelRatio,m(r.current,n.current)},250);return window.addEventListener("resize",e),i.current||(e(),i.current=!0),()=>window.removeEventListener("resize",e)},[m]),(0,u.useEffect)(()=>{n.current=r.current.getContext("2d")},[]),[r,n]);return(0,u.useImperativeHandle)(t,()=>({frame:e=>{var t;(void 0===d.current||e<d.current)&&(d.current=e),(void 0===h.current||e>h.current)&&(h.current=e),t=f.current,t.push(e),t.length>100&&t.shift(),p.current=requestAnimationFrame(()=>m(g.current,v.current))}}),[g,v,m]),(0,u.useEffect)(()=>()=>cancelAnimationFrame(p.current),[]),u.default.createElement(lX,{ref:g})}),lq=e=>Number.isFinite(e)?e.toPrecision(2):e.toString(),l0=(0,u.forwardRef)(function({initialValue:e},t){let[r,n]=(0,u.useState)(lq(e));return(0,u.useImperativeHandle)(t,()=>({frame:e=>n(lq(e))}),[]),u.default.createElement("div",null,r)});function l1(e){return"function"==typeof e?e():e.current}let l2=["type","label","key"],l9={[n_.BUTTON]:function({onClick:e,settings:t,label:r}){let n=n4();return u.default.createElement(i_,null,u.default.createElement(lW,{disabled:t.disabled,onClick:()=>e(n.get)},r))},[n_.BUTTON_GROUP]:function(e){let{label:t,opts:r}=(({label:e,opts:t})=>{let r="string"==typeof e&&""===e.trim()?null:e,n=t;return"object"==typeof t.opts&&(void 0!==n.label&&(r=t.label),n=t.opts),{label:r,opts:n}})(e),n=n4();return u.default.createElement(i_,{input:!!t},t&&u.default.createElement(ik,null,t),u.default.createElement(lY,null,Object.entries(r).map(([e,t])=>u.default.createElement(lQ,{key:e,onClick:()=>t(n.get)},e))))},[n_.MONITOR]:function({label:e,objectOrFn:t,settings:r}){let n=(0,u.useRef)(),i=(0,u.useRef)(l1(t));return(0,u.useEffect)(()=>{let e=window.setInterval(()=>{var e;document.hidden||null==(e=n.current)||e.frame(l1(t))},r.interval);return()=>window.clearInterval(e)},[t,r.interval]),u.default.createElement(i_,{input:!0},u.default.createElement(ik,{align:"top"},e),r.graph?u.default.createElement(lZ,{ref:n,initialValue:i.current}):u.default.createElement(l0,{ref:n,initialValue:i.current}))}},l3=u.default.memo(({path:e})=>{let[t,{set:r,setSettings:n,disable:i,storeId:o,emitOnEditStart:a,emitOnEditEnd:l}]=function(e){let t=n4(),[r,n]=(0,u.useState)(iK(t.getData(),e)),i=(0,u.useCallback)(r=>t.setValueAtPath(e,r,!0),[e,t]),o=(0,u.useCallback)(r=>t.setSettingsAtPath(e,r),[e,t]),a=(0,u.useCallback)(r=>t.disableInputAtPath(e,r),[e,t]),l=(0,u.useCallback)(()=>t.emitOnEditStart(e),[e,t]),s=(0,u.useCallback)(()=>t.emitOnEditEnd(e),[e,t]);return(0,u.useEffect)(()=>{n(iK(t.getData(),e));let r=t.useStore.subscribe(t=>iK(t.data,e),n,{equalityFn:w});return()=>r()},[t,e]),[r,{set:i,setSettings:o,disable:a,storeId:t.storeId,emitOnEditStart:l,emitOnEditEnd:s}]}(e);if(!t)return null;let{type:s,label:c,key:f}=t,d=nd(t,l2);if(s in n_){let t=l9[s];return u.default.createElement(t,n1({label:c,path:e},d))}return s in nC?u.default.createElement(lV,n1({key:o+e,type:s,label:c,storeId:o,path:e,valueKey:f,setValue:r,setSettings:n,disable:i,emitOnEditStart:a,emitOnEditEnd:l},d)):(nv(nh.UNSUPPORTED_INPUT,s,e),null)});function l8({toggle:e,toggled:t,name:r}){return u.default.createElement(iy,{onClick:()=>e()},u.default.createElement(iL,{toggled:t}),u.default.createElement("div",null,r))}let l5=({name:e,path:t,tree:r})=>{let n=n4(),i=ln(t,e),{collapsed:o,color:a}=n.getFolderSettings(i),[l,s]=(0,u.useState)(!o),c=(0,u.useRef)(null),f=il("colors","folderWidgetColor"),d=il("colors","folderTextColor");return(0,u.useLayoutEffect)(()=>{c.current.style.setProperty("--leva-colors-folderWidgetColor",a||f),c.current.style.setProperty("--leva-colors-folderTextColor",a||d)},[a,f,d]),u.default.createElement(iv,{ref:c},u.default.createElement(l8,{name:e,toggled:l,toggle:()=>s(e=>!e)}),u.default.createElement(l4,{parent:i,tree:r,toggled:l}))},l4=u.default.memo(({isRoot:e=!1,fill:t=!1,flat:r=!1,parent:n,tree:i,toggled:o})=>{let a,l,s,{wrapperRef:c,contentRef:f}=(a=(0,u.useRef)(null),l=(0,u.useRef)(null),s=(0,u.useRef)(!0),(0,u.useLayoutEffect)(()=>{o||(a.current.style.height="0px",a.current.style.overflow="hidden")},[]),(0,u.useEffect)(()=>{let e;if(s.current){s.current=!1;return}let t=a.current,r=()=>{o&&(t.style.removeProperty("height"),t.style.removeProperty("overflow"),l.current.scrollIntoView({behavior:"smooth",block:"nearest"}))};t.addEventListener("transitionend",r,{once:!0});let{height:n}=l.current.getBoundingClientRect();return t.style.height=n+"px",o||(t.style.overflow="hidden",e=window.setTimeout(()=>t.style.height="0px",50)),()=>{t.removeEventListener("transitionend",r),clearTimeout(e)}},[o]),{wrapperRef:a,contentRef:l}),d=n4(),h=([e,t])=>{var r;return("__levaInput"in t?null==(r=d.getInput(t.path))?void 0:r.order:d.getFolderSettings(ln(n,e)).order)||0},p=Object.entries(i).sort((e,t)=>h(e)-h(t));return u.default.createElement(iA,{ref:c,isRoot:e,fill:t,flat:r},u.default.createElement(ib,{ref:f,isRoot:e,toggled:o},p.map(([e,t])=>"__levaInput"in t?u.default.createElement(l3,{key:t.path,valueKey:t.valueKey,path:t.path}):u.default.createElement(l5,{key:e,name:e,path:n,tree:t}))))}),l6=ir("div",{position:"relative",fontFamily:"$mono",fontSize:"$root",color:"$rootText",backgroundColor:"$elevation1",variants:{fill:{false:{position:"fixed",top:"10px",right:"10px",zIndex:1e3,width:"$rootWidth"},true:{position:"relative",width:"100%"}},flat:{false:{borderRadius:"$lg",boxShadow:"$level1"}},oneLineLabels:{true:{[`${iC}`]:{gridTemplateColumns:"auto",gridAutoColumns:"minmax(max-content, 1fr)",gridAutoRows:"minmax($sizes$rowHeight), auto)",rowGap:0,columnGap:0,marginTop:"$rowGap"}}},hideTitleBar:{true:{$$titleBarHeight:"0px"},false:{$$titleBarHeight:"$sizes$titleBarHeight"}}},"&,*,*:after,*:before":{boxSizing:"border-box"},"*::selection":{backgroundColor:"$accent2"}}),l7=ir("i",{$flexCenter:"",width:40,userSelect:"none",cursor:"pointer","> svg":{fill:"$highlight1",transition:"transform 350ms ease, fill 250ms ease"},"&:hover > svg":{fill:"$highlight3"},variants:{active:{true:{"> svg":{fill:"$highlight2"}}}}}),se=ir("div",{display:"flex",alignItems:"stretch",justifyContent:"space-between",height:"$titleBarHeight",variants:{mode:{drag:{cursor:"grab"}}}}),st=ir("div",{$flex:"",position:"relative",width:"100%",overflow:"hidden",transition:"height 250ms ease",color:"$highlight3",paddingLeft:"$md",[`> ${l7}`]:{height:30},variants:{toggled:{true:{height:30},false:{height:0}}}}),sr=ir("input",{$reset:"",flex:1,position:"relative",height:30,width:"100%",backgroundColor:"transparent",fontSize:"10px",borderRadius:"$root","&:focus":{},"&::placeholder":{color:"$highlight2"}}),sn=ir("div",{touchAction:"none",$flexCenter:"",flex:1,"> svg":{fill:"$highlight1"},color:"$highlight1",variants:{drag:{true:{$draggable:"","> svg":{transition:"fill 250ms ease"},"&:hover":{color:"$highlight3"},"&:hover > svg":{fill:"$highlight3"}}},filterEnabled:{false:{paddingRight:40}}}}),si=u.default.forwardRef(({setFilter:e,toggle:t},r)=>{let[n,i]=(0,u.useState)(""),o=(0,u.useMemo)(()=>nV(e,250),[e]);return(0,u.useEffect)(()=>{o(n)},[n,o]),u.default.createElement(u.default.Fragment,null,u.default.createElement(sr,{ref:r,value:n,placeholder:"[Open filter with CMD+SHIFT+L]",onPointerDown:e=>e.stopPropagation(),onChange:e=>{let r=e.currentTarget.value;t(!0),i(r)}}),u.default.createElement(l7,{onClick:()=>void(e(""),i("")),style:{visibility:n?"visible":"hidden"}},u.default.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",height:"14",width:"14",viewBox:"0 0 20 20",fill:"currentColor"},u.default.createElement("path",{fillRule:"evenodd",d:"M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z",clipRule:"evenodd"}))))});function so({setFilter:e,onDrag:t,onDragStart:r,onDragEnd:n,toggle:i,toggled:o,title:a,drag:l,filterEnabled:s,from:c}){let[f,d]=(0,u.useState)(!1),h=(0,u.useRef)(null);(0,u.useEffect)(()=>{var e,t;f?null==(e=h.current)||e.focus():null==(t=h.current)||t.blur()},[f]);let p=iU(({offset:[e,i],first:o,last:a})=>{t({x:e,y:i}),o&&r({x:e,y:i}),a&&n({x:e,y:i})},{filterTaps:!0,from:({offset:[e,t]})=>[(null==c?void 0:c.x)||e,(null==c?void 0:c.y)||t]});return(0,u.useEffect)(()=>{let e=e=>{"L"===e.key&&e.shiftKey&&e.metaKey&&d(e=>!e)};return window.addEventListener("keydown",e),()=>window.removeEventListener("keydown",e)},[]),u.default.createElement(u.default.Fragment,null,u.default.createElement(se,{mode:l?"drag":void 0},u.default.createElement(l7,{active:!o,onClick:()=>i()},u.default.createElement(iL,{toggled:o,width:12,height:8})),u.default.createElement(sn,n1({},l?p():{},{drag:l,filterEnabled:s}),void 0===a&&l?u.default.createElement("svg",{width:"20",height:"10",viewBox:"0 0 28 14",xmlns:"http://www.w3.org/2000/svg"},u.default.createElement("circle",{cx:"2",cy:"2",r:"2"}),u.default.createElement("circle",{cx:"14",cy:"2",r:"2"}),u.default.createElement("circle",{cx:"26",cy:"2",r:"2"}),u.default.createElement("circle",{cx:"2",cy:"12",r:"2"}),u.default.createElement("circle",{cx:"14",cy:"12",r:"2"}),u.default.createElement("circle",{cx:"26",cy:"12",r:"2"})):a),s&&u.default.createElement(l7,{active:f,onClick:()=>d(e=>!e)},u.default.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",height:"20",viewBox:"0 0 20 20"},u.default.createElement("path",{d:"M9 9a2 2 0 114 0 2 2 0 01-4 0z"}),u.default.createElement("path",{fillRule:"evenodd",d:"M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z",clipRule:"evenodd"})))),u.default.createElement(st,{toggled:f},u.default.createElement(si,{ref:h,setFilter:e,toggle:i})))}let sa=["store","hidden","theme","collapsed"];function sl(e){let{store:t,hidden:r=!1,theme:n,collapsed:i=!1}=e,o=nd(e,sa),a=li(()=>(function(e){let t=n6();if(!e)return{theme:t,className:""};Object.keys(e).forEach(r=>{Object.assign(t[r],e[r])});let r=ii(t);return{theme:t,className:r.className}})(n),[n]),[l,s]=(0,u.useState)(!i),c="object"==typeof i?!i.collapsed:l,f=(0,u.useMemo)(()=>"object"==typeof i?e=>{"function"==typeof e?i.onChange(!e(!i.collapsed)):i.onChange(!e)}:s,[i]);return!t||r?null:u.default.createElement(n3.Provider,{value:a},u.default.createElement(ss,n1({store:t},o,{toggled:c,setToggle:f,rootClass:a.className})))}let ss=u.default.memo(({store:e,rootClass:t,fill:r=!1,flat:n=!1,neverHide:i=!1,oneLineLabels:o=!1,titleBar:a={title:void 0,drag:!0,filter:!0,position:void 0,onDrag:void 0,onDragStart:void 0,onDragEnd:void 0},hideCopyButton:l=!1,toggled:s,setToggle:c})=>{var f,d;let h=(e=>{let[t,r]=(0,u.useState)(e.getVisiblePaths());return(0,u.useEffect)(()=>{r(e.getVisiblePaths());let t=e.useStore.subscribe(e.getVisiblePaths,r,{equalityFn:w});return()=>t()},[e]),t})(e),[p,m]=(0,u.useState)(""),g=(0,u.useMemo)(()=>{let e,t;return e={},t=p?p.toLowerCase():null,h.forEach(r=>{let n,[i,o]=[(n=r.split(".")).pop(),n.join(".")||void 0];(!t||i.toLowerCase().indexOf(t)>-1)&&(0,lr.default)(e,o,{[i]:{__levaInput:!0,path:r}})}),e},[h,p]),[v,A]=iN(),y=i||h.length>0,b="object"==typeof a&&a.title||void 0,x="object"!=typeof a||null==(f=a.drag)||f,C="object"!=typeof a||null==(d=a.filter)||d,B="object"==typeof a&&a.position||void 0,E="object"==typeof a&&a.onDrag||void 0,M="object"==typeof a&&a.onDragStart||void 0,R="object"==typeof a&&a.onDragEnd||void 0;return u.default.useEffect(()=>{A({x:null==B?void 0:B.x,y:null==B?void 0:B.y})},[B,A]),ia(),u.default.createElement(r3,null,u.default.createElement(n5.Provider,{value:{hideCopyButton:l}},u.default.createElement(l6,{ref:v,className:t,fill:r,flat:n,oneLineLabels:o,hideTitleBar:!a,style:{display:y?"block":"none"}},a&&u.default.createElement(so,{onDrag:e=>{A(e),null==E||E(e)},onDragStart:e=>null==M?void 0:M(e),onDragEnd:e=>null==R?void 0:R(e),setFilter:m,toggle:e=>c(t=>null!=e?e:!t),toggled:s,title:b,drag:x,filterEnabled:C,from:B}),y&&u.default.createElement(n8.Provider,{value:e},u.default.createElement(l4,{isRoot:!0,fill:r,flat:n,tree:g,toggled:s})))))}),su=["isRoot"],sc=!1,sf=null;function sd(e){let{isRoot:t=!1}=e,r=nd(e,su);return(0,u.useEffect)(()=>(sc=!0,!t&&sf&&(sf.remove(),sf=null),()=>{t||(sc=!1)}),[t]),u.default.createElement(sl,n1({store:lJ},r))}function sh(e,t,r,n,i){var o;let a,l,s,c,f,{folderName:d,schema:h,folderSettings:p,hookSettings:m,deps:g}=("string"==typeof e?(f=e,a=t,Array.isArray(r)?c=r:r&&("store"in r?(s=r,c=n):(l=r,Array.isArray(n)?c=n:(s=n,c=i)))):(a=e,Array.isArray(t)?c=t:(s=t,c=r)),{schema:a,folderName:f,folderSettings:l,hookSettings:s,deps:c||[]}),v="function"==typeof h,A=(0,u.useRef)(!1),y=(0,u.useRef)(!0),b=li(()=>{A.current=!0;let e="function"==typeof h?h():h;return d?{[d]:l$(e,p)}:e},g);o=!(null!=m&&m.store),(0,u.useEffect)(()=>{o&&!sc&&(!sf&&(sf=document.getElementById("leva__root")||Object.assign(document.createElement("div"),{id:"leva__root"}),document.body&&(document.body.appendChild(sf),(0,lt.createRoot)(sf).render(u.default.createElement(sd,{isRoot:!0})))),sc=!0)},[o]);let[x]=(0,u.useState)(()=>(null==m?void 0:m.store)||lJ),[C,B]=(0,u.useMemo)(()=>x.getDataFromSchema(b),[x,b]),[E,M,R,S,T]=(0,u.useMemo)(()=>{let e=[],t=[],r={},n={},i={};return Object.values(B).forEach(({path:o,onChange:a,onEditStart:l,onEditEnd:s,transient:u})=>{e.push(o),a?(r[o]=a,u||t.push(o)):t.push(o),l&&(n[o]=l),s&&(i[o]=s)}),[e,t,r,n,i]},[B]),D=(0,u.useMemo)(()=>x.orderPaths(E),[E,x]),F=x.useStore(e=>{var t;return t=nS(nS({},C),e.data),Object.entries(M.reduce((e,r)=>(t&&t.hasOwnProperty(r)&&(e[r]=t[r]),e),{})).reduce((e,[,{value:t,disabled:r,key:n}])=>(e[n]=r?void 0:t,e),{})},w),P=(0,u.useCallback)(e=>{let t=Object.entries(e).reduce((e,[t,r])=>Object.assign(e,{[B[t].path]:r}),{});x.set(t,!1)},[x,B]),I=(0,u.useCallback)(e=>x.get(B[e].path),[x,B]);return((0,u.useEffect)(()=>{let e=!y.current&&A.current;return x.addData(C,e),y.current=!1,A.current=!1,()=>x.disposePaths(D)},[x,D,C]),(0,u.useEffect)(()=>{let e=[];return Object.entries(R).forEach(([t,r])=>{r(x.get(t),t,nS({initial:!0,get:x.get},x.getInput(t)));let n=x.useStore.subscribe(e=>{let r=e.data[t];return[r.disabled?void 0:r.value,r]},([e,n])=>r(e,t,nS({initial:!1,get:x.get},n)),{equalityFn:w});e.push(n)}),()=>e.forEach(e=>e())},[x,R]),(0,u.useEffect)(()=>{let e=[];return Object.entries(S).forEach(([t,r])=>e.push(x.subscribeToEditStart(t,r))),Object.entries(T).forEach(([t,r])=>e.push(x.subscribeToEditEnd(t,r))),()=>e.forEach(e=>e())},[S,T,x]),v)?[F,P,I]:F}nE(nj.SELECT,i5),nE(nj.IMAGE,lF),nE(nj.NUMBER,i0),nE(nj.COLOR,lm),nE(nj.STRING,ot),nE(nj.BOOLEAN,oo),nE(nj.INTERVAL,lj),nE(nj.VECTOR3D,lg),nE(nj.VECTOR2D,lB);var sp=e.i(14194),sm=e.i(28192);function sg(){return(sg=Object.assign.bind()).apply(null,arguments)}var sv=e.i(3543),sA=e.i(72137),sy=e.i(21348);function sb(e,t,r){let n=(0,sv.useThree)(e=>e.size),i=(0,sv.useThree)(e=>e.viewport),o="number"==typeof e?e:n.width*i.dpr,a="number"==typeof t?t:n.height*i.dpr,l=("number"==typeof e?r:e)||{},{samples:s=0,depth:c,...f}=l,d=null!=c?c:l.depthBuffer,h=u.useMemo(()=>{let e=new sy.WebGLRenderTarget(o,a,{minFilter:sy.LinearFilter,magFilter:sy.LinearFilter,type:sy.HalfFloatType,...f});return d&&(e.depthTexture=new sy.DepthTexture(o,a,sy.FloatType)),e.samples=s,e},[]);return u.useLayoutEffect(()=>{h.setSize(o,a),s&&(h.samples=s)},[s,h,o,a]),u.useEffect(()=>()=>h.dispose(),[]),h}let sx=u.forwardRef(({envMap:e,resolution:t=256,frames:r=1/0,makeDefault:n,children:i,...o},a)=>{let l=(0,sv.useThree)(({set:e})=>e),s=(0,sv.useThree)(({camera:e})=>e),c=(0,sv.useThree)(({size:e})=>e),f=u.useRef(null);u.useImperativeHandle(a,()=>f.current,[]);let d=u.useRef(null),h=sb(t);u.useLayoutEffect(()=>{o.manual||(f.current.aspect=c.width/c.height)},[c,o]),u.useLayoutEffect(()=>{f.current.updateProjectionMatrix()});let p=0,m=null,g="function"==typeof i;return(0,sA.useFrame)(t=>{g&&(r===1/0||p<r)&&(d.current.visible=!1,t.gl.setRenderTarget(h),m=t.scene.background,e&&(t.scene.background=e),t.gl.render(t.scene,f.current),t.scene.background=m,t.gl.setRenderTarget(null),d.current.visible=!0,p++)}),u.useLayoutEffect(()=>{if(n)return l(()=>({camera:f.current})),()=>l(()=>({camera:s}))},[f,n,l]),u.createElement(u.Fragment,null,u.createElement("perspectiveCamera",sg({ref:f},o),!g&&i),u.createElement("group",{ref:d},g&&i(h.texture)))});var sC=e.i(6121),sB=e.i(16265),sE=e.i(29090),sw=e.i(62291),sM=e.i(90975);let sR={solidEffect:{opaqueThreshold:.9,opaqueTolerance:0,hysteresis:.9-.82},refractiveEffect:{opaqueThreshold:.99,opaqueTolerance:.005,hysteresis:.02}};function sS(e){return Math.min(1,Math.max(0,e))}function sT(e){return void 0===e?0:sS(e>1?e/100:e)}function sD(e,t,r){let n,i=sS(r?.opaqueThreshold??.99),o=sS(r?.opaqueTolerance??.005),a=sS(r?.hysteresis??.02),l=sS(i-o),s=sS(l-a);return n=sT(t),!e&&n>=l||(!e||!(n<=s))&&e}function sF(e,t){if(t)return 3;let r=sT(e);return r>.75?4:r>.5?2:1}function sP(e,t,r){return Math.min(r,Math.max(t,e))}let sI=0,sk="#ffead6",sO="#6196ff",sG="#acffb9",sL="#2c4bd5",sH="#00000d",s_="#00344C",sj={light:{outputMix:.65,edgeIntensity:-.16},dark:{outputMix:.95,edgeIntensity:-.82}},sU=e=>{let t=new sy.Color(e);return new sy.Vector3(t.r,t.g,t.b)},sN=new sy.Vector2(.5,-.1),sJ=e=>sy.MathUtils.clamp(e,0,1),sK=(e,t)=>{e.uniforms.tInput&&(e.uniforms.tInput.value=t)},s$=({material:e})=>(0,s.jsxs)("mesh",{frustumCulled:!1,renderOrder:-10,children:[(0,s.jsx)("planeGeometry",{args:[2,2]}),(0,s.jsx)("primitive",{object:e,attach:"material"})]}),sz=({ks:e})=>{let t=(0,sv.useThree)(e=>e.gl),r=(0,sv.useThree)(e=>e.size),{resolvedTheme:n}=(0,sM.useThemeMode)(),i=(0,sw.useIsMobileWidth)(),o=(0,u.useMemo)(()=>new sy.Vector2(1,1),[]),a=(0,u.useMemo)(()=>new sy.Vector2(.5,.5),[]),l=(0,u.useMemo)(()=>({value:0}),[]),{texture:c,resolution:f}=((e=128)=>{let t=(0,u.useMemo)(()=>(e=>{let t=new Uint8ClampedArray(e*e*4);for(let e=0;e<t.length;e+=4){let r=Math.floor(255*Math.random());t[e]=r,t[e+1]=r,t[e+2]=r,t[e+3]=255}if("u"<typeof document){let r=new sy.DataTexture(t,e,e,sy.RGBAFormat);return r.needsUpdate=!0,r.wrapS=sy.RepeatWrapping,r.wrapT=sy.RepeatWrapping,r}let r=document.createElement("canvas");r.width=e,r.height=e;let n=r.getContext("2d"),i=n.createImageData(e,e);i.data.set(t),n.putImageData(i,0,0);let o=new sy.CanvasTexture(r);return o.wrapS=sy.RepeatWrapping,o.wrapT=sy.RepeatWrapping,o})(e),[e]),r=(0,u.useMemo)(()=>new sy.Vector2(e,e),[e]);return(0,u.useEffect)(()=>()=>t.dispose(),[t]),{texture:t,resolution:r}})(128),d=(e=>{let{lightBg:t,lightVignette:r,lightOutput:n,darkBg:i,darkVignette:o,darkOutput:a}=sh({bokehColors:l$({lightBg:{value:sk,label:"Light BG"},lightVignette:{value:sO,label:"Light Vignette"},lightOutput:{value:sG,label:"Light Output"},darkBg:{value:sL,label:"Dark BG"},darkVignette:{value:sH,label:"Dark Vignette"},darkOutput:{value:s_,label:"Dark Output"}},{collapsed:!0})});return(0,u.useMemo)(()=>{let l="light"===e?{bg:t,vignette:r,output:n}:{bg:i,vignette:o,output:a};return{hex:l,vec:{bg:sU(l.bg),vignette:sU(l.vignette),output:sU(l.output)},mix:sj[e]}},[e,t,r,n,i,o,a])})(n),h=(0,u.useMemo)(()=>d.vec,[n]),p=(0,u.useMemo)(()=>d.mix,[n]),m=(0,u.useMemo)(()=>{let t,r,n,i,s,u,d,m,g;return r=(t=(e,t={})=>new sy.ShaderMaterial({vertexShader:"precision mediump float;
precision mediump int;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}",fragmentShader:e,uniforms:{tInput:{value:null},uResolution:{value:o},uTime:l,uPos:{value:a},uMousePos:{value:new sy.Vector2(.5,.5)},uTrackMouse:{value:1},...t},transparent:!1,blending:sy.NoBlending,depthTest:!1,depthWrite:!1,toneMapped:!1}))("precision mediump float;
precision mediump int;
varying vec2 vUv;
uniform float uRadius;
uniform float uFalloff;
uniform float uMix;
uniform float uDisplace;
uniform float uSkew;
uniform float uAngle;
uniform vec3 uVignetteColor;
uniform vec2 uPos; // 动态中心（跟随指针，如原始实现）
uniform vec2 uResolution;
uniform vec3 uClearColor;
// 边缘明暗强度：[-1,1]，负值加深暗角，正值提亮边缘
uniform float uEdgeIntensity;

mat2 rot(float a) {
  return mat2(cos(a),-sin(a),sin(a),cos(a));
}
void main() {
  vec2 uv = vUv;
  vec4 color = vec4(vec3(1.), 0.);
  float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  float displacement = (luma - 0.5) * uDisplace * 0.5;
  vec2 aspectRatio = vec2(uResolution.x/uResolution.y, 1.0);
  vec2 skew = vec2(uSkew, 1.0 - uSkew);
  float halfRadius = uRadius * 0.5;
  float innerEdge = halfRadius - uFalloff * halfRadius * 0.5;
  float outerEdge = halfRadius + uFalloff * halfRadius * 0.5;
  // 使用动态指针位置作为暗角中心（原始方案）
  vec2 pos = uPos;
  vec2 scaledUV = uv * aspectRatio * rot(uAngle * 6.28318530718) * skew;
  vec2 scaledPos = pos * aspectRatio * rot(uAngle * 6.28318530718) * skew;
  float radius = distance(scaledUV, scaledPos);
  float falloff = smoothstep(innerEdge + displacement, outerEdge + displacement, radius);
  // 原始实现不额外乘 uMix（保留 uniform 以兼容但不使用）

  // 根据 uEdgeIntensity 调整边缘亮暗：
  // uEdgeIntensity > 0 推向 0（提亮边缘），< 0 推向 1（加深暗角）
  float brighten = max(uEdgeIntensity, 0.0);
  float darken = max(-uEdgeIntensity, 0.0);
  falloff = mix(falloff, 0.0, brighten);
  falloff = mix(falloff, 1.0, darken);

  vec3 mixed = mix(uClearColor, uVignetteColor, falloff);
  gl_FragColor = vec4(mixed, falloff);
}
",{uRadius:{value:e.vignette.radius},uFalloff:{value:e.vignette.falloff},uMix:{value:e.vignette.mix},uDisplace:{value:e.vignette.displace},uSkew:{value:e.vignette.skew},uAngle:{value:e.vignette.angle},uEdgeIntensity:{value:p.edgeIntensity},uVignetteColor:{value:h.vignette.clone()},uColorAlpha:{value:1},uClearColor:{value:h.bg.clone()},uTrackMouse:{value:1}}),n=t("precision mediump float;
precision mediump int;
varying vec2 vUv;
uniform vec2 uResolution;
uniform sampler2D tInput;
uniform float uRadius;
uniform float uAngle;
uniform float uPhase;
uniform float uTime;
uniform float uMix;
uniform vec2 uPos;

void main() {
  vec2 uv = vUv;
  float angle = uAngle * 10.;
  vec2 originalUV = uv;
  vec2 pos = uPos;
  uv -= pos;
  vec2 R = vec2(uv.x * uResolution.x / uResolution.y, uv.y);
  float distanceToCenter = length(R);
  if (distanceToCenter <= uRadius) {
    float rot = atan(R.y, R.x) + angle * smoothstep(uRadius, 0., distanceToCenter);
    uv = vec2(cos(rot + uTime / 20. + uPhase * 6.28318530718), sin(rot + uTime / 20. + uPhase * 6.28318530718));
    uv = distanceToCenter * uv + pos;
  }
  float t = smoothstep(0., uRadius, distanceToCenter);
  vec2 mixedUV = mix(uv, originalUV, t);
  gl_FragColor = texture2D(tInput, mix(vUv, mixedUV, uMix));
}
",{uRadius:{value:e.swirl.radius},uAngle:{value:e.swirl.angle},uPhase:{value:e.swirl.phase},uMix:{value:e.swirl.mix},uPinch:{value:e.swirl.pinch}}),i=t("precision mediump float;
precision mediump int;
varying vec2 vUv;
uniform sampler2D tInput;
uniform float uMixRadius;
uniform vec2 uPos;
uniform float uFrequency;
uniform float uAmplitude;
uniform float uRotation;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMousePos;
uniform float uTrackMouse;

void main() {
  vec2 uv = vUv;
  vec2 waveCoord = vUv.xy * 2.0 - 1.0;
  float time = uTime * 0.25;
  float frequency = 20.0 * uFrequency;
  float amp = uAmplitude * 0.2;
  float waveX = sin((waveCoord.y + uPos.y) * frequency + (time)) * amp;
  float waveY = sin((waveCoord.x - uPos.x) * frequency + (time)) * amp;
  waveCoord.xy += vec2(mix(waveX, 0., uRotation), mix(0., waveY, uRotation));
  vec2 finalUV = waveCoord * 0.5 + 0.5;
  float aspectRatio = uResolution.x/uResolution.y;
  vec2 mPos = uPos + mix(vec2(0.), (uMousePos-0.5), uTrackMouse);
  float dist = (max(0.,1.-distance(uv * vec2(aspectRatio, 1.), mPos * vec2(aspectRatio, 1.)) * 4. * (1. - uMixRadius)));
  uv = mix(uv, finalUV, dist);
  gl_FragColor = texture2D(tInput, uv);
}
",{uMixRadius:{value:e.sine.mixRadius},uFrequency:{value:e.sine.frequency},uAmplitude:{value:e.sine.amplitude},uRotation:{value:e.sine.rotation}}),s=t("precision mediump float;
precision mediump int;
varying vec2 vUv;
uniform sampler2D tInput;
uniform float uAmount;
uniform float uSpread;
uniform float uAngle;
uniform float uTime;
uniform float uSkew;
uniform float uCellScale;
uniform vec2 uPos;
uniform vec2 uResolution;
uniform float uMixRadius;
uniform int uMixRadiusInvert;
uniform int uEasing;
uniform vec2 uMousePos;
uniform float uTrackMouse;
uniform float uRoundness;

vec2 random2( vec2 p ) {
  return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}
mat2 rot(float a) { return mat2(cos(a),-sin(a),sin(a),cos(a)); }

float ease(int mode, float t){
  if(mode==1){ return 1.0 - (1.0 - t)*(1.0 - t); }
  if(mode==2){ return t < 0.5 ? 4.0*t*t*t : 1.0 - pow(-2.0*t + 2.0, 3.0)/2.0; }
  return t;
}

void main(){
  vec2 uv = vUv;
  float aspectRatio = uResolution.x / uResolution.y;
  vec2 skew = mix(vec2(1.0), vec2(1.0, 0.0), uSkew);
  vec2 st = (uv - uPos) * vec2(aspectRatio, 1.0) * uCellScale * uAmount;
  st = st * rot(uAngle * 2.0 * 3.14159265359) * skew;
  vec2 i_st = floor(st);
  vec2 f_st = fract(st);

  float m_dist = 15.0;
  float m_dist2 = 15.0;
  vec2 m_point = vec2(0.0);
  vec2 diffBest = vec2(0.0);
  for(int j=-1;j<=1;j++){
    for(int i=-1;i<=1;i++){
      vec2 neighbor = vec2(float(i), float(j));
      vec2 point = random2(i_st + neighbor);
      point = 0.5 + 0.5 * sin(5.0 + uTime * 0.2 + 6.2831 * point);
      vec2 diff = neighbor + point - f_st;
      float dist = length(diff);
      if(dist < m_dist){
        m_dist2 = m_dist;
        m_dist = dist;
        m_point = point;
        diffBest = diff;
      } else if (dist < m_dist2) {
        m_dist2 = dist;
      }
    }
  }

  vec2 offset = (m_point * 0.2 * uSpread * 2.0) - (uSpread * 0.2);
  // soften offsets near cell edges to get rounder pieces
  // Use F2-F1 (second nearest minus nearest) to detect corners and soften further
  float cornerSoft = smoothstep(0.0, max(0.0001, uRoundness) * 2.0, m_dist2 - m_dist);
  float edgeSoft = smoothstep(0.0, max(0.0001, uRoundness), m_dist) * cornerSoft;
  offset *= edgeSoft;

  vec2 mPos = uPos + mix(vec2(0.0), (uMousePos - 0.5), uTrackMouse);
  vec2 pos = mix(uPos, mPos, floor(uMixRadius));

  float rawDist = max(0.0, 1.0 - distance(uv * vec2(aspectRatio,1.0), mPos * vec2(aspectRatio,1.0)) * 4.0 * (1.0 - uMixRadius));
  if(uMixRadiusInvert == 1){ rawDist = 1.0 - rawDist; }
  float dist = ease(uEasing, rawDist);

  vec4 color = texture2D(tInput, uv + offset * dist);
  gl_FragColor = color;
}
",{uAmount:{value:e.shatter.amount},uSpread:{value:e.shatter.spread},uAngle:{value:e.shatter.angleDeg/360},uSkew:{value:e.shatter.skew},uCellScale:{value:16},uMixRadius:{value:e.shatter.mixRadius},uMixRadiusInvert:{value:e.shatter.mixRadiusInvert},uEasing:{value:1},uTrackMouse:{value:0},uPos:{value:new sy.Vector2(.5,.5)},uRoundness:{value:.02}}),u=t("precision mediump float;
precision mediump int;
varying vec2 vUv;
uniform sampler2D tInput;
uniform sampler2D tBlueNoise;
uniform float uAmount;
uniform float uTilt;
uniform float uTime;
uniform vec2 uPos;
uniform vec2 uResolution;
uniform vec2 uBlueNoiseResolution;
uniform vec2 uMousePos;
uniform float uTrackMouse;

#define PI 3.14159265
#define PI2 6.28318530718
// 优化：降低采样迭代次数 (原 50.0 -> 24.0) 以大幅提升性能
#define ITERATIONS 32.0
#define GOLDEN_ANGLE 2.39996323

vec2 Sample(in float theta, inout float r) {
  r += 1.0 / r;
  return (r - 1.0) * vec2(cos(theta), sin(theta));
}

float getBlueNoiseOffset(vec2 st) {
  vec2 texSize = uBlueNoiseResolution;
  vec2 uv = fract(st * (uResolution/texSize) * vec2(texSize.x/texSize.y, 1.0));
  vec4 blueNoise = texture2D(tBlueNoise, uv);
  return mod((blueNoise.r - 0.5) * PI2, PI2);
}

vec4 Bokeh(sampler2D tex, vec2 uv, float blurRadius) {
  vec3 accumulatedColor = vec3(0.0);
  vec3 accumulatedWeights = vec3(0.0);
  float accumulatedAlpha = 0.0;
  float aspectRatio = uResolution.x / uResolution.y;
  vec2 basePixelSize = vec2(1.0 / aspectRatio, 1.0) * 0.04 * 0.075;
  float r = 1.0;
  float noiseOffset = (getBlueNoiseOffset(uv) - 0.5) * 0.01;
  float noiseAngle = noiseOffset * PI2;
  mat2 rotationMatrix = mat2(
    cos(noiseAngle), -sin(noiseAngle),
    sin(noiseAngle),  cos(noiseAngle)
  );
  for (float j = 0.0; j < GOLDEN_ANGLE * ITERATIONS; j += GOLDEN_ANGLE) {
    vec2 offset = Sample(j, r) * basePixelSize * blurRadius;
    float jitterAmount = 0.05 * (sin(j * 0.1) * 0.5 + 0.5);
    offset *= 1.0 + jitterAmount * sin(j * 0.7 + noiseOffset);
    vec2 sampleOffset = rotationMatrix * offset;
    vec4 colorSample = texture2D(tex, uv + sampleOffset);
    // Render targets are in Three.js working space (linear) by default.
    vec3 linearSample = colorSample.rgb;
    vec3 bokehWeight = vec3(5.0) + pow(linearSample, vec3(9.0)) * 150.0;
    accumulatedAlpha += colorSample.a;
    accumulatedColor += linearSample * bokehWeight;
    accumulatedWeights += bokehWeight;
  }
  vec3 linearOut = accumulatedColor / accumulatedWeights;
  return vec4(linearOut, accumulatedAlpha / ITERATIONS);
}

void main() {
  vec2 uv = vUv;
  if(uAmount == 0.0) { gl_FragColor = vec4(0.0); return; }
  vec2 pos = uPos + mix(vec2(0.0), (uMousePos - 0.5), uTrackMouse);
  float dis = distance(uv, pos) * 1000.0;
  float tilt = mix(1.0 - dis * 0.001, dis * 0.001, uTilt);
  float blurRadius = uAmount * tilt;
  gl_FragColor = Bokeh(tInput, uv, blurRadius);
}
",{tBlueNoise:{value:c},uBlueNoiseResolution:{value:f.clone()},uAmount:{value:3.125*e.bokeh.radius},uTilt:{value:e.bokeh.tilt},uPos:{value:new sy.Vector2(.5,.5)},uTrackMouse:{value:e.bokeh.trackMouse}}),(d=t("precision mediump float;
precision mediump int;
varying vec2 vUv;
uniform sampler2D tInput;
uniform vec3 uBgColor;
uniform vec3 uOutputColor;
uniform int uLoaded;
// 可调输出混合权重（0.0~1.0），用于替代固定 0.6
uniform float uOutputMix;
// 方案A：更接近 before.js 的合成逻辑 (base * mix(1, blend, 0.26))

vec3 overlay(vec3 base, vec3 blend){
  return mix(2.0 * base * blend, 1.0 - 2.0 * (1.0 - base) * (1.0 - blend), step(0.5, base));
}

void main(){
  if(uLoaded!=1){
    gl_FragColor = vec4(197./255.,136./255.,122./255.,1.);
    return;
  }

  // uBgColor/uOutputColor are provided in Three.js working space (linear).
  vec3 bgTex = vec3(1.0); // 无背景贴图时近似常量
  vec3 base = mix(uBgColor, overlay(uBgColor, bgTex), 0.61);

  vec4 inTex = texture2D(tInput, vUv);
  // 作为 tint 加色，不依赖 alpha，保证 OUTPUT_COLOR 可见
  vec3 tint = uOutputColor * 0.35;
  vec3 blend = clamp(inTex.rgb + tint, 0.0, 1.0);
  vec3 finalColor = base * mix(vec3(1.0), blend, clamp(uOutputMix, 0.0, 1.0));
  
  gl_FragColor = vec4(finalColor, 1.0);
  
  #include <colorspace_fragment>
}",{uBgColor:{value:h.bg.clone()},uOutputColor:{value:h.output.clone()},uLoaded:{value:1},uOutputMix:{value:p.outputMix}})).vertexShader="precision mediump float;
precision mediump int;

varying vec2 vUv;

void main() {
  vUv = uv;
  // Render in clip-space to fill the screen, ignoring camera transforms
  gl_Position = vec4(position, 1.0);
}
",d.depthTest=!1,d.depthWrite=!1,d.toneMapped=!1,d.transparent=!1,d.blending=sy.NoBlending,g=(m=[{name:"vignette",material:r},{name:"swirl",material:n},{name:"sine",material:i},{name:"shatter",material:s},{name:"bokeh",material:u}]).filter(e=>"shatter"!==e.name),{prePasses:m,outputMaterial:d,vignetteMaterial:r,shatterMaterial:s,mouseConsumers:g}},[e,o,a,l,c,f,h,p]),g=(0,u.useRef)({read:new sy.WebGLRenderTarget(1,1,{depthBuffer:!1}),write:new sy.WebGLRenderTarget(1,1,{depthBuffer:!1})});(0,u.useEffect)(()=>{let n=Math.max(1,Math.floor(r.width*e.resolutionScale)),i=Math.max(1,Math.floor(r.height*e.resolutionScale));o.set(n,i),g.current.read.dispose(),g.current.write.dispose(),g.current={read:new sy.WebGLRenderTarget(n,i,{depthBuffer:!1}),write:new sy.WebGLRenderTarget(n,i,{depthBuffer:!1})},t.setRenderTarget(g.current.read),t.setClearColor(d.hex.bg,1),t.clear(),t.setRenderTarget(null),w.current=0,m.outputMaterial.uniforms.tInput.value=g.current.read.texture},[t,e.resolutionScale,o,r.height,r.width,d.hex.bg,m]),(0,u.useEffect)(()=>()=>{g.current.read.dispose(),g.current.write.dispose()},[]);let v=(0,u.useMemo)(()=>new sy.Scene,[]),A=(0,u.useMemo)(()=>new sy.OrthographicCamera(-1,1,1,-1,0,1),[]),y=(0,u.useRef)(null);(0,u.useEffect)(()=>{let e=new sy.PlaneGeometry(2,2),t=new sy.Mesh(e,m.prePasses[0]?.material);return v.add(t),y.current=t,()=>{v.remove(t),e.dispose()}},[m,v]),(0,u.useEffect)(()=>()=>{m.prePasses.forEach(e=>e.material.dispose()),m.outputMaterial.dispose()},[m]),(0,u.useEffect)(()=>{let e=+!i;m.prePasses.forEach(t=>{t.material.uniforms.uTrackMouse&&(t.material.uniforms.uTrackMouse.value=e)}),m.vignetteMaterial.uniforms.uPos&&m.vignetteMaterial.uniforms.uPos.value.copy(sN),m.shatterMaterial.uniforms.uPos&&m.shatterMaterial.uniforms.uPos.value.copy(sN);let t=m.prePasses.find(e=>"bokeh"===e.name);t&&t.material.uniforms.uPos&&t.material.uniforms.uPos.value.copy(sN)},[i,m]);let b=(0,u.useMemo)(()=>new sy.Vector2(.5,.5),[]),x=(0,u.useMemo)(()=>new sy.Vector2(.5,.5),[]),C=(0,u.useMemo)(()=>new sy.Vector2(.5,.5),[]),B=(0,u.useMemo)(()=>new sy.Vector2(.5,.5),[]),E=(0,sB.usePointer)(),w=(0,u.useRef)(0),M=(0,u.useMemo)(()=>h.bg.clone(),[h]),R=(0,u.useMemo)(()=>h.bg.clone(),[h]),S=(0,u.useMemo)(()=>h.vignette.clone(),[h]),T=(0,u.useMemo)(()=>h.vignette.clone(),[h]),D=(0,u.useMemo)(()=>h.output.clone(),[h]),F=(0,u.useMemo)(()=>h.output.clone(),[h]);return(0,u.useEffect)(()=>{R.copy(d.vec.bg),T.copy(d.vec.vignette),F.copy(d.vec.output)},[d,R,T,F]),(0,sA.useFrame)(t=>{let r=g.current,n=y.current;if(!r||!n)return;if(l.value=t.clock.getElapsedTime(),i)a.copy(sN),m.mouseConsumers.forEach(e=>{e.material.uniforms.uMousePos&&e.material.uniforms.uMousePos.value.copy(sN)}),m.shatterMaterial.uniforms.uPos.value.copy(sN);else{B.set(sJ(E.uv.x),sJ(E.uv.y)),E.insideRef.current?x.copy(B):x.copy(C);let t=E.insideRef.current?e.smoothing:e.leaveSmoothing;b.lerp(x,t),a.copy(b),m.mouseConsumers.forEach(e=>{e.material.uniforms.uMousePos&&e.material.uniforms.uMousePos.value.copy(b)}),m.shatterMaterial.uniforms.uPos.value.copy(C)}M.lerp(R,e.smoothing),S.lerp(T,e.smoothing),D.lerp(F,e.smoothing),m.vignetteMaterial.uniforms.uVignetteColor.value.copy(S),m.vignetteMaterial.uniforms.uClearColor.value.copy(M),m.outputMaterial.uniforms.uBgColor.value.copy(M),m.outputMaterial.uniforms.uOutputColor.value.copy(D);let o=t.gl,s=sT(sI);if(!(s>=.98)){if(w.current++%Math.max(sF(s,!1),2)==0){for(let e of m.prePasses){sK(e.material,r.read.texture),n.material=e.material,o.setRenderTarget(r.write),o.render(v,A),o.setRenderTarget(null);let t=r.read;r.read=r.write,r.write=t}sK(m.outputMaterial,r.read.texture)}}},-2),(0,s.jsx)(s$,{material:m.outputMaterial})};function sV(){let e=(0,u.useMemo)(()=>({resolutionScale:.3,vignette:{radius:.354,falloff:1,mix:1,displace:0,skew:.54,angle:0,edgeIntensity:0},swirl:{radius:.25,angle:.1,phase:0,mix:.5,pinch:0},sine:{mixRadius:1,frequency:.35,amplitude:1.18,rotation:0},shatter:{amount:1,spread:.9,angleDeg:-45,skew:.9,mixRadius:1,mixRadiusInvert:0},bokeh:{radius:.754,tilt:.5,trackMouse:0},smoothing:.1,leaveSmoothing:.05}),[]);return(0,s.jsx)(sz,{ks:e})}var sW=e.i(29680);let sY=-1,sQ=new Map,sX=e=>{let t=e.name;if(t&&sY>=0){let e=sQ.get(t);if(e)return e}let r=e.ref?.current;if(!r){let r={topDocY:e.y,height:e.height};return t&&sY>=0&&sQ.set(t,r),r}let n=r.getBoundingClientRect(),i=sW.scrollEnv.getContainerEl(),o=i?{topDocY:n.top-i.getBoundingClientRect().top+sW.scrollEnv.getScrollTopPx(),height:n.height}:{topDocY:n.top+sW.scrollEnv.getScrollTopPx(),height:n.height};return t&&sY>=0&&sQ.set(t,o),o},sZ=(e,t)=>e?e.find(e=>e.name===t)??null:null,sq=(e,t,r)=>{let{topDocY:n,height:i}=sX(e),o=n-t;return o+i>0&&o<r},s0={getScrollTopPx:sW.scrollEnv.getScrollTopPx,getScrollLeftPx:sW.scrollEnv.getScrollLeftPx,getViewportHeightPx:sW.scrollEnv.getViewportHeightPx,findSection:sZ,beginSectionLayoutFrame:e=>{e!==sY&&(sQ.clear(),sY=e)},getSectionContentCenterDocY:e=>{let{topDocY:t,height:r}=sX(e);return t+.5*r},readSectionContentLayout:sX,sectionCenterInViewportPx:(e,t,r=0)=>{let{topDocY:n,height:i}=sX(e);return n-t+i/2+r},isSectionInViewport:sq,anySectionInViewport:(e,t)=>{if(!e||!t||0===t.length)return!0;let r=sW.scrollEnv.getViewportHeightPx(),n=sW.scrollEnv.getScrollTopPx();for(let i of t){let t=sZ(e,i);if(t&&sq(t,n,r))return!0}return!1},viewportPxToWorldY:(e,t,r)=>(.5-e/Math.max(1,t||1))*r,scrollSyncedWorldYFromAnchorDocY:e=>{let{anchorDocY:t,scrollTopPx:r,viewportHeightPx:n,viewportWorldHeight:i,anchorOffsetPx:o=0,scrollSyncFactor:a=1}=e,l=Math.max(1,n||1);return(.5-(t+o)/l)*i+r/l*i*a},showAtDocumentYFromSection:e=>e.y-e.height},s1=({overlayColors:e=["#0F1111","#FBFAF4"],overlayPixelSize:t=8,overlayRadiusScale:r=.9})=>{let{resolvedTheme:n}=(0,sM.useThemeMode)(),{size:i}=(0,sv.useThree)(),o=(0,u.useRef)(null),[a,l]=e,c=(0,u.useMemo)(()=>({uColor:{value:new sy.Color},uOpacity:{value:1},uPixelSize:{value:t},uRadiusScale:{value:r},uResolution:{value:new sy.Vector2(1,1)}}),[t,r]);return(0,u.useLayoutEffect)(()=>{o.current?.uniforms.uColor.value.set("dark"===n?a:l)},[n,a,l]),(0,u.useLayoutEffect)(()=>{o.current?.uniforms.uResolution.value.set(Math.max(1,i.width),Math.max(1,i.height))},[i.width,i.height]),(0,u.useLayoutEffect)(()=>{o.current&&(o.current.uniforms.uPixelSize.value=t)},[t]),(0,u.useLayoutEffect)(()=>{o.current&&(o.current.uniforms.uRadiusScale.value=r)},[r]),(0,sA.useFrame)(()=>{let e=sT(sI);o.current&&(o.current.uniforms.uOpacity.value=e)}),(0,s.jsxs)("mesh",{renderOrder:10,frustumCulled:!1,children:[(0,s.jsx)("planeGeometry",{args:[2,2]}),(0,s.jsx)("shaderMaterial",{ref:o,transparent:!0,depthTest:!1,depthWrite:!1,toneMapped:!1,uniforms:c,vertexShader:`
          varying vec2 vUv;

          void main() {
            vUv = uv;
            gl_Position = vec4(position.xy, 0.0, 1.0);
          }
        `,fragmentShader:`
          precision highp float;

          varying vec2 vUv;

          uniform vec3 uColor;
          uniform float uOpacity;
          uniform float uPixelSize;
          uniform float uRadiusScale;
          uniform vec2 uResolution;

          void main() {
            float a = clamp(uOpacity, 0.0, 1.0);

            vec2 normalizedPixelSize = vec2(
              uPixelSize / max(uResolution.x, 1.0),
              uPixelSize / max(uResolution.y, 1.0)
            );

            vec2 safePixelSize = max(normalizedPixelSize, vec2(1e-6));
            vec2 cellUV = fract(vUv / safePixelSize);

            // 与 route_transition 点阵一致：透明度直接映射圆半径。
            float radius = uRadiusScale * a;
            float distanceFromCenter = distance(cellUV, vec2(0.5));
            float aa = fwidth(distanceFromCenter) * 1.5;
            float circleMask = smoothstep(radius, radius - aa, distanceFromCenter);

            gl_FragColor = vec4(uColor, circleMask);
            #include <colorspace_fragment>
          }
        `})]})};var s2=e.i(85765);let s9=e=>e===Object(e)&&!Array.isArray(e)&&"function"!=typeof e;function s3(e,t){let r=(0,sv.useThree)(e=>e.gl),n=(0,s2.useLoader)(sy.TextureLoader,s9(e)?Object.values(e):e);return(0,u.useLayoutEffect)(()=>{null==t||t(n)},[t]),(0,u.useEffect)(()=>{if("initTexture"in r){let e=[];Array.isArray(n)?e=n:n instanceof sy.Texture?e=[n]:s9(n)&&(e=Object.values(n)),e.forEach(e=>{e instanceof sy.Texture&&r.initTexture(e)})}},[r,n]),(0,u.useMemo)(()=>{if(!s9(e))return n;{let t={},r=0;for(let i in e)t[i]=n[r++];return t}},[e,n])}s3.preload=e=>s2.useLoader.preload(sy.TextureLoader,e),s3.clear=e=>s2.useLoader.clear(sy.TextureLoader,e);let s8=["/sticker_img/s_01.png","/sticker_img/s_02.png","/sticker_img/s_03.png","/sticker_img/s_04.png","/sticker_img/s_05.png","/sticker_img/s_06.png","/sticker_img/s_07.png","/sticker_img/s_08.png","/sticker_img/s_09.png","/sticker_img/s_10.png","/sticker_img/s_11.png","/sticker_img/s_12.png"];s3.preload(s8);let s5={particleCount:s8.length,spawnWidth:32,clickSpawnWidth:24,spawnHeight:24,clickSpawnHeight:24,positionY:24,fallDistance:48,zDepth:4,zOffset:-6,windStrength:1.8,windFrequency:.3,scale:1.4,clickScale:1.4,rotationSpeed:.8,fallSpeed:1.8},s4=`
attribute vec4 uvRect;

varying vec2 vAtlasUv;

void main() {
  vAtlasUv = uvRect.xy + uv * uvRect.zw;

  vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
}
`,s6=`
uniform sampler2D map;

varying vec2 vAtlasUv;

void main() {
  vec4 color = texture2D(map, vAtlasUv);
  if (color.a < 0.01) discard;

  gl_FragColor = color;
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`,s7=e=>Math.pow(2,Math.ceil(Math.log2(Math.max(1,e)))),ue=e=>{let t=e.image;if(!t)return null;let r=t.width,n=t.height;return"number"!=typeof r||"number"!=typeof n||r<=0||n<=0?null:t},ut=(e,t,r="scroll")=>{let{spawnWidth:n,clickSpawnWidth:i,positionY:o,spawnHeight:a,clickSpawnHeight:l,scale:s,clickScale:u,rotationSpeed:c,windStrength:f,zDepth:d,zOffset:h,fallSpeed:p}=t,m="click"===r?l:a,g=Math.min(.5*Math.max(m,0),8),v="click"===r?o+(2*Math.random()-1)*g:o+Math.random()*Math.max(m,0);e.position.set(e.originX+(Math.random()-.5)*("click"===r?i:n),e.originY+v,e.originZ+(Math.random()-.5)*d+h),e.startY=e.position.y,e.fallSpeed=p*(.6+.8*Math.random()),e.rotation=Math.random()*Math.PI*2,e.rotationSpeed=(Math.random()-.5)*c*2,e.scale="click"===r?u:s,e.windPhase=Math.random()*Math.PI*2,e.windAmplitude=.3+Math.random()*f,e.dead=!1,e.hasStarted=!0,e.emitAt=0},ur=[],un=(e,t)=>{if(e<=0)return 0;if(t.size>=e)return Math.floor(Math.random()*e);ur.length=0;for(let r=0;r<e;r++)t.has(r)||ur.push(r);return ur[Math.floor(Math.random()*ur.length)]},ui=(e,t)=>{let r=t.position.z,n=0,i=e.length;for(;n<i;){let t=n+i>>>1;e[t].position.z<=r?n=t+1:i=t}e.push(t);for(let t=e.length-1;t>n;t--)e[t]=e[t-1];e[n]=t},uo=(e,t,r=!1)=>{let n=Array.from({length:e},()=>((e,t=!1)=>({position:new sy.Vector3,startY:0,fallSpeed:0,rotation:0,rotationSpeed:0,scale:1,textureIndex:Math.floor(Math.random()*e),windPhase:0,windAmplitude:0,emitAt:0,hasStarted:!0,dead:!1,isOneShot:t,originX:0,originY:0,originZ:0}))(t,r));if(e>0&&e<=t){let r=(e=>{for(let t=e.length-1;t>0;t--){let r=Math.floor(Math.random()*(t+1));[e[t],e[r]]=[e[r],e[t]]}return e})(Array.from({length:t},(e,t)=>t));for(let t=0;t<e;t++)n[t].textureIndex=r[t]}return n},ua=e=>{let t=e.filter(e=>!e.isOneShot||!e.dead),r=t.filter(e=>!e.isOneShot),n=t.filter(e=>e.isOneShot);return n.length<=384?t:(n.sort((e,t)=>t.emitAt-e.emitAt),r.concat(n.slice(0,384)))},ul=({images:e=s8,particlesPerBurst:t,showAtVh:r,sectionPosition:n,sectionName:i="footer"})=>{let o=(0,u.useRef)(null),a=(0,u.useRef)(null),{camera:l,gl:c}=(0,sv.useThree)(),f=(0,u.useRef)(new sy.Raycaster),d=(0,u.useRef)(new sy.Vector2),h=(0,u.useRef)(new sy.Plane(new sy.Vector3(0,0,1),0)),p=(0,u.useRef)([]),m=(0,u.useRef)(!1),g=(0,u.useRef)(0),v=(0,u.useRef)(0),A=(0,u.useRef)(new Set),y=(0,u.useRef)([]),b=(0,u.useRef)(new sy.Object3D),x=(0,u.useRef)(new sy.Vector3),C=(0,u.useRef)(!1),B=(0,u.useRef)(!1),E=(0,sw.useIsMobileWidth)(),w=(0,u.useMemo)(()=>({...s5,particleCount:Math.max(1,t??e.length)}),[e.length,t]),M=s3(e),R=(0,u.useMemo)(()=>Array.isArray(M)?M:[M],[M]),S=(0,u.useMemo)(()=>R.length>0&&R.every(e=>!!ue(e)),[R]),T=(0,u.useMemo)(()=>S?(e=>{let t=e.map(ue);if(t.some(e=>!e))return null;let r=Math.max(...t.map(e=>e.width)),n=Math.max(...t.map(e=>e.height)),i=Math.ceil(Math.sqrt(t.length)),o=Math.ceil(t.length/i),a=r+4,l=n+4,s=s7(i*a),u=s7(o*l),c=document.createElement("canvas");c.width=s,c.height=u;let f=c.getContext("2d");if(!f)return null;f.clearRect(0,0,s,u);let d=new Float32Array(4*t.length),h=[];t.forEach((e,t)=>{let r=Math.floor(t/i),n=t%i*a+2,o=r*l+2;f.drawImage(e,n,o,e.width,e.height);let c=4*t;d[c]=(n+.5)/s,d[c+1]=1-(o+e.height-.5)/u,d[c+2]=(e.width-1)/s,d[c+3]=(e.height-1)/u,h[t]=e.width/e.height});let p=new sy.CanvasTexture(c);return p.colorSpace=sy.SRGBColorSpace,p.minFilter=sy.LinearFilter,p.magFilter=sy.LinearFilter,p.wrapS=sy.ClampToEdgeWrapping,p.wrapT=sy.ClampToEdgeWrapping,p.generateMipmaps=!1,p.needsUpdate=!0,{texture:p,uvRects:d,aspects:h}})(R):null,[S,R]);(0,u.useEffect)(()=>()=>{T?.texture.dispose()},[T]);let D=(0,u.useMemo)(()=>{let e=new sy.PlaneGeometry(2,2);return e.setAttribute("uvRect",new sy.InstancedBufferAttribute(new Float32Array(8192),4)),e},[]);(0,u.useEffect)(()=>()=>{D.dispose()},[D]);let F=(0,u.useMemo)(()=>T?new sy.ShaderMaterial({uniforms:{map:{value:T.texture}},vertexShader:s4,fragmentShader:s6,transparent:!0,depthWrite:!1,side:sy.FrontSide,toneMapped:!1}):null,[T]);(0,u.useEffect)(()=>()=>{F?.dispose()},[F]),(0,u.useEffect)(()=>{if(!T||m.current)return;m.current=!0,g.current=0,v.current=0;let e=uo(w.particleCount,T.aspects.length,!1);for(let t of e)ut(t,w,"scroll");p.current=e},[T,w]);let P=(0,u.useCallback)(e=>{if(!T)return;let t=uo(w.particleCount,T.aspects.length,!0),r=.05*Math.random();for(let e of t)e.hasStarted=!1,e.dead=!1,e.emitAt=r,r+=.04+.04*Math.random();let n=e.x,i=e.y-w.positionY;for(let e of t)e.originX=n,e.originY=i,e.originZ=0,e.emitAt+=g.current;p.current=ua(p.current.concat(t))},[T,w]);(0,sA.useFrame)((e,t)=>{let n,i=sI;if(C.current=sD(C.current,i,sR.solidEffect),B.current=sD(B.current,i,sR.refractiveEffect),B.current)return;let o=a.current;if(!o||!T||!m.current){o&&(o.count=0,o.visible=!1);return}let l=Math.min(t,.1);g.current+=l;let s=p.current,u=g.current,c=(n=s0.getScrollTopPx(),"number"==typeof I?+(n>=I):!r||r<=0?1:+(n>=s0.getViewportHeightPx()*r)),{fallDistance:f,windFrequency:d}=w,h=A.current;for(let e of(h.clear(),s))e.isOneShot||e.dead||!e.hasStarted||h.add(e.textureIndex);let x=y.current;x.length=0;let E=!1;for(let e of s){if(!(e.isOneShot||1===c))continue;if(!e.hasStarted)if(!(u>=e.emitAt))continue;else ut(e,w,"click"),e.hasStarted=!0;if(e.dead){e.isOneShot&&(E=!0);continue}e.position.y-=e.fallSpeed*l;let t=Math.sin(u*d+e.windPhase)*e.windAmplitude;e.position.x+=t*l,e.rotation+=e.rotationSpeed*l;let r=(e.startY-e.position.y)/f,n=sy.MathUtils.clamp(r,0,1),i=1,o=w.enterDurationRatio??.05;if(o>0&&n<o?i=n/o:n>.9&&(i=(1-n)/.1),i=sy.MathUtils.clamp(i,0,1),e.position.y<e.startY-f){if(e.isOneShot){e.dead=!0,E=!0;continue}let t=e.textureIndex;h.delete(t),e.textureIndex=un(T.aspects.length,h),e.emitAt=Math.max(v.current,u)+(.04+.04*Math.random()),v.current=e.emitAt,e.hasStarted=!1;continue}e.scale=i,x.length<96?ui(x,e):x.push(e)}E&&(p.current=ua(s.filter(e=>!e.isOneShot||!e.dead))),x.length>96&&x.sort((e,t)=>e.position.z-t.position.z);let M=D.getAttribute("uvRect"),R=Math.min(x.length,2048),S=b.current;for(let e=0;e<R;e++){let t=x[e],r=T.aspects[t.textureIndex]??1,n=(t.isOneShot?w.clickScale:w.scale)*t.scale,i=4*t.textureIndex;S.position.copy(t.position),S.rotation.set(0,0,t.rotation),S.scale.set(n*r,n,1),S.updateMatrix(),o.setMatrixAt(e,S.matrix),M.setXYZW(e,T.uvRects[i],T.uvRects[i+1],T.uvRects[i+2],T.uvRects[i+3])}o.count=R,o.visible=R>0,o.instanceMatrix.needsUpdate=!0,M.needsUpdate=!0}),(0,u.useEffect)(()=>{if(E)return;let e=c.domElement;if(!e)return;let t=null,r=e=>{e.isPrimary&&("mouse"!==e.pointerType&&"pen"!==e.pointerType||0===e.button)&&(t={id:e.pointerId,pointerType:e.pointerType,startX:e.clientX,startY:e.clientY,startAt:e.timeStamp||performance.now(),cancelled:!1})},n=e=>{if(!t||e.pointerId!==t.id||t.cancelled)return;let r=e.clientX-t.startX,n=e.clientY-t.startY,i="touch"===t.pointerType?10:4;r*r+n*n>i*i&&(t.cancelled=!0)},i=r=>{let n=t;if(!n||r.pointerId!==n.id||(t=null,n.cancelled||(r.timeStamp||performance.now())-n.startAt>600))return;let i=window.getSelection();i&&!i.isCollapsed&&i.toString().trim().length>0||C.current||((t,r)=>{let n=e.getBoundingClientRect(),i=(t-n.left)/n.width*2-1,a=-((r-n.top)/n.height*2-1),s=f.current,u=d.current;u.set(i,a),s.setFromCamera(u,l);let c=new sy.Vector3;if(!s.ray.intersectPlane(h.current,c))return;let p=x.current;p.copy(c),o.current?.worldToLocal(p),P(p)})(r.clientX,r.clientY)},a=e=>{t&&e.pointerId===t.id&&(t=null)},s={capture:!0,passive:!0};return window.addEventListener("pointerdown",r,s),window.addEventListener("pointermove",n,s),window.addEventListener("pointerup",i,s),window.addEventListener("pointercancel",a,s),()=>{window.removeEventListener("pointerdown",r,!0),window.removeEventListener("pointermove",n,!0),window.removeEventListener("pointerup",i,!0),window.removeEventListener("pointercancel",a,!0)}},[l,c.domElement,E,P]);let I=(0,u.useMemo)(()=>{let e=s0.findSection(n,i);if(!e)return 1/0;let t=s0.getViewportHeightPx();return e.y+e.height/2-t},[n,i]);return(0,s.jsx)("group",{ref:o,children:T&&F?(0,s.jsx)("instancedMesh",{ref:a,args:[D,F,2048],frustumCulled:!1}):null})};var us=sy;function uu(e,t){if(t===sy.TrianglesDrawMode)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),e;if(t!==sy.TriangleFanDrawMode&&t!==sy.TriangleStripDrawMode)return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",t),e;{let r=e.getIndex();if(null===r){let t=[],n=e.getAttribute("position");if(void 0===n)return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),e;for(let e=0;e<n.count;e++)t.push(e);e.setIndex(t),r=e.getIndex()}let n=r.count-2,i=[];if(r)if(t===sy.TriangleFanDrawMode)for(let e=1;e<=n;e++)i.push(r.getX(0)),i.push(r.getX(e)),i.push(r.getX(e+1));else for(let e=0;e<n;e++)e%2==0?(i.push(r.getX(e)),i.push(r.getX(e+1)),i.push(r.getX(e+2))):(i.push(r.getX(e+2)),i.push(r.getX(e+1)),i.push(r.getX(e)));i.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");let o=e.clone();return o.setIndex(i),o.clearGroups(),o}}let uc=parseInt(sy.REVISION.replace(/\D+/g,""));function uf(e){if("u">typeof TextDecoder)return new TextDecoder().decode(e);let t="";for(let r=0,n=e.length;r<n;r++)t+=String.fromCharCode(e[r]);try{return decodeURIComponent(escape(t))}catch(e){return t}}let ud="srgb",uh="srgb-linear";class up extends us.Loader{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(e){return new ub(e)}),this.register(function(e){return new ux(e)}),this.register(function(e){return new uD(e)}),this.register(function(e){return new uF(e)}),this.register(function(e){return new uP(e)}),this.register(function(e){return new uB(e)}),this.register(function(e){return new uE(e)}),this.register(function(e){return new uw(e)}),this.register(function(e){return new uM(e)}),this.register(function(e){return new uy(e)}),this.register(function(e){return new uR(e)}),this.register(function(e){return new uC(e)}),this.register(function(e){return new uT(e)}),this.register(function(e){return new uS(e)}),this.register(function(e){return new uv(e)}),this.register(function(e){return new uI(e)}),this.register(function(e){return new uk(e)})}load(e,t,r,n){let i,o=this;if(""!==this.resourcePath)i=this.resourcePath;else if(""!==this.path){let t=us.LoaderUtils.extractUrlBase(e);i=us.LoaderUtils.resolveURL(t,this.path)}else i=us.LoaderUtils.extractUrlBase(e);this.manager.itemStart(e);let a=function(t){n?n(t):console.error(t),o.manager.itemError(e),o.manager.itemEnd(e)},l=new us.FileLoader(this.manager);l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(this.withCredentials),l.load(e,function(r){try{o.parse(r,i,function(r){t(r),o.manager.itemEnd(e)},a)}catch(e){a(e)}},r,a)}setDRACOLoader(e){return this.dracoLoader=e,this}setDDSLoader(){throw Error(