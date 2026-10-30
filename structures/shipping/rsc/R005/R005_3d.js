/* Reuse the common source geometry, PhysicalPaper, White Studio and Viewer. */
(function(root){'use strict';
const engine=root.PacVuSourceMailer3D.create(root.PacVuR005,{anchoredPanels:['base','back','sideL','sideR'],layerConstraints:[{outer:'sideR',inner:'glue',interiorSign:1}],layerOrder:['back','sideL','sideR','glue','top-sideL','top-sideR','bottom-sideL','bottom-sideR','top-back','bottom-back','top-base','bottom-base','base']});
let annotations=[];
let restoreOriginal=null;
root.PacVuR0053D=Object.freeze({
 open(input){for(const object of annotations){object.geometry.dispose();object.material.dispose();}annotations=[];
  const current=engine.open(input),T=root.THREE;
  const pose=current.pose,glue=current.panels.get('glue');
  current.pose=t=>{pose(t);let v=Math.max(0,Math.min(1,t/.07));v=v*v*(3-2*v);glue.position.z=.19*v;current.model.updateMatrixWorld(true);};
  // Original also needs the internal lap; PhysicalPaper seats it by actual thickness.
  const original=document.querySelector('#r0053dModal [data-mailer-action="original"]');
  if(restoreOriginal)original.removeEventListener('click',restoreOriginal);
  restoreOriginal=()=>current.pose(Number(document.querySelector('#r0053dModal .m001-3d-controls input').value)/100);
  original.addEventListener('click',restoreOriginal);
  for(const mesh of current.panels.values())mesh.material[2].color.copy(mesh.material[0].color);
  // Glue is on the positive-Z (inside) source face, never painted on the exterior.
  for(const p of current.layout.glue){const ps=root.T001_flattenPathD(p.d),shape=new T.Shape(ps.map(v=>new T.Vector2(v.x,-v.y))),mesh=new T.Mesh(new T.ShapeGeometry(shape),new T.MeshBasicMaterial({color:0xc9c9c9,side:T.FrontSide,polygonOffset:true,polygonOffsetFactor:-2}));mesh.position.z=.095;mesh.userData.pacvuBrand=true;mesh.userData.sourceFace=1;current.panels.get(p.panelId).add(mesh);annotations.push(mesh);}
  for(const p of current.layout.perforations){const ps=root.T001_flattenPathD(p.d);for(const sign of [-1,1]){const g=new T.BufferGeometry().setFromPoints(ps.map(v=>new T.Vector3(v.x,-v.y,0))),line=new T.Line(g,new T.LineBasicMaterial({color:0x9a9a9a}));line.position.z=sign*.095;line.userData.sourceFace=sign;current.panels.get(p.panelId).add(line);annotations.push(line);}}
  for(const panel of current.panels.values())panel.onBeforeRender=()=>{if(!panel.children.length)return;panel.geometry.computeBoundingBox();const b=panel.geometry.boundingBox;for(const child of panel.children)if(child.userData.sourceFace)child.position.z=child.userData.sourceFace>0?b.max.z+.005:b.min.z-.005;};
  return current;
 },close:engine.close,get current(){return engine.current;}
});
})(window);
