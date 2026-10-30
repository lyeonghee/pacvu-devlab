(function(root){'use strict';const layout=input=>root.M005_Layout.getLayout(input);
root.M005_Renderer=Object.freeze({renderSVG:(input,state)=>root.PacVuSourceMailerCommon.renderSVG(layout(input),state),buildExportSVG:input=>root.PacVuSourceMailerCommon.buildExportSVG(layout(input))});
root.PacVuM005=Object.freeze({id:'M005',spec:root.M005_SPEC,normalize:root.M005_Layout.normalize,getLayout:layout,getContract:input=>root.PacVuSourceMailerCommon.getContract(layout(input)),...root.M005_Renderer});
})(typeof window!=='undefined'?window:globalThis);
