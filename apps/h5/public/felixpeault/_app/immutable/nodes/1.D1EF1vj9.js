import{A as e,D as t,L as n,P as r,Q as i,at as a,ct as o,dt as s,ft as c,gt as l,ht as u,it as d,lt as f,nt as p,q as m,rt as h,st as g,z as _}from"../chunks/BCWGYF31.js";import{t as v}from"../chunks/B3AEFeHi.js";import{r as y}from"../chunks/qQ3mVfhX.js";import{t as b}from"../chunks/DVJg2gu6.js";import{t as x}from"../chunks/cXWtjmE1.js";var S=`
    image {
        ...,
        "ratio": asset->metadata.dimensions.aspectRatio,
        "color": asset->metadata.palette.lightMuted.background,
    }
`,C=_(`<!> <main class="error-page grid svelte-1j96wlh"><!> <div class="text svelte-1j96wlh"><h1 class="title-large svelte-1j96wlh"> </h1> <p class="text-normal svelte-1j96wlh"> </p></div> <div class="background svelte-1j96wlh"></div></main>`,1);function w(_,w){c(w,!0);let T=o(null);e(async()=>{let e=y.status&&y.status!==200?String(y.status):`404`,t=await b.fetch(`*[_type == "error"][0].errors[] {
            code,
            "title": coalesce(title.en, title),
            "text": coalesce(text.en, text),
            photo {
                ...,
                ${S},
                "alt": coalesce(alt.en, alt),
            }
        }`,{},{stega:!1});g(T,t?.find(t=>t.code===e)??null,!0)});var E=C(),D=h(E);{let e=f(()=>m(T)?.title||`Error`),t=f(()=>m(T)?.text||`An unexpected error occurred.`);v(D,{noIndex:!0,get title(){return m(e)},get description(){return m(t)}})}var O=a(D,2),k=p(O),A=e=>{{let t=f(()=>m(T).photo?.alt||m(T)?.title||`Error image`);x(e,{class:`photo`,get image(){return m(T).photo.image},get alt(){return m(t)},width:400,widthMax:800,sizes:`(max-width: 768px) 75vw, 40vw`,priority:!0})}};t(k,e=>{m(T)?.photo&&e(A)});var j=a(k,2),M=p(j),N=d(M,!0),P=a(M,2),F=d(P,!0);l(j),u(2),l(O),i(()=>{r(N,m(T)?.title||`Error`),r(F,m(T)?.text||`An unexpected error occurred.`)}),n(_,E),s()}export{w as component};