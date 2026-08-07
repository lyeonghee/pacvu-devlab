// PacVu 2D workspace watermark overlay.
// Screen UI only: independent from dieline renderers and export SVG output.
(function(root){
  'use strict';

  const CONFIG=Object.freeze({
    text:'PacVu',
    fontPx:40,
    tileWidthPx:300,
    tileHeightPx:200,
    textXPx:55,
    textYPx:125,
    angleDeg:-25,
    opacity:.11,
    color:'#999',
    fontFamily:'Pretendard, Arial, sans-serif',
    fontWeight:700
  });
  const OVERLAY_ID='pacvu-2d-watermark-overlay';
  let observer=null,scheduled=false;

  function hideRendererWatermarks(host){
    const svg=host.querySelector('#mainSvg');
    if(!svg)return;
    svg.querySelectorAll('#layer-watermark, rect[fill="url(#wm)"], rect[fill*="watermark"]').forEach(node=>{
      node.style.display='none';
      node.dataset.pacvuWatermarkSuppressed='true';
    });
    svg.querySelectorAll('text').forEach(node=>{
      if(node.closest('[data-pacvu-watermark-overlay]'))return;
      if((node.textContent||'').trim()!==CONFIG.text)return;
      node.style.display='none';
      node.dataset.pacvuWatermarkSuppressed='true';
    });
  }

  function createOverlay(){
    const ns='http://www.w3.org/2000/svg';
    const svg=document.createElementNS(ns,'svg');
    svg.id=OVERLAY_ID;
    svg.dataset.pacvuWatermarkOverlay='true';
    svg.setAttribute('aria-hidden','true');
    Object.assign(svg.style,{position:'absolute',inset:'0',width:'100%',height:'100%',zIndex:'5',pointerEvents:'none',overflow:'hidden'});
    const defs=document.createElementNS(ns,'defs'),pattern=document.createElementNS(ns,'pattern');
    pattern.id='pacvu-ui-watermark-pattern';
    pattern.setAttribute('patternUnits','userSpaceOnUse');
    pattern.setAttribute('width',String(CONFIG.tileWidthPx));
    pattern.setAttribute('height',String(CONFIG.tileHeightPx));
    pattern.setAttribute('patternTransform',`rotate(${CONFIG.angleDeg})`);
    const text=document.createElementNS(ns,'text');
    text.setAttribute('x',String(CONFIG.textXPx));text.setAttribute('y',String(CONFIG.textYPx));
    text.setAttribute('font-size',String(CONFIG.fontPx));text.setAttribute('font-family',CONFIG.fontFamily);
    text.setAttribute('font-weight',String(CONFIG.fontWeight));text.setAttribute('fill',CONFIG.color);
    text.setAttribute('opacity',String(CONFIG.opacity));text.textContent=CONFIG.text;
    const rect=document.createElementNS(ns,'rect');
    rect.setAttribute('width','100%');rect.setAttribute('height','100%');rect.setAttribute('fill','url(#pacvu-ui-watermark-pattern)');
    pattern.append(text);defs.append(pattern);svg.append(defs,rect);return svg;
  }

  function apply(){
    scheduled=false;
    const host=document.getElementById('svgHost');if(!host)return false;
    if(getComputedStyle(host).position==='static')host.style.position='relative';
    hideRendererWatermarks(host);
    let overlay=host.querySelector(`#${OVERLAY_ID}`);
    if(!overlay){overlay=createOverlay();host.append(overlay);}
    return true;
  }
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(apply);}
  function install(){
    const host=document.getElementById('svgHost');if(!host){requestAnimationFrame(install);return;}
    apply();observer=new MutationObserver(schedule);observer.observe(host,{childList:true,subtree:true});
    window.addEventListener('resize',schedule,{passive:true});
  }

  root.PacVu2DWatermarkOverlay=Object.freeze({apply,config:CONFIG});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})(typeof window!=='undefined'?window:globalThis);
