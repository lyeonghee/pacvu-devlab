(function(root){'use strict';
const layout=input=>root.R005_Layout.getLayout(input);
function features(l,exporting=false){
 const glue='<g id="layer-glue">'+l.glue.map(p=>`<path data-panel="${p.panelId}" d="${p.d}" fill="url(#r005-glue)"/>`).join('')+'</g>';
 const perf='<g id="layer-perforation" fill="none" stroke="#1d7005" stroke-width=".25">'+l.perforations.map(p=>`<path d="${p.d}"/>`).join('')+'</g>';
 return '<defs><pattern id="r005-glue" width="3" height="3" patternUnits="userSpaceOnUse"><rect width="3" height="3" fill="#ddd"/><path d="M0 3L3 0" stroke="#888" stroke-width=".3"/></pattern></defs>'+glue+perf;
}
function renderSVG(input,state){const l=layout(input);return root.PacVuSourceMailerCommon.renderSVG(l,state).replace('</g></svg>',features(l)+'</g></svg>');}
function buildExportSVG(input){const l=layout(input);return root.PacVuSourceMailerCommon.buildExportSVG(l).replace('</svg>',features(l,true)+'</svg>');}
function getContract(input){
 const l=layout(input),c=root.PacVuSourceMailerCommon.getContract(l);
 function addPath(id,d,closed){const p=root.T001_parseAbsolutePath(d);c.paths.push({id,partId:'sheet',closed,start:p.start,segments:p.segments.map((s,i)=>s.type==='C'?{id:'s'+i,type:'cubic',to:s.to,control1:s.c1,control2:s.c2}:{id:'s'+i,type:'line',to:s.to})});return id;}
 l.perforations.forEach(p=>{const ps=root.T001_flattenPathD(p.d),length=ps.slice(1).reduce((s,v,i)=>s+Math.hypot(v.x-ps[i].x,v.y-ps[i].y),0);c.perforations.push({id:p.id,partId:'sheet',pathId:addPath(p.id+'.path',p.d,false),panelIds:[p.panelId],pattern:{cutMm:length,tieMm:5.079*25.4/72}});});
 l.glue.forEach((p,i)=>c.glues.push({id:p.id,from:{panelId:p.panelId,side:'inside'},to:{panelId:i?'bottom-back':'top-back',side:'outside'},joint:'lap',regions:{from:{kind:'path',pathId:addPath(p.id+'.path',p.d,true)},to:{kind:'whole-face'}},adhesiveThicknessMm:null}));
 c.source.frontPanelId='base';c.source.insideGluePanelIds=['top-base','bottom-base'];return c;
}
function buildDXF(input){
 const l=layout(input),rows=root.PacVuDXFR12.createRows(['CUT','FOLD','BLEED','PERFORATION','GLUE']);
 const add=(d,layer)=>{const ps=root.T001_flattenPathD(d);for(let i=1;i<ps.length;i++)rows.push('0','LINE','8',layer,'10',String(ps[i-1].x),'20',String(-ps[i-1].y),'30','0','11',String(ps[i].x),'21',String(-ps[i].y),'31','0');};
 l.cut.forEach(p=>add(p.d,'CUT'));l.fold.forEach(f=>add(`M ${f.a.x} ${f.a.y} L ${f.b.x} ${f.b.y}`,'FOLD'));l.bleed.forEach(d=>add(d,'BLEED'));l.perforations.forEach(p=>add(p.d,'PERFORATION'));l.glue.forEach(p=>add(p.d,'GLUE'));
 return root.PacVuDXFR12.finish(rows);
}
root.R005_Renderer=Object.freeze({renderSVG,buildExportSVG});
root.PacVuR005=Object.freeze({id:'R005',spec:root.R005_SPEC,normalize:root.R005_Layout.normalize,getLayout:layout,getContract,renderSVG,buildExportSVG,buildDXF});
})(window);
