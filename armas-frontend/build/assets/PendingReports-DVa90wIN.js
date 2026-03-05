import{R as qe,P as u,a2 as Je,r as N,j as f}from"./index-T-6qnOdo.js";import{g as Ke,a as Qe,r as Ze}from"./DefaultLayout-DUcFXQpG.js";import"./index.esm-ClsMiQVo.js";import"./CForm-o-NAh3lE.js";import"./cil-user-Dlmw-Gem.js";/*!
 * Font Awesome Free 5.15.4 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)
 */function D(e){return typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?D=function(t){return typeof t}:D=function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},D(e)}function et(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function tt(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function nt(e,t,r){return t&&tt(e.prototype,t),e}function rt(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function m(e){for(var t=1;t<arguments.length;t++){var r=arguments[t]!=null?arguments[t]:{},n=Object.keys(r);typeof Object.getOwnPropertySymbols=="function"&&(n=n.concat(Object.getOwnPropertySymbols(r).filter(function(a){return Object.getOwnPropertyDescriptor(r,a).enumerable}))),n.forEach(function(a){rt(e,a,r[a])})}return e}function Oe(e,t){return at(e)||it(e,t)||ot()}function at(e){if(Array.isArray(e))return e}function it(e,t){var r=[],n=!0,a=!1,i=void 0;try{for(var o=e[Symbol.iterator](),s;!(n=(s=o.next()).done)&&(r.push(s.value),!(t&&r.length===t));n=!0);}catch(l){a=!0,i=l}finally{try{!n&&o.return!=null&&o.return()}finally{if(a)throw i}}return r}function ot(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}var de=function(){},se={},Ae={},st=null,Ie={mark:de,measure:de};try{typeof window<"u"&&(se=window),typeof document<"u"&&(Ae=document),typeof MutationObserver<"u"&&(st=MutationObserver),typeof performance<"u"&&(Ie=performance)}catch{}var lt=se.navigator||{},me=lt.userAgent,he=me===void 0?"":me,V=se,k=Ae,$=Ie;V.document;var le=!!k.documentElement&&!!k.head&&typeof k.addEventListener=="function"&&typeof k.createElement=="function";~he.indexOf("MSIE")||~he.indexOf("Trident/");var E="___FONT_AWESOME___",je="fa",Se="svg-inline--fa",ft="data-fa-i2svg";(function(){try{return!0}catch{return!1}})();var J={GROUP:"group",PRIMARY:"primary",SECONDARY:"secondary"},Pe=V.FontAwesomeConfig||{};function ct(e){var t=k.querySelector("script["+e+"]");if(t)return t.getAttribute(e)}function ut(e){return e===""?!0:e==="false"?!1:e==="true"?!0:e}if(k&&typeof k.querySelector=="function"){var dt=[["data-family-prefix","familyPrefix"],["data-replacement-class","replacementClass"],["data-auto-replace-svg","autoReplaceSvg"],["data-auto-add-css","autoAddCss"],["data-auto-a11y","autoA11y"],["data-search-pseudo-elements","searchPseudoElements"],["data-observe-mutations","observeMutations"],["data-mutate-approach","mutateApproach"],["data-keep-original-source","keepOriginalSource"],["data-measure-performance","measurePerformance"],["data-show-missing-icons","showMissingIcons"]];dt.forEach(function(e){var t=Oe(e,2),r=t[0],n=t[1],a=ut(ct(r));a!=null&&(Pe[n]=a)})}var mt={familyPrefix:je,replacementClass:Se,autoReplaceSvg:!0,autoAddCss:!0,autoA11y:!0,searchPseudoElements:!1,observeMutations:!0,mutateApproach:"async",keepOriginalSource:!0,measurePerformance:!1,showMissingIcons:!0},ee=m({},mt,Pe);ee.autoReplaceSvg||(ee.observeMutations=!1);var j=m({},ee);V.FontAwesomeConfig=j;var C=V||{};C[E]||(C[E]={});C[E].styles||(C[E].styles={});C[E].hooks||(C[E].hooks={});C[E].shims||(C[E].shims=[]);var _=C[E],ht=[],gt=function e(){k.removeEventListener("DOMContentLoaded",e),te=1,ht.map(function(t){return t()})},te=!1;le&&(te=(k.documentElement.doScroll?/^loaded|^c/:/^loaded|^i|^c/).test(k.readyState),te||k.addEventListener("DOMContentLoaded",gt));var fe="pending",_e="settled",Y="fulfilled",H="rejected",pt=function(){},Ee=typeof global<"u"&&typeof global.process<"u"&&typeof global.process.emit=="function",vt=typeof setImmediate>"u"?setTimeout:setImmediate,L=[],ne;function bt(){for(var e=0;e<L.length;e++)L[e][0](L[e][1]);L=[],ne=!1}function B(e,t){L.push([e,t]),ne||(ne=!0,vt(bt,0))}function yt(e,t){function r(a){ce(t,a)}function n(a){F(t,a)}try{e(r,n)}catch(a){n(a)}}function Ce(e){var t=e.owner,r=t._state,n=t._data,a=e[r],i=e.then;if(typeof a=="function"){r=Y;try{n=a(n)}catch(o){F(i,o)}}Ne(i,n)||(r===Y&&ce(i,n),r===H&&F(i,n))}function Ne(e,t){var r;try{if(e===t)throw new TypeError("A promises callback cannot return that same promise.");if(t&&(typeof t=="function"||D(t)==="object")){var n=t.then;if(typeof n=="function")return n.call(t,function(a){r||(r=!0,t===a?Te(e,a):ce(e,a))},function(a){r||(r=!0,F(e,a))}),!0}}catch(a){return r||F(e,a),!0}return!1}function ce(e,t){(e===t||!Ne(e,t))&&Te(e,t)}function Te(e,t){e._state===fe&&(e._state=_e,e._data=t,B(wt,e))}function F(e,t){e._state===fe&&(e._state=_e,e._data=t,B(xt,e))}function Me(e){e._then=e._then.forEach(Ce)}function wt(e){e._state=Y,Me(e)}function xt(e){e._state=H,Me(e),!e._handled&&Ee&&global.process.emit("unhandledRejection",e._data,e)}function kt(e){global.process.emit("rejectionHandled",e)}function P(e){if(typeof e!="function")throw new TypeError("Promise resolver "+e+" is not a function");if(!(this instanceof P))throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");this._then=[],yt(e,this)}P.prototype={constructor:P,_state:fe,_then:null,_data:void 0,_handled:!1,then:function(t,r){var n={owner:this,then:new this.constructor(pt),fulfilled:t,rejected:r};return(r||t)&&!this._handled&&(this._handled=!0,this._state===H&&Ee&&B(kt,this)),this._state===Y||this._state===H?B(Ce,n):this._then.push(n),n.then},catch:function(t){return this.then(null,t)}};P.all=function(e){if(!Array.isArray(e))throw new TypeError("You must pass an array to Promise.all().");return new P(function(t,r){var n=[],a=0;function i(l){return a++,function(d){n[l]=d,--a||t(n)}}for(var o=0,s;o<e.length;o++)s=e[o],s&&typeof s.then=="function"?s.then(i(o),r):n[o]=s;a||t(n)})};P.race=function(e){if(!Array.isArray(e))throw new TypeError("You must pass an array to Promise.race().");return new P(function(t,r){for(var n=0,a;n<e.length;n++)a=e[n],a&&typeof a.then=="function"?a.then(t,r):t(a)})};P.resolve=function(e){return e&&D(e)==="object"&&e.constructor===P?e:new P(function(t){t(e)})};P.reject=function(e){return new P(function(t,r){r(e)})};var M={size:16,x:0,y:0,rotate:0,flipX:!1,flipY:!1};function Ot(e){if(!(!e||!le)){var t=k.createElement("style");t.setAttribute("type","text/css"),t.innerHTML=e;for(var r=k.head.childNodes,n=null,a=r.length-1;a>-1;a--){var i=r[a],o=(i.tagName||"").toUpperCase();["STYLE","LINK"].indexOf(o)>-1&&(n=i)}return k.head.insertBefore(t,n),e}}var At="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";function X(){for(var e=12,t="";e-- >0;)t+=At[Math.random()*62|0];return t}function ze(e){return"".concat(e).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function It(e){return Object.keys(e||{}).reduce(function(t,r){return t+"".concat(r,'="').concat(ze(e[r]),'" ')},"").trim()}function Re(e){return Object.keys(e||{}).reduce(function(t,r){return t+"".concat(r,": ").concat(e[r],";")},"")}function Le(e){return e.size!==M.size||e.x!==M.x||e.y!==M.y||e.rotate!==M.rotate||e.flipX||e.flipY}function De(e){var t=e.transform,r=e.containerWidth,n=e.iconWidth,a={transform:"translate(".concat(r/2," 256)")},i="translate(".concat(t.x*32,", ").concat(t.y*32,") "),o="scale(".concat(t.size/16*(t.flipX?-1:1),", ").concat(t.size/16*(t.flipY?-1:1),") "),s="rotate(".concat(t.rotate," 0 0)"),l={transform:"".concat(i," ").concat(o," ").concat(s)},d={transform:"translate(".concat(n/2*-1," -256)")};return{outer:a,inner:l,path:d}}var K={x:0,y:0,width:"100%",height:"100%"};function ge(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!0;return e.attributes&&(e.attributes.fill||t)&&(e.attributes.fill="black"),e}function jt(e){return e.tag==="g"?e.children:[e]}function St(e){var t=e.children,r=e.attributes,n=e.main,a=e.mask,i=e.maskId,o=e.transform,s=n.width,l=n.icon,d=a.width,g=a.icon,v=De({transform:o,containerWidth:d,iconWidth:s}),x={tag:"rect",attributes:m({},K,{fill:"white"})},S=l.children?{children:l.children.map(ge)}:{},O={tag:"g",attributes:m({},v.inner),children:[ge(m({tag:l.tag,attributes:m({},l.attributes,v.path)},S))]},A={tag:"g",attributes:m({},v.outer),children:[O]},b="mask-".concat(i||X()),y="clip-".concat(i||X()),I={tag:"mask",attributes:m({},K,{id:b,maskUnits:"userSpaceOnUse",maskContentUnits:"userSpaceOnUse"}),children:[x,A]},c={tag:"defs",children:[{tag:"clipPath",attributes:{id:y},children:jt(g)},I]};return t.push(c,{tag:"rect",attributes:m({fill:"currentColor","clip-path":"url(#".concat(y,")"),mask:"url(#".concat(b,")")},K)}),{children:t,attributes:r}}function Pt(e){var t=e.children,r=e.attributes,n=e.main,a=e.transform,i=e.styles,o=Re(i);if(o.length>0&&(r.style=o),Le(a)){var s=De({transform:a,containerWidth:n.width,iconWidth:n.width});t.push({tag:"g",attributes:m({},s.outer),children:[{tag:"g",attributes:m({},s.inner),children:[{tag:n.icon.tag,children:n.icon.children,attributes:m({},n.icon.attributes,s.path)}]}]})}else t.push(n.icon);return{children:t,attributes:r}}function _t(e){var t=e.children,r=e.main,n=e.mask,a=e.attributes,i=e.styles,o=e.transform;if(Le(o)&&r.found&&!n.found){var s=r.width,l=r.height,d={x:s/l/2,y:.5};a.style=Re(m({},i,{"transform-origin":"".concat(d.x+o.x/16,"em ").concat(d.y+o.y/16,"em")}))}return[{tag:"svg",attributes:a,children:t}]}function Et(e){var t=e.prefix,r=e.iconName,n=e.children,a=e.attributes,i=e.symbol,o=i===!0?"".concat(t,"-").concat(j.familyPrefix,"-").concat(r):i;return[{tag:"svg",attributes:{style:"display: none;"},children:[{tag:"symbol",attributes:m({},a,{id:o}),children:n}]}]}function Ct(e){var t=e.icons,r=t.main,n=t.mask,a=e.prefix,i=e.iconName,o=e.transform,s=e.symbol,l=e.title,d=e.maskId,g=e.titleId,v=e.extra,x=e.watchable,S=x===void 0?!1:x,O=n.found?n:r,A=O.width,b=O.height,y=a==="fak",I=y?"":"fa-w-".concat(Math.ceil(A/b*16)),c=[j.replacementClass,i?"".concat(j.familyPrefix,"-").concat(i):"",I].filter(function(W){return v.classes.indexOf(W)===-1}).filter(function(W){return W!==""||!!W}).concat(v.classes).join(" "),p={children:[],attributes:m({},v.attributes,{"data-prefix":a,"data-icon":i,class:c,role:v.attributes.role||"img",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 ".concat(A," ").concat(b)})},h=y&&!~v.classes.indexOf("fa-fw")?{width:"".concat(A/b*16*.0625,"em")}:{};S&&(p.attributes[ft]=""),l&&p.children.push({tag:"title",attributes:{id:p.attributes["aria-labelledby"]||"title-".concat(g||X())},children:[l]});var w=m({},p,{prefix:a,iconName:i,main:r,mask:n,maskId:d,transform:o,symbol:s,styles:m({},h,v.styles)}),R=n.found&&r.found?St(w):Pt(w),Ge=R.children,Ve=R.attributes;return w.children=Ge,w.attributes=Ve,s?Et(w):_t(w)}j.measurePerformance&&$&&$.mark&&$.measure;var Q=function(t,r,n,a){var i=Object.keys(t),o=i.length,s=r,l,d,g;for(n===void 0?(l=1,g=t[i[0]]):(l=0,g=n);l<o;l++)d=i[l],g=s(g,t[d],d,t);return g};function Fe(e,t){var r=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{},n=r.skipHooks,a=n===void 0?!1:n,i=Object.keys(t).reduce(function(o,s){var l=t[s],d=!!l.icon;return d?o[l.iconName]=l.icon:o[s]=l,o},{});typeof _.hooks.addPack=="function"&&!a?_.hooks.addPack(e,i):_.styles[e]=m({},_.styles[e]||{},i),e==="fas"&&Fe("fa",t)}var pe=_.styles,Nt=_.shims,Ue=function(){var t=function(a){return Q(pe,function(i,o,s){return i[s]=Q(o,a,{}),i},{})};t(function(n,a,i){return a[3]&&(n[a[3]]=i),n}),t(function(n,a,i){var o=a[2];return n[i]=i,o.forEach(function(s){n[s]=i}),n});var r="far"in pe;Q(Nt,function(n,a){var i=a[0],o=a[1],s=a[2];return o==="far"&&!r&&(o="fas"),n[i]={prefix:o,iconName:s},n},{})};Ue();_.styles;function ve(e,t,r){if(e&&e[t]&&e[t][r])return{prefix:t,iconName:r,icon:e[t][r]}}function We(e){var t=e.tag,r=e.attributes,n=r===void 0?{}:r,a=e.children,i=a===void 0?[]:a;return typeof e=="string"?ze(e):"<".concat(t," ").concat(It(n),">").concat(i.map(We).join(""),"</").concat(t,">")}var Tt=function(t){var r={size:16,x:0,y:0,flipX:!1,flipY:!1,rotate:0};return t?t.toLowerCase().split(" ").reduce(function(n,a){var i=a.toLowerCase().split("-"),o=i[0],s=i.slice(1).join("-");if(o&&s==="h")return n.flipX=!0,n;if(o&&s==="v")return n.flipY=!0,n;if(s=parseFloat(s),isNaN(s))return n;switch(o){case"grow":n.size=n.size+s;break;case"shrink":n.size=n.size-s;break;case"left":n.x=n.x-s;break;case"right":n.x=n.x+s;break;case"up":n.y=n.y-s;break;case"down":n.y=n.y+s;break;case"rotate":n.rotate=n.rotate+s;break}return n},r):r};function re(e){this.name="MissingIcon",this.message=e||"Icon unavailable",this.stack=new Error().stack}re.prototype=Object.create(Error.prototype);re.prototype.constructor=re;var q={fill:"currentColor"},$e={attributeType:"XML",repeatCount:"indefinite",dur:"2s"};m({},q,{d:"M156.5,447.7l-12.6,29.5c-18.7-9.5-35.9-21.2-51.5-34.9l22.7-22.7C127.6,430.5,141.5,440,156.5,447.7z M40.6,272H8.5 c1.4,21.2,5.4,41.7,11.7,61.1L50,321.2C45.1,305.5,41.8,289,40.6,272z M40.6,240c1.4-18.8,5.2-37,11.1-54.1l-29.5-12.6 C14.7,194.3,10,216.7,8.5,240H40.6z M64.3,156.5c7.8-14.9,17.2-28.8,28.1-41.5L69.7,92.3c-13.7,15.6-25.5,32.8-34.9,51.5 L64.3,156.5z M397,419.6c-13.9,12-29.4,22.3-46.1,30.4l11.9,29.8c20.7-9.9,39.8-22.6,56.9-37.6L397,419.6z M115,92.4 c13.9-12,29.4-22.3,46.1-30.4l-11.9-29.8c-20.7,9.9-39.8,22.6-56.8,37.6L115,92.4z M447.7,355.5c-7.8,14.9-17.2,28.8-28.1,41.5 l22.7,22.7c13.7-15.6,25.5-32.9,34.9-51.5L447.7,355.5z M471.4,272c-1.4,18.8-5.2,37-11.1,54.1l29.5,12.6 c7.5-21.1,12.2-43.5,13.6-66.8H471.4z M321.2,462c-15.7,5-32.2,8.2-49.2,9.4v32.1c21.2-1.4,41.7-5.4,61.1-11.7L321.2,462z M240,471.4c-18.8-1.4-37-5.2-54.1-11.1l-12.6,29.5c21.1,7.5,43.5,12.2,66.8,13.6V471.4z M462,190.8c5,15.7,8.2,32.2,9.4,49.2h32.1 c-1.4-21.2-5.4-41.7-11.7-61.1L462,190.8z M92.4,397c-12-13.9-22.3-29.4-30.4-46.1l-29.8,11.9c9.9,20.7,22.6,39.8,37.6,56.9 L92.4,397z M272,40.6c18.8,1.4,36.9,5.2,54.1,11.1l12.6-29.5C317.7,14.7,295.3,10,272,8.5V40.6z M190.8,50 c15.7-5,32.2-8.2,49.2-9.4V8.5c-21.2,1.4-41.7,5.4-61.1,11.7L190.8,50z M442.3,92.3L419.6,115c12,13.9,22.3,29.4,30.5,46.1 l29.8-11.9C470,128.5,457.3,109.4,442.3,92.3z M397,92.4l22.7-22.7c-15.6-13.7-32.8-25.5-51.5-34.9l-12.6,29.5 C370.4,72.1,384.4,81.5,397,92.4z"});var ue=m({},$e,{attributeName:"opacity"});m({},q,{cx:"256",cy:"364",r:"28"}),m({},$e,{attributeName:"r",values:"28;14;28;28;14;28;"}),m({},ue,{values:"1;0;1;1;0;1;"});m({},q,{opacity:"1",d:"M263.7,312h-16c-6.6,0-12-5.4-12-12c0-71,77.4-63.9,77.4-107.8c0-20-17.8-40.2-57.4-40.2c-29.1,0-44.3,9.6-59.2,28.7 c-3.9,5-11.1,6-16.2,2.4l-13.1-9.2c-5.6-3.9-6.9-11.8-2.6-17.2c21.2-27.2,46.4-44.7,91.2-44.7c52.3,0,97.4,29.8,97.4,80.2 c0,67.6-77.4,63.5-77.4,107.8C275.7,306.6,270.3,312,263.7,312z"}),m({},ue,{values:"1;0;0;0;0;1;"});m({},q,{opacity:"0",d:"M232.5,134.5l7,168c0.3,6.4,5.6,11.5,12,11.5h9c6.4,0,11.7-5.1,12-11.5l7-168c0.3-6.8-5.2-12.5-12-12.5h-23 C237.7,122,232.2,127.7,232.5,134.5z"}),m({},ue,{values:"0;0;1;1;0;0;"});_.styles;function be(e){var t=e[0],r=e[1],n=e.slice(4),a=Oe(n,1),i=a[0],o=null;return Array.isArray(i)?o={tag:"g",attributes:{class:"".concat(j.familyPrefix,"-").concat(J.GROUP)},children:[{tag:"path",attributes:{class:"".concat(j.familyPrefix,"-").concat(J.SECONDARY),fill:"currentColor",d:i[0]}},{tag:"path",attributes:{class:"".concat(j.familyPrefix,"-").concat(J.PRIMARY),fill:"currentColor",d:i[1]}}]}:o={tag:"path",attributes:{fill:"currentColor",d:i}},{found:!0,width:t,height:r,icon:o}}_.styles;var Mt=`svg:not(:root).svg-inline--fa {
  overflow: visible;
}

.svg-inline--fa {
  display: inline-block;
  font-size: inherit;
  height: 1em;
  overflow: visible;
  vertical-align: -0.125em;
}
.svg-inline--fa.fa-lg {
  vertical-align: -0.225em;
}
.svg-inline--fa.fa-w-1 {
  width: 0.0625em;
}
.svg-inline--fa.fa-w-2 {
  width: 0.125em;
}
.svg-inline--fa.fa-w-3 {
  width: 0.1875em;
}
.svg-inline--fa.fa-w-4 {
  width: 0.25em;
}
.svg-inline--fa.fa-w-5 {
  width: 0.3125em;
}
.svg-inline--fa.fa-w-6 {
  width: 0.375em;
}
.svg-inline--fa.fa-w-7 {
  width: 0.4375em;
}
.svg-inline--fa.fa-w-8 {
  width: 0.5em;
}
.svg-inline--fa.fa-w-9 {
  width: 0.5625em;
}
.svg-inline--fa.fa-w-10 {
  width: 0.625em;
}
.svg-inline--fa.fa-w-11 {
  width: 0.6875em;
}
.svg-inline--fa.fa-w-12 {
  width: 0.75em;
}
.svg-inline--fa.fa-w-13 {
  width: 0.8125em;
}
.svg-inline--fa.fa-w-14 {
  width: 0.875em;
}
.svg-inline--fa.fa-w-15 {
  width: 0.9375em;
}
.svg-inline--fa.fa-w-16 {
  width: 1em;
}
.svg-inline--fa.fa-w-17 {
  width: 1.0625em;
}
.svg-inline--fa.fa-w-18 {
  width: 1.125em;
}
.svg-inline--fa.fa-w-19 {
  width: 1.1875em;
}
.svg-inline--fa.fa-w-20 {
  width: 1.25em;
}
.svg-inline--fa.fa-pull-left {
  margin-right: 0.3em;
  width: auto;
}
.svg-inline--fa.fa-pull-right {
  margin-left: 0.3em;
  width: auto;
}
.svg-inline--fa.fa-border {
  height: 1.5em;
}
.svg-inline--fa.fa-li {
  width: 2em;
}
.svg-inline--fa.fa-fw {
  width: 1.25em;
}

.fa-layers svg.svg-inline--fa {
  bottom: 0;
  left: 0;
  margin: auto;
  position: absolute;
  right: 0;
  top: 0;
}

.fa-layers {
  display: inline-block;
  height: 1em;
  position: relative;
  text-align: center;
  vertical-align: -0.125em;
  width: 1em;
}
.fa-layers svg.svg-inline--fa {
  -webkit-transform-origin: center center;
          transform-origin: center center;
}

.fa-layers-counter, .fa-layers-text {
  display: inline-block;
  position: absolute;
  text-align: center;
}

.fa-layers-text {
  left: 50%;
  top: 50%;
  -webkit-transform: translate(-50%, -50%);
          transform: translate(-50%, -50%);
  -webkit-transform-origin: center center;
          transform-origin: center center;
}

.fa-layers-counter {
  background-color: #ff253a;
  border-radius: 1em;
  -webkit-box-sizing: border-box;
          box-sizing: border-box;
  color: #fff;
  height: 1.5em;
  line-height: 1;
  max-width: 5em;
  min-width: 1.5em;
  overflow: hidden;
  padding: 0.25em;
  right: 0;
  text-overflow: ellipsis;
  top: 0;
  -webkit-transform: scale(0.25);
          transform: scale(0.25);
  -webkit-transform-origin: top right;
          transform-origin: top right;
}

.fa-layers-bottom-right {
  bottom: 0;
  right: 0;
  top: auto;
  -webkit-transform: scale(0.25);
          transform: scale(0.25);
  -webkit-transform-origin: bottom right;
          transform-origin: bottom right;
}

.fa-layers-bottom-left {
  bottom: 0;
  left: 0;
  right: auto;
  top: auto;
  -webkit-transform: scale(0.25);
          transform: scale(0.25);
  -webkit-transform-origin: bottom left;
          transform-origin: bottom left;
}

.fa-layers-top-right {
  right: 0;
  top: 0;
  -webkit-transform: scale(0.25);
          transform: scale(0.25);
  -webkit-transform-origin: top right;
          transform-origin: top right;
}

.fa-layers-top-left {
  left: 0;
  right: auto;
  top: 0;
  -webkit-transform: scale(0.25);
          transform: scale(0.25);
  -webkit-transform-origin: top left;
          transform-origin: top left;
}

.fa-lg {
  font-size: 1.3333333333em;
  line-height: 0.75em;
  vertical-align: -0.0667em;
}

.fa-xs {
  font-size: 0.75em;
}

.fa-sm {
  font-size: 0.875em;
}

.fa-1x {
  font-size: 1em;
}

.fa-2x {
  font-size: 2em;
}

.fa-3x {
  font-size: 3em;
}

.fa-4x {
  font-size: 4em;
}

.fa-5x {
  font-size: 5em;
}

.fa-6x {
  font-size: 6em;
}

.fa-7x {
  font-size: 7em;
}

.fa-8x {
  font-size: 8em;
}

.fa-9x {
  font-size: 9em;
}

.fa-10x {
  font-size: 10em;
}

.fa-fw {
  text-align: center;
  width: 1.25em;
}

.fa-ul {
  list-style-type: none;
  margin-left: 2.5em;
  padding-left: 0;
}
.fa-ul > li {
  position: relative;
}

.fa-li {
  left: -2em;
  position: absolute;
  text-align: center;
  width: 2em;
  line-height: inherit;
}

.fa-border {
  border: solid 0.08em #eee;
  border-radius: 0.1em;
  padding: 0.2em 0.25em 0.15em;
}

.fa-pull-left {
  float: left;
}

.fa-pull-right {
  float: right;
}

.fa.fa-pull-left,
.fas.fa-pull-left,
.far.fa-pull-left,
.fal.fa-pull-left,
.fab.fa-pull-left {
  margin-right: 0.3em;
}
.fa.fa-pull-right,
.fas.fa-pull-right,
.far.fa-pull-right,
.fal.fa-pull-right,
.fab.fa-pull-right {
  margin-left: 0.3em;
}

.fa-spin {
  -webkit-animation: fa-spin 2s infinite linear;
          animation: fa-spin 2s infinite linear;
}

.fa-pulse {
  -webkit-animation: fa-spin 1s infinite steps(8);
          animation: fa-spin 1s infinite steps(8);
}

@-webkit-keyframes fa-spin {
  0% {
    -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
            transform: rotate(360deg);
  }
}

@keyframes fa-spin {
  0% {
    -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
            transform: rotate(360deg);
  }
}
.fa-rotate-90 {
  -ms-filter: "progid:DXImageTransform.Microsoft.BasicImage(rotation=1)";
  -webkit-transform: rotate(90deg);
          transform: rotate(90deg);
}

.fa-rotate-180 {
  -ms-filter: "progid:DXImageTransform.Microsoft.BasicImage(rotation=2)";
  -webkit-transform: rotate(180deg);
          transform: rotate(180deg);
}

.fa-rotate-270 {
  -ms-filter: "progid:DXImageTransform.Microsoft.BasicImage(rotation=3)";
  -webkit-transform: rotate(270deg);
          transform: rotate(270deg);
}

.fa-flip-horizontal {
  -ms-filter: "progid:DXImageTransform.Microsoft.BasicImage(rotation=0, mirror=1)";
  -webkit-transform: scale(-1, 1);
          transform: scale(-1, 1);
}

.fa-flip-vertical {
  -ms-filter: "progid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1)";
  -webkit-transform: scale(1, -1);
          transform: scale(1, -1);
}

.fa-flip-both, .fa-flip-horizontal.fa-flip-vertical {
  -ms-filter: "progid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1)";
  -webkit-transform: scale(-1, -1);
          transform: scale(-1, -1);
}

:root .fa-rotate-90,
:root .fa-rotate-180,
:root .fa-rotate-270,
:root .fa-flip-horizontal,
:root .fa-flip-vertical,
:root .fa-flip-both {
  -webkit-filter: none;
          filter: none;
}

.fa-stack {
  display: inline-block;
  height: 2em;
  position: relative;
  width: 2.5em;
}

.fa-stack-1x,
.fa-stack-2x {
  bottom: 0;
  left: 0;
  margin: auto;
  position: absolute;
  right: 0;
  top: 0;
}

.svg-inline--fa.fa-stack-1x {
  height: 1em;
  width: 1.25em;
}
.svg-inline--fa.fa-stack-2x {
  height: 2em;
  width: 2.5em;
}

.fa-inverse {
  color: #fff;
}

.sr-only {
  border: 0;
  clip: rect(0, 0, 0, 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
}

.sr-only-focusable:active, .sr-only-focusable:focus {
  clip: auto;
  height: auto;
  margin: 0;
  overflow: visible;
  position: static;
  width: auto;
}

.svg-inline--fa .fa-primary {
  fill: var(--fa-primary-color, currentColor);
  opacity: 1;
  opacity: var(--fa-primary-opacity, 1);
}

.svg-inline--fa .fa-secondary {
  fill: var(--fa-secondary-color, currentColor);
  opacity: 0.4;
  opacity: var(--fa-secondary-opacity, 0.4);
}

.svg-inline--fa.fa-swap-opacity .fa-primary {
  opacity: 0.4;
  opacity: var(--fa-secondary-opacity, 0.4);
}

.svg-inline--fa.fa-swap-opacity .fa-secondary {
  opacity: 1;
  opacity: var(--fa-primary-opacity, 1);
}

.svg-inline--fa mask .fa-primary,
.svg-inline--fa mask .fa-secondary {
  fill: black;
}

.fad.fa-inverse {
  color: #fff;
}`;function zt(){var e=je,t=Se,r=j.familyPrefix,n=j.replacementClass,a=Mt;if(r!==e||n!==t){var i=new RegExp("\\.".concat(e,"\\-"),"g"),o=new RegExp("\\--".concat(e,"\\-"),"g"),s=new RegExp("\\.".concat(t),"g");a=a.replace(i,".".concat(r,"-")).replace(o,"--".concat(r,"-")).replace(s,".".concat(n))}return a}var Rt=function(){function e(){et(this,e),this.definitions={}}return nt(e,[{key:"add",value:function(){for(var r=this,n=arguments.length,a=new Array(n),i=0;i<n;i++)a[i]=arguments[i];var o=a.reduce(this._pullDefinitions,{});Object.keys(o).forEach(function(s){r.definitions[s]=m({},r.definitions[s]||{},o[s]),Fe(s,o[s]),Ue()})}},{key:"reset",value:function(){this.definitions={}}},{key:"_pullDefinitions",value:function(r,n){var a=n.prefix&&n.iconName&&n.icon?{0:n}:n;return Object.keys(a).map(function(i){var o=a[i],s=o.prefix,l=o.iconName,d=o.icon;r[s]||(r[s]={}),r[s][l]=d}),r}}]),e}();function Lt(){j.autoAddCss&&!we&&(Ot(zt()),we=!0)}function Dt(e,t){return Object.defineProperty(e,"abstract",{get:t}),Object.defineProperty(e,"html",{get:function(){return e.abstract.map(function(n){return We(n)})}}),Object.defineProperty(e,"node",{get:function(){if(le){var n=k.createElement("div");return n.innerHTML=e.html,n.children}}}),e}function ye(e){var t=e.prefix,r=t===void 0?"fa":t,n=e.iconName;if(n)return ve(Ut.definitions,r,n)||ve(_.styles,r,n)}function Ft(e){return function(t){var r=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},n=(t||{}).icon?t:ye(t||{}),a=r.mask;return a&&(a=(a||{}).icon?a:ye(a||{})),e(n,m({},r,{mask:a}))}}var Ut=new Rt,we=!1,ae={transform:function(t){return Tt(t)}},Wt=Ft(function(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},r=t.transform,n=r===void 0?M:r,a=t.symbol,i=a===void 0?!1:a,o=t.mask,s=o===void 0?null:o,l=t.maskId,d=l===void 0?null:l,g=t.title,v=g===void 0?null:g,x=t.titleId,S=x===void 0?null:x,O=t.classes,A=O===void 0?[]:O,b=t.attributes,y=b===void 0?{}:b,I=t.styles,c=I===void 0?{}:I;if(e){var p=e.prefix,h=e.iconName,w=e.icon;return Dt(m({type:"icon"},e),function(){return Lt(),j.autoA11y&&(v?y["aria-labelledby"]="".concat(j.replacementClass,"-title-").concat(S||X()):(y["aria-hidden"]="true",y.focusable="false")),Ct({icons:{main:be(w),mask:s?be(s.icon):{found:!1,width:null,height:null,icon:{}}},prefix:p,iconName:h,transform:m({},M,n),symbol:i,title:v,maskId:d,titleId:S,extra:{attributes:y,styles:c,classes:A}})})}});function xe(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter(function(a){return Object.getOwnPropertyDescriptor(e,a).enumerable})),r.push.apply(r,n)}return r}function T(e){for(var t=1;t<arguments.length;t++){var r=arguments[t]!=null?arguments[t]:{};t%2?xe(Object(r),!0).forEach(function(n){z(e,n,r[n])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):xe(Object(r)).forEach(function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(r,n))})}return e}function G(e){"@babel/helpers - typeof";return G=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},G(e)}function z(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function $t(e,t){if(e==null)return{};var r={},n=Object.keys(e),a,i;for(i=0;i<n.length;i++)a=n[i],!(t.indexOf(a)>=0)&&(r[a]=e[a]);return r}function Ye(e,t){if(e==null)return{};var r=$t(e,t),n,a;if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],!(t.indexOf(n)>=0)&&Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}function ie(e){return Yt(e)||Ht(e)||Bt(e)||Xt()}function Yt(e){if(Array.isArray(e))return oe(e)}function Ht(e){if(typeof Symbol<"u"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function Bt(e,t){if(e){if(typeof e=="string")return oe(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);if(r==="Object"&&e.constructor&&(r=e.constructor.name),r==="Map"||r==="Set")return Array.from(e);if(r==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return oe(e,t)}}function oe(e,t){(t==null||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}function Xt(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Gt(e){var t,r=e.beat,n=e.fade,a=e.beatFade,i=e.bounce,o=e.shake,s=e.flash,l=e.spin,d=e.spinPulse,g=e.spinReverse,v=e.pulse,x=e.fixedWidth,S=e.inverse,O=e.border,A=e.listItem,b=e.flip,y=e.size,I=e.rotation,c=e.pull,p=(t={"fa-beat":r,"fa-fade":n,"fa-beat-fade":a,"fa-bounce":i,"fa-shake":o,"fa-flash":s,"fa-spin":l,"fa-spin-reverse":g,"fa-spin-pulse":d,"fa-pulse":v,"fa-fw":x,"fa-inverse":S,"fa-border":O,"fa-li":A,"fa-flip":b===!0,"fa-flip-horizontal":b==="horizontal"||b==="both","fa-flip-vertical":b==="vertical"||b==="both"},z(t,"fa-".concat(y),typeof y<"u"&&y!==null),z(t,"fa-rotate-".concat(I),typeof I<"u"&&I!==null&&I!==0),z(t,"fa-pull-".concat(c),typeof c<"u"&&c!==null),z(t,"fa-swap-opacity",e.swapOpacity),t);return Object.keys(p).map(function(h){return p[h]?h:null}).filter(function(h){return h})}function Vt(e){return e=e-0,e===e}function He(e){return Vt(e)?e:(e=e.replace(/[\-_\s]+(.)?/g,function(t,r){return r?r.toUpperCase():""}),e.substr(0,1).toLowerCase()+e.substr(1))}var qt=["style"];function Jt(e){return e.charAt(0).toUpperCase()+e.slice(1)}function Kt(e){return e.split(";").map(function(t){return t.trim()}).filter(function(t){return t}).reduce(function(t,r){var n=r.indexOf(":"),a=He(r.slice(0,n)),i=r.slice(n+1).trim();return a.startsWith("webkit")?t[Jt(a)]=i:t[a]=i,t},{})}function Be(e,t){var r=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{};if(typeof t=="string")return t;var n=(t.children||[]).map(function(l){return Be(e,l)}),a=Object.keys(t.attributes||{}).reduce(function(l,d){var g=t.attributes[d];switch(d){case"class":l.attrs.className=g,delete t.attributes.class;break;case"style":l.attrs.style=Kt(g);break;default:d.indexOf("aria-")===0||d.indexOf("data-")===0?l.attrs[d.toLowerCase()]=g:l.attrs[He(d)]=g}return l},{attrs:{}}),i=r.style,o=i===void 0?{}:i,s=Ye(r,qt);return a.attrs.style=T(T({},a.attrs.style),o),e.apply(void 0,[t.tag,T(T({},a.attrs),s)].concat(ie(n)))}var Xe=!1;try{Xe=!0}catch{}function Qt(){if(!Xe&&console&&typeof console.error=="function"){var e;(e=console).error.apply(e,arguments)}}function ke(e){if(e&&G(e)==="object"&&e.prefix&&e.iconName&&e.icon)return e;if(ae.icon)return ae.icon(e);if(e===null)return null;if(e&&G(e)==="object"&&e.prefix&&e.iconName)return e;if(Array.isArray(e)&&e.length===2)return{prefix:e[0],iconName:e[1]};if(typeof e=="string")return{prefix:"fas",iconName:e}}function Z(e,t){return Array.isArray(t)&&t.length>0||!Array.isArray(t)&&t?z({},e,t):{}}var Zt=["forwardedRef"];function U(e){var t=e.forwardedRef,r=Ye(e,Zt),n=r.icon,a=r.mask,i=r.symbol,o=r.className,s=r.title,l=r.titleId,d=r.maskId,g=ke(n),v=Z("classes",[].concat(ie(Gt(r)),ie(o.split(" ")))),x=Z("transform",typeof r.transform=="string"?ae.transform(r.transform):r.transform),S=Z("mask",ke(a)),O=Wt(g,T(T(T(T({},v),x),S),{},{symbol:i,title:s,titleId:l,maskId:d}));if(!O)return Qt("Could not find icon",g),null;var A=O.abstract,b={ref:t};return Object.keys(r).forEach(function(y){U.defaultProps.hasOwnProperty(y)||(b[y]=r[y])}),en(A[0],b)}U.displayName="FontAwesomeIcon";U.propTypes={beat:u.bool,border:u.bool,beatFade:u.bool,bounce:u.bool,className:u.string,fade:u.bool,flash:u.bool,mask:u.oneOfType([u.object,u.array,u.string]),maskId:u.string,fixedWidth:u.bool,inverse:u.bool,flip:u.oneOf([!0,!1,"horizontal","vertical","both"]),icon:u.oneOfType([u.object,u.array,u.string]),listItem:u.bool,pull:u.oneOf(["right","left"]),pulse:u.bool,rotation:u.oneOf([0,90,180,270]),shake:u.bool,size:u.oneOf(["2xs","xs","sm","lg","xl","2xl","1x","2x","3x","4x","5x","6x","7x","8x","9x","10x"]),spin:u.bool,spinPulse:u.bool,spinReverse:u.bool,symbol:u.oneOfType([u.bool,u.string]),title:u.string,titleId:u.string,transform:u.oneOfType([u.string,u.object]),swapOpacity:u.bool};U.defaultProps={border:!1,className:"",mask:null,maskId:null,fixedWidth:!1,inverse:!1,flip:!1,icon:null,listItem:!1,pull:null,pulse:!1,rotation:null,size:null,spin:!1,spinPulse:!1,spinReverse:!1,beat:!1,fade:!1,beatFade:!1,bounce:!1,shake:!1,symbol:!1,title:"",titleId:null,transform:null,swapOpacity:!1};var en=Be.bind(null,qe.createElement);/*!
 * Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)
 * Copyright 2025 Fonticons, Inc.
 */var tn={prefix:"fas",iconName:"user-pen",icon:[640,512,["user-edit"],"f4ff","M256.1 248a120 120 0 1 0 0-240 120 120 0 1 0 0 240zm-29.7 56c-98.5 0-178.3 79.8-178.3 178.3 0 16.4 13.3 29.7 29.7 29.7l196.5 0 10.9-54.5c4.3-21.7 15-41.6 30.6-57.2l67.3-67.3c-28-18.3-61.4-28.9-97.4-28.9l-59.4 0zM332.3 466.9l-11.9 59.6c-.2 .9-.3 1.9-.3 2.9 0 8 6.5 14.6 14.6 14.6 1 0 1.9-.1 2.9-.3l59.6-11.9c12.4-2.5 23.8-8.6 32.7-17.5l118.9-118.9-80-80-118.9 118.9c-8.9 8.9-15 20.3-17.5 32.7zm267.8-123c22.1-22.1 22.1-57.9 0-80s-57.9-22.1-80 0l-28.8 28.8 80 80 28.8-28.8z"]},nn=tn;const fn=()=>{const{roles:e}=Je(),[t,r]=N.useState([]),[n,a]=N.useState(""),[i,o]=N.useState(""),[s,l]=N.useState(!1),[d,g]=N.useState(null),[v,x]=N.useState(""),[S,O]=N.useState([]),A=e.includes("ARCHIVER"),b=async()=>{var c;if(!A){a("Unauthorized access. ARCHIVER role required.");return}try{console.log("Fetching tasks assigned by ARCHIVER");const h=(await Ke()).filter(w=>w&&w.id&&["Assigned","Rejected"].includes(w.reportstatus));console.log("Filtered tasks:",JSON.stringify(h,null,2)),r(h),a(""),h.length===0&&a("No pending tasks assigned by you are available.")}catch(p){const h=p.message||"Unknown error";a(`Failed to load pending tasks: ${h}`),console.error("Fetch error:",((c=p.response)==null?void 0:c.data)||p)}};N.useEffect(()=>{b()},[e]);const y=async c=>{var p;g(c),a(""),x("");try{const h=await Qe("SENIOR_AUDITOR");console.log("Auditors fetched:",h),O(h),l(!0)}catch(h){const w=h.message||"Unknown error";a(`Failed to load auditors: ${w}`),console.error("Error fetching auditors:",((p=h.response)==null?void 0:p.data)||h)}},I=async()=>{var c;if(!v){a("Please select a Senior Auditor");return}try{await Ze(d.id,v),o("Task reassigned successfully"),l(!1),x(""),await b(),setTimeout(()=>o(""),3e3)}catch(p){const h=p.message||"Unknown error";a(`Failed to reassign task: ${h}`),console.error("Reassign error:",((c=p.response)==null?void 0:c.data)||p),setTimeout(()=>a(""),5e3)}};return f.jsxs("div",{className:"container mt-5",children:[f.jsx("h2",{children:"Pending Reports"}),n&&f.jsx("div",{className:"alert alert-danger",children:n}),i&&f.jsx("div",{className:"alert alert-success",children:i}),t.length===0&&!n&&f.jsx("div",{className:"alert alert-info",children:"No pending tasks available."}),t.length>0&&f.jsxs("table",{className:"table table-striped",children:[f.jsx("thead",{children:f.jsxs("tr",{children:[f.jsx("th",{children:"Date"}),f.jsx("th",{children:"Status"}),f.jsx("th",{children:"Organization"}),f.jsx("th",{children:"Budget Year"}),f.jsx("th",{children:"Report Type"}),f.jsx("th",{children:"Assigned Auditor"}),f.jsx("th",{children:"Action"})]})}),f.jsx("tbody",{children:t.map(c=>{var p,h,w,R;return f.jsxs("tr",{children:[f.jsx("td",{children:c.createdDate?new Date(c.createdDate).toLocaleDateString():"N/A"}),f.jsx("td",{children:c.reportstatus||"N/A"}),f.jsx("td",{children:((p=c.organization)==null?void 0:p.orgname)||c.orgname||"N/A"}),f.jsx("td",{children:((h=c.budgetYear)==null?void 0:h.fiscalYear)||c.fiscalYear||"N/A"}),f.jsx("td",{children:((w=c.transactiondocument)==null?void 0:w.reportype)||c.reportype||"N/A"}),f.jsx("td",{children:((R=c.user2)==null?void 0:R.username)||c.assignedAuditorUsername||"N/A"}),f.jsx("td",{children:f.jsxs("button",{className:"btn btn-warning btn-sm",onClick:()=>y(c),title:"Reassign Task",children:[f.jsx(U,{icon:nn})," Reassign"]})})]},c.id)})})]}),s&&f.jsx("div",{className:"modal",style:{display:"block",backgroundColor:"rgba(0,0,0,0.5)"},children:f.jsx("div",{className:"modal-dialog",children:f.jsxs("div",{className:"modal-content",children:[f.jsxs("div",{className:"modal-header",children:[f.jsx("h5",{className:"modal-title",children:"Reassign Task"}),f.jsx("button",{type:"button",className:"btn-close",onClick:()=>l(!1)})]}),f.jsx("div",{className:"modal-body",children:f.jsxs("div",{className:"form-group",children:[f.jsx("label",{htmlFor:"auditor",children:"Select Senior Auditor:"}),f.jsxs("select",{className:"form-control",id:"auditor",value:v,onChange:c=>x(c.target.value),children:[f.jsx("option",{value:"",children:"Select Senior Auditor"}),S.map(c=>f.jsxs("option",{value:c.username,children:[c.firstName," ",c.lastName," (",c.username,")"]},c.id))]})]})}),f.jsxs("div",{className:"modal-footer",children:[f.jsx("button",{type:"button",className:"btn btn-secondary",onClick:()=>l(!1),children:"Close"}),f.jsx("button",{type:"button",className:"btn btn-primary",onClick:I,children:"Reassign"})]})]})})})]})};export{fn as default};
