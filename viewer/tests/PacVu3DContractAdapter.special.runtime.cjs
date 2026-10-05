'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const files=['structures/tuck/T001/T001_spec.js','structures/tuck/T001/T001_layout.js',
  ...['spec','layout','3d'].map(s=>'structures/tuck/T006/T006_'+s+'.js'),
  ...['source','spec','layout','3d'].map(s=>'structures/tuck/T010/T010_'+s+'.js'),
  ...['spec','layout'].map(s=>'structures/gable/GA001/GA001_'+s+'.js'),
  'structures/sleeve_slide/S001/S001_spec.js',
  ...['profiles','cut_paths','instances','placement','fit_scenarios'].map(s=>'structures/sleeve_slide/S001/product_fit/S001_product_'+s+'.js'),
  'structures/sleeve_slide/S001/S001_layout.js'];
function loadRuntime(){
  const {svgPathProperties}=require(process.env.PACVU_SVG_PATH_PROPERTIES||'svg-path-properties');
  const node=()=>{let p;return {style:{},append(){},appendChild(){},remove(){},setAttribute(k,d){if(k==='d')p=new svgPathProperties(d);},getTotalLength(){return p.getTotalLength();},getPointAtLength(t){return p.getPointAtLength(t);}};};
  const document={readyState:'loading',addEventListener(){},getElementById(){return null;},createElementNS:node,body:{append(){},appendChild(){}}};
  const r=vm.createContext({console,document,navigator:{userAgent:'node-contract-test'}});r.window=r;
  vm.runInContext(fs.readFileSync(process.env.PACVU_CLIPPER_PATH||require.resolve('clipper-lib'),'utf8'),r);
  files.forEach(file=>vm.runInContext(read(file),r,{filename:file}));return r;
}
function functionText(src,name){const start=src.indexOf('  function '+name+'('),end=src.indexOf('\n  function ',start+1);if(start<0||end<0)throw new Error('Missing original function '+name);return src.slice(start,end);}
function originalSleeve(r,layout,key){
  const file='structures/sleeve_slide/S001/S001_'+({outerSleeve:'3d',innerTray:'inner_3d',insertPad:'insert_3d'}[key])+'.js',src=read(file),part=layout.rawParts[key];
  const ctx=vm.createContext({global:r,document:r.document,part,s:part.spec,spec:part.spec,UNIT_TO_MM:.3527778112205911,U:.3527778112205911,TOLERANCE_MM:.05,TOL:.05,clamp:(v,a,b)=>Math.max(a,Math.min(b,v))});
  let body,functions;
  if(key==='outerSleeve'){functions=functionText(src,'flattenPath')+functionText(src,'clip');body=src.slice(src.indexOf('    const spec = part.spec;'),src.indexOf('    const center =',src.indexOf('    const spec = part.spec;')));}
  else if(key==='innerTray'){functions=functionText(src,'flatten')+functionText(src,'clip');body=src.slice(src.indexOf('    const piecewise='),src.indexOf('    const center=',src.indexOf('    const piecewise=')));}
  else{functions=functionText(src,'flatten')+functionText(src,'clip');body=src.slice(src.indexOf('    const pw='),src.indexOf(',productCutElements=',src.indexOf('    const pw=')))+';';}
  vm.runInContext(functions+body+'\n globalThis.result={contours,mp};',ctx);
  const axes=[];ctx.sheet=key==='outerSleeve'?'front':key==='innerTray'?'base':'center';ctx.attach=(parent,name,a,b)=>{if(key==='insertPad'){b=a;a=name;name=parent;parent='center';}axes.push({parent,child:name,a,b});return name;};
  const start=key==='outerSleeve'?src.indexOf('    const leftSide = attach'):key==='innerTray'?src.indexOf('    const l1=attach'):src.indexOf("    attach('top'");
  const end=src.indexOf('    function pose',start);vm.runInContext(src.slice(start,end),ctx);
  return {...ctx.result,axes};
}
module.exports={loadRuntime,read,files,originalSleeve};
