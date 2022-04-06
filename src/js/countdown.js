(function(e,t){"object"===typeof exports&&"object"===typeof module?module.exports=t():"function"===typeof define&&define.amd?define([],t):"object"===typeof exports?exports["vue-awesome-countdown"]=t():e["vue-awesome-countdown"]=t()})("undefined"!==typeof self?self:this,(function(){return function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s="9896")}({"79e4":function(e,t,n){var r,o,i;(function(n,a){o=[],r=a,i="function"===typeof r?r.apply(t,o):r,void 0===i||(e.exports=i)})("undefined"!==typeof self&&self,(function(){function e(){var t=Object.getOwnPropertyDescriptor(document,"currentScript");if(!t&&"currentScript"in document&&document.currentScript)return document.currentScript;if(t&&t.get!==e&&document.currentScript)return document.currentScript;try{throw new Error}catch(m){var n,r,o,i=/.*at [^(]*\((.*):(.+):(.+)\)$/gi,a=/@([^@]*):(\d+):(\d+)\s*$/gi,s=i.exec(m.stack)||a.exec(m.stack),u=s&&s[1]||!1,c=s&&s[2]||!1,d=document.location.href.replace(document.location.hash,""),l=document.getElementsByTagName("script");u===d&&(n=document.documentElement.outerHTML,r=new RegExp("(?:[^\\n]+?\\n){0,"+(c-2)+"}[^<]*<script>([\\d\\D]*?)<\\/script>[\\d\\D]*","i"),o=n.replace(r,"$1").trim());for(var p=0;p<l.length;p++){if("interactive"===l[p].readyState)return l[p];if(l[p].src===u)return l[p];if(u===d&&l[p].innerHTML&&l[p].innerHTML.trim()===o)return l[p]}return null}}return e}))},9896:function(e,t,n){"use strict";if(n.r(t),"undefined"!==typeof window){var r=window.document.currentScript,o=n("79e4");r=o(),"currentScript"in document||Object.defineProperty(document,"currentScript",{get:o});var i=r&&r.src.match(/(.+\/)[^/]+\.js(\?.*)?$/);i&&(n.p=i[1])}var a=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n(e.tag,e._g(e._b({tag:"components"},"components",e.attrs,!1),e.$listeners),[e._t("prev",null,null,this._self),"beforeStart"===e.state?e._t("before",null,null,this._self):e._e(),"preheat"===e.state?e._t("preheat",null,null,this._self):e._e(),"process"===e.state||"stopped"===e.state||"paused"===e.state?e._t("process",null,null,this._self):e._e(),"finished"===e.state?e._t("finish",null,null,this._self):e._e(),e._t("default",null,null,this._self)],2)},s=[],u={name:"vue-awesome-countdown",props:{startTime:{type:[String,Number,Date],default:null,validator:function(e){return"Invalid Date"!==new Date(e).toString()}},endTime:{type:[String,Number,Date],default:null,validator:function(e){return"Invalid Date"!==new Date(e).toString()}},leftTime:{type:Number,default:0},autoStart:{type:Boolean,default:!0},speed:{type:Number,default:1e3,validator:function(e){return e>=0}},tag:{type:String,default:"span"}},computed:{thousandSpeed(){return this.speed>0&&this.speed%1e3===0}},data:function(){return{state:"beforeStart",attrs:{},actualStartTime:null,actualEndTime:null,timeObj:{},countdownTimer:null,runTimes:0,usedTime:0,remainingTime:0}},watch:{speed(e,t){const n=this;if(e<0&&(e=0),e!==t){clearTimeout(n.countdownTimer);const t=(new Date).getTime(),r=Math.floor((t-n.actualStartTime)/e),o=t%e;n.runTimes=r,n.$nextTick(()=>{n.countdownTimer=setTimeout(n.doCountdown,o)})}}},created(){const e=this,t=e.startTime&&new Date(e.startTime).getTime()||0,n=t&&t-(new Date).getTime()||0;e.autoStart&&(e.state="preheat",setTimeout(()=>{e.startCountdown(!0)},n))},methods:{startCountdown(e){const t=this;("beforeStart"===t.state||"stopped"===t.state||"paused"===t.state||e)&&(e&&Object.assign(t.$data,t.$options.data.call(t)),"stopped"===t.state&&(t.remainingTime=t.actualEndTime-(new Date).getTime()),t.actualEndTime||(t.actualEndTime=t.endTime||(new Date).getTime()+(t.remainingTime||t.leftTime)),"paused"===t.state&&(t.actualEndTime=(new Date).getTime()+t.remainingTime),t.$emit("start",t),t.state="process",t.doCountdown())},stopCountdown(){const e=this;"process"===e.state&&(clearTimeout(e.countdownTimer),e.$emit("stop",e),e.state="stopped")},pauseCountdown(){const e=this;"process"===e.state&&(clearTimeout(e.countdownTimer),e.remainingTime=e.actualEndTime-(new Date).getTime(),e.$emit("paused",e),e.state="paused")},switchCountdown(){const e=this;return"stopped"===e.state||"beforeStart"===e.state?e.startCountdown():"process"===e.state?e.stopCountdown():void 0},finishCountdown(){const e=this;e.state="finished",e.timeObj={},e.usedTime=(new Date).getTime()-e.actualStartTime,e.$emit("finish",e)},doCountdown(){const e=this;if("process"!==e.state)return;e.actualStartTime||(e.actualStartTime=(new Date).getTime());let t=new Date(e.actualEndTime).getTime()-(new Date).getTime();if(!(t>0))return void e.finishCountdown();{const n={};let r=t/1e3,o=t%1e3;e.thousandSpeed&&o>990&&(r=Math.ceil(r),o=0);const i={d:r/60/60/24,h:r/60/60%24,m:r/60%60,s:r%60,ms:o},a={d:parseInt(i.d,10).toString(),h:parseInt(i.h,10).toString().padStart(2,0),m:parseInt(i.m,10).toString().padStart(2,0),s:parseInt(i.s,10).toString().padStart(2,0),ms:i.ms.toString().padStart(3,0)},s={d:parseInt(Math.ceil(r/60/60/24),10),h:parseInt(Math.ceil(r/60/60),10),m:parseInt(Math.ceil(r/60),10),s:parseInt(Math.ceil(r),10)};n.endTime=e.actualEndTime,n.speed=e.speed,e.usedTime=(new Date).getTime()-e.actualStartTime,n.leftTime=t,e.remainingTime=t,e.timeObj=Object.assign({},n,a,{org:i,ceil:s}),e.timeObj.org=i,e.timeObj.ceil=s,e.$emit("process",e)}let n=e.speed+(e.actualStartTime+e.runTimes++*e.speed-(new Date).getTime());n<0&&(n+=e.speed),t<e.speed&&(n=t),e.countdownTimer=setTimeout(e.doCountdown,n)}}},c=u;function d(e,t,n,r,o,i,a,s){var u,c="function"===typeof e?e.options:e;if(t&&(c.render=t,c.staticRenderFns=n,c._compiled=!0),r&&(c.functional=!0),i&&(c._scopeId="data-v-"+i),a?(u=function(e){e=e||this.$vnode&&this.$vnode.ssrContext||this.parent&&this.parent.$vnode&&this.parent.$vnode.ssrContext,e||"undefined"===typeof __VUE_SSR_CONTEXT__||(e=__VUE_SSR_CONTEXT__),o&&o.call(this,e),e&&e._registeredComponents&&e._registeredComponents.add(a)},c._ssrRegister=u):o&&(u=s?function(){o.call(this,(c.functional?this.parent:this).$root.$options.shadowRoot)}:o),u)if(c.functional){c._injectStyles=u;var d=c.render;c.render=function(e,t){return u.call(t),d(e,t)}}else{var l=c.beforeCreate;c.beforeCreate=l?[].concat(l,u):[u]}return{exports:e,options:c}}var l=d(c,a,s,!1,null,null,null),p=l.exports;const m={install:function(e,t){const n=t||"vac";e.component(n,p),e.component("countdown",p)}};"undefined"!==typeof window&&window.Vue&&window.Vue.use(m);var f=m;t["default"]=f}})}));
//# sourceMappingURL=vue-awesome-countdown.umd.min.js.map
