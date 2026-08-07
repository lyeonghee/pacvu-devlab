(function(global){
  'use strict';
  if(!global.R003_getLayout||!global.R001_3D_MASTER)return;

  const SOURCE_OUTLINE='M745.897,499.971 L847.290,499.971 L847.290,173.971 L4135.445,173.971 L4135.445,1449.815 L847.290,1449.815 L847.290,1123.563 L745.897,1123.563 Z';

  function mappedOutline(source){
    return SOURCE_OUTLINE.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g,function(match,x,y){
      return source.mapX(Number(x)).toFixed(4)+','+source.mapY(Number(y)).toFixed(4);
    });
  }

  function inputFor(cfg){
    const layout=global.R003_getLayout(cfg.W,cfg.D,cfg.H);
    const source=layout.spec;
    return {
      W:cfg.W,D:cfg.D,H:cfg.H,__code:'R003',__layout:layout,__outerPath:mappedOutline(source),
      __spec:{
        xGlueL:source.mapX(source.base.sourceGlueL),xFrontL:source.xFrontL,xFrontR:source.xFrontR,
        xSideLR:source.xSideLR,xBackR:source.xBackR,xSideRR:source.xSideRR,
        yTop:source.yTop,yFoldTop:source.yFoldTop,yFoldTop_arc:source.yFoldTop,
        yFoldBot:source.yFoldBot,yFoldBot_arc:source.yFoldBot,yBot:source.yBot
      }
    };
  }

  let master=null;
  function open(){
    const cfg=typeof global.getCfgR003==='function'?global.getCfgR003():{W:350,D:230,H:220};
    const signature=[cfg.W,cfg.D,cfg.H].join(':');
    if(!master||master.signature!==signature){master?.destroy();master=global.R001_3D_MASTER.create(inputFor(cfg));}
    master.open();
    return master;
  }
  global.R003_3D_MASTER=Object.freeze({open});
  function attachTrigger(){
    const toolbar=document.querySelector('.toolbar')||document.body;
    if(document.getElementById('r003-3d-btn'))return;
    const button=document.createElement('button');button.id='r003-3d-btn';button.type='button';button.textContent='3D MOCKUP';button.style.display='none';button.onclick=open;toolbar.appendChild(button);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attachTrigger);else attachTrigger();
})(window);
