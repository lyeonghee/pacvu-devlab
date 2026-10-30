/* The template supplies layout; shared services own styling and Contract output. */
(function(root){'use strict';
const layout=input=>root.M004_Layout.getLayout(input);
root.M004_Renderer=Object.freeze({renderSVG:(input,state)=>root.PacVuSourceMailerCommon.renderSVG(layout(input),state),buildExportSVG:input=>root.PacVuSourceMailerCommon.buildExportSVG(layout(input))});
root.PacVuM004=Object.freeze({id:'M004',spec:root.M004_SPEC,normalize:root.M004_Layout.normalize,getLayout:layout,getContract:input=>root.PacVuSourceMailerCommon.getContract(layout(input)),...root.M004_Renderer});
})(typeof window!=='undefined'?window:globalThis);
