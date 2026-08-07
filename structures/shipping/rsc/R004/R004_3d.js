(function(global){
  'use strict';
  if(!global.R004_getLayout||!global.R001_3D_MASTER)return;

  const SOURCE_OUTLINE='M504.074,558.311 L605.467,558.311 L605.467,246.5 L3440.117,246.5 L3440.117,1408.705 L605.467,1408.705 L605.467,1096.662 L504.074,1096.662 Z';

  function mappedOutline(source){
    return SOURCE_OUTLINE.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g,function(match,x,y){
      return source.mapX(Number(x)).toFixed(4)+','+source.mapY(Number(y)).toFixed(4);
    });
  }

  function inputFor(cfg){
    const layout=global.R004_getLayout(cfg.W,cfg.D,cfg.H,cfg);
    const source=layout.spec;
    const handleWidth=Math.min(Number(cfg.handleHoleWidth)||source.handle.width,Math.max(10,cfg.D-20));
    const handleHeight=Math.min(Number(cfg.handleHoleHeight)||source.handle.height,Math.max(8,cfg.H-20));
    const handleRadius=Math.min(source.handle.radius,handleWidth/2,handleHeight/2);
    const holes=cfg.handleHoleEnabled===false?{}:{
      sideL:[{cx:layout.panelBoxes.sideL.cx,cy:layout.panelBoxes.sideL.cy,width:handleWidth,height:handleHeight,radius:handleRadius}],
      sideR:[{cx:layout.panelBoxes.sideR.cx,cy:layout.panelBoxes.sideR.cy,width:handleWidth,height:handleHeight,radius:handleRadius}]
    };
    return {
      W:cfg.W,D:cfg.D,H:cfg.H,__code:'R004',__layout:layout,__outerPath:mappedOutline(source),__panelHoles:holes,
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
    const cfg=typeof global.getCfgR004==='function'?global.getCfgR004():{W:280,D:220,H:190};
    const signature=[cfg.W,cfg.D,cfg.H,cfg.handleHoleWidth,cfg.handleHoleHeight,cfg.handleHoleEnabled].join(':');
    if(!master||master.signature!==signature){master?.destroy();master=global.R001_3D_MASTER.create(inputFor(cfg));master.signature=signature;}
    master.open(); return master;
  }
  global.R004_3D_MASTER=Object.freeze({open});
  function attachTrigger(){
    const toolbar=document.querySelector('.toolbar')||document.body;
    if(document.getElementById('r004-3d-btn'))return;
    const button=document.createElement('button');button.id='r004-3d-btn';button.type='button';button.textContent='3D MOCKUP';button.style.display='none';button.onclick=open;toolbar.appendChild(button);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attachTrigger);else attachTrigger();
})(window);
