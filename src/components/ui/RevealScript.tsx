/**
 * The entrance observer.
 *
 * Inlined in the document rather than shipped as a component, for one reason:
 * it adds the `js-motion` class that permits the CSS to hide anything, and it
 * has to do that before the first paint or blocks would flash in and then
 * disappear. It is deliberately plain, dependency-free and defensive, because
 * every previous version of this feature failed by leaving a guest looking at
 * an empty screen.
 *
 * The contract, in order of importance:
 *
 *   1. If this script does not run, throws, or finds no IntersectionObserver,
 *      `js-motion` is never added and the CSS hides nothing. The page is a
 *      static, fully legible document. Failing closed is not an option here.
 *   2. Under prefers-reduced-motion it returns before adding anything, so the
 *      page is again simply static.
 *   3. A MutationObserver picks up blocks that arrive with a client-side
 *      navigation. Without it, every page reached by clicking a link inside
 *      the site would render its content hidden and never reveal it — which is
 *      the same blank-page failure in a new costume.
 *   4. A sweep shows anything still hidden but on screen, after every DOM
 *      change and again on load, pageshow and becoming visible.
 *   5. The guard. Four seconds after the last DOM change, if any block is
 *      STILL hidden while on screen — or the viewport measures zero, which
 *      means the observer can never fire — the whole hiding system is switched
 *      off by dropping `js-motion`, and every block becomes visible at once.
 *      Unlike the sweep, this does not depend on the mechanism it is checking.
 *      A guest who loses the animation has lost nothing; a guest who loses the
 *      content has lost the site, and this project has spent three attempts
 *      proving which of those actually happens.
 *
 *      The guard also re-arms on scroll, because otherwise it only ever ran
 *      against whatever was on screen when the page loaded. Scrolling down to
 *      content the observer never revealed would not have re-checked anything.
 *      Where the observer is working this costs nothing: by the time the check
 *      runs, the block already carries `is-in` and the guard does nothing.
 *
 * Everything here is debounced with setTimeout and never requestAnimationFrame.
 * That is not a style preference: rAF is PAUSED outright whenever the surface
 * is not rendering — a background tab, a hidden pane — whereas setTimeout is
 * only throttled and still fires. The first cut of this script debounced the
 * rescan with rAF, and a client-side navigation into a non-rendering tab left
 * all eighteen blocks on the rates page without `is-in` and two of them
 * invisible on screen. Caught in testing, but it is exactly the failure this
 * component exists to prevent.
 */
const SCRIPT = `(function(){
var root=document.documentElement;
try{
  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  if(!('IntersectionObserver' in window))return;
  root.classList.add('js-motion');
  var seen=new WeakSet();
  var io=new IntersectionObserver(function(entries){
    for(var i=0;i<entries.length;i++){
      if(entries[i].isIntersecting){
        entries[i].target.classList.add('is-in');
        io.unobserve(entries[i].target);
      }
    }
  },{rootMargin:'0px 0px -8% 0px',threshold:0.01});
  var scan=function(){
    var els=document.querySelectorAll('.reveal:not(.is-in)');
    for(var i=0;i<els.length;i++){
      if(!seen.has(els[i])){seen.add(els[i]);io.observe(els[i]);}
    }
  };
  var sweep=function(){
    var stuck=document.querySelectorAll('.reveal:not(.is-in)');
    for(var i=0;i<stuck.length;i++){
      var r=stuck[i].getBoundingClientRect();
      if(r.top<window.innerHeight&&r.bottom>0)stuck[i].classList.add('is-in');
    }
  };
  var guardPending=false;
  var guard=function(){
    if(guardPending)return;
    guardPending=true;
    setTimeout(function(){
      guardPending=false;
      var stuck=document.querySelectorAll('.reveal:not(.is-in)');
      if(!stuck.length)return;
      var vh=window.innerHeight;
      if(vh<=0){root.classList.remove('js-motion');return;}
      for(var i=0;i<stuck.length;i++){
        var r=stuck[i].getBoundingClientRect();
        if(r.top<vh&&r.bottom>0){root.classList.remove('js-motion');return;}
      }
    },4000);
  };
  var queued=false;
  var queue=function(){
    if(queued)return;
    queued=true;
    setTimeout(function(){queued=false;scan();setTimeout(sweep,1200);guard();},0);
  };
  scan();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan);
  new MutationObserver(queue).observe(root,{childList:true,subtree:true});
  window.addEventListener('load',function(){setTimeout(sweep,1200);guard();});
  guard();
  window.addEventListener('pageshow',queue);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)queue();});
  window.addEventListener('scroll',function(){
    if(document.querySelector('.reveal:not(.is-in)'))guard();
  },{passive:true});
}catch(e){root.classList.remove('js-motion');}
})();`;

export function RevealScript() {
  // eslint-disable-next-line react/no-danger
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
