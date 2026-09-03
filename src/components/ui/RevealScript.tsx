/**
 * The entrance observer.
 *
 * Inlined in the document rather than shipped as a component, for one reason:
 * it adds the `js-motion` class that permits the CSS to hide anything and it
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
 *   2b. A second, stricter observer serves groups marked `data-reveal-late`,
 *      which hold until they are 60% on screen so the reader gets to the
 *      heading first. The sweep and the guard skip those while they are
 *      legitimately waiting, or a deliberate pause would be treated as a fault
 *      and, in the guard's case, switch off every animation on the site. They
 *      use the SAME test the observer does, so the moment a group is on screen
 *      enough that it should have fired, the safety nets are free to act on it.
 *      An earlier version protected a late group until it was FULLY visible,
 *      which would have hidden a group taller than the viewport for good.
 *   3. A MutationObserver picks up blocks that arrive with a client-side
 *      navigation. Without it, every page reached by clicking a link inside
 *      the site would render its content hidden and never reveal it, which is
 *      the same blank-page failure in a new costume.
 *   4. A sweep shows anything still hidden but on screen, after every DOM
 *      change and again on load, pageshow and becoming visible.
 *   5. The guard. Four seconds after the last DOM change, if any block is
 *      STILL hidden while on screen, or the viewport measures zero, which
 *      means the observer can never fire, the whole hiding system is switched
 *      off by dropping `js-motion` and every block becomes visible at once.
 *      Unlike the sweep, this does not depend on the mechanism it is checking.
 *      A guest who loses the animation has lost nothing; a guest who loses the
 *      content has lost the site and this project has spent three attempts
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
 * is not rendering (a background tab, a hidden pane) whereas setTimeout is
 * only throttled and still fires. The first cut of this script debounced the
 * rescan with rAF and a client-side navigation into a non-rendering tab left
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
  var pending=0;
  var reveal=function(el){
    if(el.classList.contains('is-in'))return;
    el.classList.add('is-in');
    if(pending>0)pending--;
    if(pending<=0)unbindScroll();
  };
  var hit=function(entries,obs){
    for(var i=0;i<entries.length;i++){
      if(entries[i].isIntersecting){
        reveal(entries[i].target);
        obs.unobserve(entries[i].target);
      }
    }
  };
  var io=new IntersectionObserver(hit,{rootMargin:'0px 0px -8% 0px',threshold:0.01});
  /*
    "Properly on screen" has to mean either 60% of the block is showing OR the
    block is filling 60% of the screen. Ratio alone is not enough: a group
    taller than about 1.6 viewports can never reach a ratio of 0.6, so a plain
    threshold would leave it waiting for a moment that never comes.
  */
  var enough=function(r,vh){
    var h=r.height||1;
    var shown=Math.min(vh,r.bottom)-Math.max(0,r.top);
    if(shown<=0)return false;
    return shown/h>=0.6||shown>=vh*0.6;
  };
  var ioLate=new IntersectionObserver(function(entries,obs){
    var vh=window.innerHeight;
    for(var i=0;i<entries.length;i++){
      if(entries[i].isIntersecting&&enough(entries[i].boundingClientRect,vh)){
        reveal(entries[i].target);
        obs.unobserve(entries[i].target);
      }
    }
  },{threshold:[0,0.25,0.5,0.6,0.75,1]});
  var scan=function(){
    var els=document.querySelectorAll('.reveal:not(.is-in)');
    for(var i=0;i<els.length;i++){
      if(!seen.has(els[i])){
        seen.add(els[i]);
        pending++;
        (els[i].hasAttribute('data-reveal-late')?ioLate:io).observe(els[i]);
      }
    }
    if(pending>0)bindScroll();
  };
  /*
    A late group is SUPPOSED to sit unrevealed while it is partly on screen, so
    neither the sweep nor the guard may touch it until it is fully in view.
    Without this the safety nets would read a deliberate pause as a stuck reveal
    and, in the guard's case, switch off every animation on the site.
  */
  var waiting=function(el,r,vh){
    return el.hasAttribute('data-reveal-late')&&!enough(r,vh);
  };
  var sweep=function(){
    var stuck=document.querySelectorAll('.reveal:not(.is-in)');
    var vh=window.innerHeight;
    for(var i=0;i<stuck.length;i++){
      var r=stuck[i].getBoundingClientRect();
      if(waiting(stuck[i],r,vh))continue;
      if(r.top<vh&&r.bottom>0)reveal(stuck[i]);
    }
  };
  /*
    The scroll listener re-arms the guard and it must cost NOTHING per event.
    The first version of this ran a document-wide querySelector for unrevealed
    blocks on every scroll event: 33 microseconds a call once everything had been
    revealed, because the query then has to walk the whole document to return
    null, so it got MORE expensive the further down the page you were. It was
    measured at 0.15 to 0.48ms per event on a desktop, several times that on a
    mid-range phone and it never stopped, on every page of the site.

    Now the count of unrevealed blocks is kept as a number, the handler is an
    integer comparison and the listener takes itself off entirely once there
    is nothing left to reveal.
  */
  var scrollBound=false;
  var onScroll=function(){
    if(pending<=0){unbindScroll();return;}
    guard();
  };
  function bindScroll(){
    if(scrollBound)return;
    scrollBound=true;
    window.addEventListener('scroll',onScroll,{passive:true});
  }
  function unbindScroll(){
    if(!scrollBound)return;
    scrollBound=false;
    window.removeEventListener('scroll',onScroll);
  }
  var guardPending=false;
  var guard=function(){
    if(guardPending)return;
    guardPending=true;
    setTimeout(function(){
      guardPending=false;
      var stuck=document.querySelectorAll('.reveal:not(.is-in)');
      if(!stuck.length)return;
      var vh=window.innerHeight;
      if(vh<=0){root.classList.remove('js-motion');pending=0;unbindScroll();return;}
      for(var i=0;i<stuck.length;i++){
        var r=stuck[i].getBoundingClientRect();
        if(waiting(stuck[i],r,vh))continue;
        if(r.top<vh&&r.bottom>0){root.classList.remove('js-motion');pending=0;unbindScroll();return;}
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

}catch(e){root.classList.remove('js-motion');}
})();`;

export function RevealScript() {
  // eslint-disable-next-line react/no-danger
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
