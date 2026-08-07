(function(global){
  'use strict';
  if(!global.R002_getLayout||!global.R001_3D_MASTER)return;

  const SOURCE_OUTLINE=
    'M788.549,712.068 L887.762,685.484 L887.762,203.594 L2092.486,203.594 '+
    'L2092.486,678.397 c0,3.869,3.106,7.025,6.975,7.086,3.869,.06,7.073-2.997,7.193-6.865 '+
    'L2120.832,203.594 L3013.746,203.594 L3027.923,678.618 '+
    'c.121,3.868,3.324,6.925,7.193,6.865,3.869-.061,6.976-3.216,6.976-7.086 '+
    'L3042.092,203.594 L4246.817,203.594 L4246.817,678.397 '+
    'c0,3.869,3.106,7.025,6.976,7.086,3.869,.06,7.073-2.997,7.193-6.865 '+
    'L4275.163,203.594 L5166.659,203.594 L5180.832,675.563 L5190.754,685.484 '+
    'L5190.754,977.452 l-9.922,9.921-14.173,471.968h-891.496l-14.177-475.025'+
    'c-.12-3.867-3.324-6.924-7.193-6.864-3.869.06-6.976,3.216-6.976,7.086v474.803'+
    'h-1204.726v-474.803c0-3.87-3.106-7.025-6.976-7.086-3.869-.06-7.073,2.997-7.193,6.864'+
    'l-14.177,475.025h-892.914l-14.177-475.025c-.12-3.867-3.324-6.924-7.193-6.864'+
    '-3.869.06-6.975,3.216-6.975,7.086v474.803H887.762v-481.89l-99.213-26.584Z';

  function inputFor(cfg){
    const layout=global.R002_getLayout(cfg.W,cfg.D,cfg.H);
    const source=layout.spec;
    return {
      W:cfg.W,D:cfg.D,H:cfg.H,__code:'R002',__layout:layout,
      __outerPath:global.PacVuShipping.mapPath(SOURCE_OUTLINE,source.mapX,source.mapY),
      __spec:{
        xGlueL:source.mapX(source.base.sourceGlueL),xFrontL:source.xFrontL,xFrontR:source.xFrontR,
        xSideLR:source.xSideLR,xBackR:source.xBackR,xSideRR:source.xSideRR,
        yTop:source.yTop,yFoldTop:source.yFoldTop,yFoldTop_arc:source.yFoldTopArc,
        yFoldBot:source.yFoldBot,yFoldBot_arc:source.yFoldBotArc,yBot:source.yBot
      }
    };
  }

  let master=null;
  function open(){
    const cfg=typeof global.getCfgR002==='function'?global.getCfgR002():{W:425,D:335,H:103};
    const signature=[cfg.W,cfg.D,cfg.H].join(':');
    if(!master||master.signature!==signature){master?.destroy();master=global.R001_3D_MASTER.create(inputFor(cfg));}
    master.open();
    return master;
  }
  global.R002_3D_MASTER=Object.freeze({open});
  function attachTrigger(){
    const toolbar=document.querySelector('.toolbar')||document.body;
    if(document.getElementById('r002-3d-btn'))return;
    const button=document.createElement('button');button.id='r002-3d-btn';button.type='button';button.textContent='3D MOCKUP';button.style.display='none';button.onclick=open;toolbar.appendChild(button);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attachTrigger);else attachTrigger();
})(window);
