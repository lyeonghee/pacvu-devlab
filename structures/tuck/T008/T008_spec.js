// T008_spec.js - T008 source-SVG geometry contract
const T008_EXPORT_META=Object.freeze({code:'T008',name:'Rabbit Ear Auto-Lock Tuck Box',subtitle:'Production-ready dieline information',material:'TBD',dimensionBasis:'Internal / External / Manufacturing',options:Object.freeze(['Bleed 3 mm','Glue flap']),status:'2D + 3D MASTER'});
function T008_getSpec(input){
  const W=Number(input&&input.W)||80,D=Number(input&&input.D)||52,H=Number(input&&input.H)||216;
  const upperTuckRule=globalThis.PacVuUpperTuckRule.resolve('T008',D);
  return {W,D,H,upperTuckRule,base:Object.freeze({W:80,D:52,H:216,unitToMm:25.4/72,sourceBounds:Object.freeze({minX:236.444,minY:225.677,maxX:1037.231,maxY:1161.111})}),rules:Object.freeze({generationOrder:Object.freeze(['cutPath','foldLine','bleedPath']),glueWidth:20,bottomLockBend:D*(26/52),bleedOffset:3,structureOptions:Object.freeze([])}),exportMeta:T008_EXPORT_META};
}
if(window.PacVuExportHeader)window.PacVuExportHeader.register('T008',context=>{const spec=T008_getSpec(context.cfg||{}),layout=typeof T008_getLayout==='function'?T008_getLayout(spec.W,spec.D,spec.H):null;return{name:spec.exportMeta.name,subtitle:spec.exportMeta.subtitle,material:spec.exportMeta.material,dimensionBasis:spec.exportMeta.dimensionBasis,dielineSize:layout&&layout.dielineBounds,bleedSize:layout&&layout.bleedBounds,options:spec.exportMeta.options.slice(),status:spec.exportMeta.status};});

