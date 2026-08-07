// ============================================================
// B001_layout.js - SVG-extracted B001 Bakery Box layout data
// Base source: B001_160x110x80_cleaned_no_images.svg
// ============================================================

const B001_CUT_ELEMENTS = ["\u003cline x1=\"1828.218\" y1=\"900.044\" x2=\"1828.218\" y2=\"728.115\" fill=\"none\" stroke=\"#e63725\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e","\u003cline x1=\"1822.881\" y1=\"674.365\" x2=\"1828.218\" y2=\"728.115\" fill=\"none\" stroke=\"#e63725\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e","\u003cpolyline points=\"297.093 899.259 254.573 899.259 254.573 749.144 297.093 727.228\" fill=\"none\" stroke=\"#e63725\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e","\u003cpolyline points=\"749.478 899.884 825.169 1056.747 911.962 1056.599 1062.504 899.413\" fill=\"none\" stroke=\"#e63725\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e","\u003cpath d=\"M757.096,673.25s36.62-438.855,150.616-435.12\" fill=\"none\" stroke=\"#e63725\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e","\u003cpath d=\"M1056.726,673.562s-35.019-439.166-149.015-435.431\" fill=\"none\" stroke=\"#e63725\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e","\u003cline x1=\"1056.282\" y1=\"672.006\" x2=\"1062.06\" y2=\"727.562\" fill=\"none\" stroke=\"#e63725\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e","\u003cpath d=\"M750.076,727.759\" fill=\"none\" stroke=\"#e63725\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e","\u003cpath d=\"M593.793,510.961c0-28.51-30.052-51.622-67.124-51.622s-67.124,23.112-67.124,51.622\" fill=\"none\" stroke=\"#e63725\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e","\u003cline x1=\"458.999\" y1=\"512.18\" x2=\"594.164\" y2=\"512.18\" fill=\"none\" stroke=\"#e63725\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e","\u003cpath d=\"M757.171,671.487l-8.136,56c-8.309-175.812-109.007-215.556-109.007-215.556l.097.006-8.721-1.239,10.572-5.104c.506-2.735.965-5.883.965-8.701l-.005.145c0-40.54-50.367-81.156-116.716-81.156s-123.555,40.616-123.555,81.156c0,2.818.26,5.598.766,8.334l10.196,5.622-8.346.72s-100.383,39.417-108.691,215.229\" fill=\"none\" stroke=\"#e63725\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e","\u003cpolyline points=\"749.279 899.638 730.613 925.416 745.434 943.375 738.613 1092.169 681.113 1091.874 636.835 1056.527 505.478 1055.638 505.478 1070.995 463.057 1092.353 323.536 1092.353 296.835 898.527\" fill=\"none\" stroke=\"#e63725\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e","\u003cpolyline points=\"1515.239 900.512 1590.93 1057.375 1677.723 1057.227 1828.265 900.041\" fill=\"none\" stroke=\"#e63725\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e","\u003cpath d=\"M1515.836,728.387\" fill=\"none\" stroke=\"#e63725\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e","\u003cpolyline points=\"1514.844 900.967 1496.177 926.745 1510.998 944.703 1504.177 1093.498 1446.677 1093.203 1402.399 1057.856 1271.042 1056.967 1271.042 1072.324 1228.621 1093.681 1089.1 1093.681 1062.399 899.855\" fill=\"none\" stroke=\"#e63725\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e","\u003crect x=\"784.626\" y=\"385.662\" width=\"246.963\" height=\"15.567\" rx=\"4\" ry=\"4\" transform=\"translate(514.662 1301.552) rotate(-90)\" fill=\"none\" stroke=\"#e63725\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e","\u003cpath d=\"M1523.25,674.053s36.62-438.855,150.616-435.12\" fill=\"none\" stroke=\"#e63725\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e","\u003cpath d=\"M1822.881,674.365s-35.019-439.166-149.015-435.431\" fill=\"none\" stroke=\"#e63725\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e","\u003crect x=\"1550.78\" y=\"386.465\" width=\"246.963\" height=\"15.567\" rx=\"4\" ry=\"4\" transform=\"translate(1280.013 2068.51) rotate(-90)\" fill=\"none\" stroke=\"#e63725\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e","\u003cpath d=\"M1359.948,513.089c0-28.51-30.052-51.622-67.124-51.622s-67.124,23.112-67.124,51.622\" fill=\"none\" stroke=\"#e63725\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e","\u003cline x1=\"1225.154\" y1=\"514.308\" x2=\"1360.319\" y2=\"514.308\" fill=\"none\" stroke=\"#e63725\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e","\u003cpath d=\"M1523.326,673.615l-8.136,56c-8.309-175.812-109.007-215.556-109.007-215.556l.097.006-8.721-1.239,10.572-5.104c.506-2.735.965-5.883.965-8.701l-.005.145c0-40.54-50.367-81.156-116.716-81.156s-123.555,40.616-123.555,81.156c0,2.818.26,5.598.766,8.334l10.196,5.622-8.346.72s-100.383,39.417-108.691,215.229\" fill=\"none\" stroke=\"#e63725\" stroke-miterlimit=\"2.613\" stroke-width=\"2\"/\u003e"];
const B001_FOLD_ELEMENTS = ["\u003cline x1=\"296.959\" y1=\"726.995\" x2=\"296.959\" y2=\"898.947\" fill=\"none\" stroke=\"#3c4c9e\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\"/\u003e","\u003cline x1=\"730.812\" y1=\"925.662\" x2=\"637.478\" y2=\"1058.551\" fill=\"none\" stroke=\"#3c4c9e\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\"/\u003e","\u003cline x1=\"743.837\" y1=\"672.303\" x2=\"302.812\" y2=\"672.303\" fill=\"none\" stroke=\"#3c4c9e\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\"/\u003e","\u003cline x1=\"1053.415\" y1=\"672.413\" x2=\"757.171\" y2=\"672.413\" fill=\"none\" stroke=\"#3c4c9e\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\"/\u003e","\u003cline x1=\"749.165\" y1=\"899.049\" x2=\"749.165\" y2=\"726.376\" fill=\"none\" stroke=\"#3c4c9e\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\"/\u003e","\u003cline x1=\"1062.458\" y1=\"899.416\" x2=\"1062.458\" y2=\"727.488\" fill=\"none\" stroke=\"#3c4c9e\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\"/\u003e","\u003cline x1=\"296.455\" y1=\"899.217\" x2=\"749.999\" y2=\"899.217\" fill=\"none\" stroke=\"#3c4c9e\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\"/\u003e","\u003cline x1=\"748.929\" y1=\"899.217\" x2=\"1061.923\" y2=\"899.217\" fill=\"none\" stroke=\"#3c4c9e\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\"/\u003e","\u003cline x1=\"1496.572\" y1=\"926.29\" x2=\"1403.239\" y2=\"1059.179\" fill=\"none\" stroke=\"#3c4c9e\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\"/\u003e","\u003cline x1=\"1509.598\" y1=\"672.931\" x2=\"1068.572\" y2=\"672.931\" fill=\"none\" stroke=\"#3c4c9e\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\"/\u003e","\u003cline x1=\"1819.176\" y1=\"673.041\" x2=\"1523.326\" y2=\"673.041\" fill=\"none\" stroke=\"#3c4c9e\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\"/\u003e","\u003cline x1=\"1514.926\" y1=\"899.677\" x2=\"1514.926\" y2=\"727.004\" fill=\"none\" stroke=\"#3c4c9e\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\"/\u003e","\u003cline x1=\"1062.216\" y1=\"899.845\" x2=\"1515.759\" y2=\"899.845\" fill=\"none\" stroke=\"#3c4c9e\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\"/\u003e","\u003cline x1=\"1514.69\" y1=\"899.845\" x2=\"1827.683\" y2=\"899.845\" fill=\"none\" stroke=\"#3c4c9e\" stroke-dasharray=\"3\" stroke-miterlimit=\"10\"/\u003e"];
const B001_BLEED_ELEMENTS = ["\u003cpath d=\"M1228.373,1101.409h-139.521c-4.248,0-7.845-3.135-8.425-7.344l-24.341-176.692-138.23,144.332c-1.601,1.672-3.813,2.618-6.127,2.622l-86.793.147h-.015c-3.264,0-6.24-1.868-7.659-4.809l-69.65-144.344-6.501,8.978,10.634,12.886c1.343,1.627,2.033,3.695,1.937,5.803l-6.821,148.794c-.208,4.542-3.952,8.114-8.494,8.114h-.045l-57.5-.295c-1.913-.01-3.767-.664-5.262-1.858l-41.975-33.509-119.851-.811v6.795c0,3.213-1.811,6.151-4.68,7.596l-42.421,21.357c-1.187.598-2.496.908-3.824.908h-139.521c-4.248,0-7.845-3.135-8.425-7.344l-26.7-193.826c-.052-.38-.078-.764-.079-1.148l-.246-171.582c0-.138.003-.275.01-.413,1.937-40.98,9.006-78.113,21.013-110.365,9.688-26.027,22.599-48.964,38.37-68.174,19.132-23.301,37.834-35.467,47.649-40.792-.021-.097-.041-.194-.06-.292-.602-3.256-.907-6.58-.907-9.88,0-46.925,62.943-89.66,132.059-89.66,33.011,0,64.352,9.591,88.248,27.007,23.327,17.002,36.778,39.631,36.971,62.162.005.114.007.229.007.346,0,2.869-.362,6.221-1.106,10.247-.021.115-.045.229-.07.343,9.855,5.37,28.573,17.589,47.719,40.897,15.817,19.257,28.764,42.23,38.479,68.282,5.345,14.334,9.714,29.626,13.089,45.785,2.882-29.736,12.621-120.48,31.786-209.941,13.729-64.083,29.567-115.103,47.077-151.641,22.665-47.3,48.848-71.266,77.839-71.266.578,0,1.153.01,1.733.029.742.023,1.46.144,2.144.346,27.973,1.376,53.276,25.301,75.272,71.201,17.509,36.539,33.348,87.559,47.077,151.642,18.087,84.427,27.778,169.993,31.233,204.349,3.128-13.623,6.979-26.595,11.547-38.863,9.688-26.026,22.599-48.964,38.37-68.173,19.13-23.3,37.833-35.466,47.649-40.792-.021-.098-.041-.194-.06-.292-.602-3.257-.907-6.58-.907-9.881,0-46.925,62.943-89.659,132.059-89.659,33.011,0,64.352,9.591,88.248,27.007,23.327,17.001,36.778,39.632,36.971,62.162.005.114.007.23.007.346,0,2.869-.362,6.221-1.106,10.248-.021.114-.045.229-.07.342,9.855,5.37,28.573,17.589,47.719,40.897,15.817,19.257,28.763,42.23,38.479,68.283,5.298,14.208,9.637,29.355,13,45.36,2.769-28.76,12.509-120.454,31.874-210.842,13.729-64.083,29.567-115.103,47.077-151.642,23.116-48.24,49.924-72.217,79.572-71.235.74.024,1.457.143,2.139.345,27.975,1.373,53.28,25.299,75.276,71.202,17.51,36.538,33.349,87.558,47.077,151.641,23.249,108.523,32.627,218.933,32.719,220.035.091,1.088.173,1.484.577,7.321l4.823,46.207c.17,1.737-.033-.258-.033.93v171.231c.202,2.379-.6,4.785-2.315,6.576l-150.542,157.187c-1.601,1.671-3.813,2.618-6.127,2.622l-86.793.147h-.015c-3.264,0-6.24-1.868-7.659-4.809l-69.525-144.087-6.822,9.422,10.634,12.885c1.343,1.627,2.033,3.695,1.937,5.803l-6.821,148.794c-.208,4.542-3.952,8.114-8.494,8.114h-.044l-57.5-.294c-1.914-.01-3.768-.664-5.263-1.858l-41.976-33.51-119.85-.811v6.796c0,3.213-1.811,6.15-4.68,7.596l-42.421,21.357c-1.187.597-2.496.908-3.824.908Z\" fill=\"none\" stroke=\"#3c4c9e\" stroke-miterlimit=\"10\"/\u003e"];
const B001_GUIDE_ELEMENTS = ["\u003ctext transform=\"translate(275.833 270.767)\" fill=\"#251d1e\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"46.485\" font-weight=\"600\" isolation=\"isolate\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003eB001 (160x110x80)\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(512.074 815.713) scale(.89 1)\" fill=\"#251d1e\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"24.387\" font-weight=\"600\" isolation=\"isolate\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e160\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(887.23 814.712) scale(.89 1)\" fill=\"#251d1e\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"24.387\" font-weight=\"600\" isolation=\"isolate\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e110\u003c/tspan\u003e\u003c/text\u003e","\u003cline x1=\"305.526\" y1=\"825.151\" x2=\"740.229\" y2=\"825.151\" fill=\"none\" stroke=\"#231916\" stroke-miterlimit=\"2.613\"/\u003e","\u003cpolygon points=\"296.826 825.151 309.085 829.216 306.176 825.151 309.085 821.086 296.826 825.151\" fill=\"#231916\"/\u003e","\u003cpolygon points=\"748.929 825.151 736.67 829.216 739.578 825.151 736.67 821.086 748.929 825.151\" fill=\"#231916\"/\u003e","\u003ctext transform=\"translate(653.499 796.025) scale(.89 1)\" fill=\"#251d1e\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"24.387\" font-weight=\"600\" isolation=\"isolate\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e80\u003c/tspan\u003e\u003c/text\u003e","\u003cline x1=\"646.446\" y1=\"679.067\" x2=\"646.446\" y2=\"892.984\" fill=\"none\" stroke=\"#231916\" stroke-miterlimit=\"2.613\"/\u003e","\u003cpolygon points=\"646.446 672.006 642.381 681.955 646.446 679.594 650.511 681.955 646.446 672.006\" fill=\"#231916\"/\u003e","\u003cpolygon points=\"646.446 900.044 642.381 890.095 646.446 892.456 650.511 890.095 646.446 900.044\" fill=\"#231916\"/\u003e","\u003cline x1=\"755.989\" y1=\"825.151\" x2=\"1054.862\" y2=\"825.151\" fill=\"none\" stroke=\"#231916\" stroke-miterlimit=\"2.613\"/\u003e","\u003cpolygon points=\"748.929 825.151 758.878 829.217 756.517 825.151 758.878 821.087 748.929 825.151\" fill=\"#231916\"/\u003e","\u003cpolygon points=\"1061.923 825.151 1051.973 829.217 1054.334 825.151 1051.973 821.087 1061.923 825.151\" fill=\"#231916\"/\u003e","\u003ctext transform=\"translate(461.48 963.466)\" fill=\"#251d1e\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"20.161\" font-weight=\"600\" isolation=\"isolate\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003ebottomLock-A\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1219.658 963.466)\" fill=\"#251d1e\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"20.161\" font-weight=\"600\" isolation=\"isolate\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003ebottomLock-B\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(824.438 963.467)\" fill=\"#251d1e\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"20.161\" font-weight=\"600\" isolation=\"isolate\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003ebottomLock(L)\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1593.6 963.466)\" fill=\"#251d1e\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"20.161\" font-weight=\"600\" isolation=\"isolate\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003ebottomLock(R)\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(505.099 610.881)\" fill=\"#251d1e\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"20.161\" font-weight=\"600\" isolation=\"isolate\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003elidLeft\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(853.705 607.628)\" fill=\"#251d1e\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"20.161\" font-weight=\"600\" isolation=\"isolate\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003elidSideFlap(L)\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1265.394 622.974)\" fill=\"#251d1e\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"20.161\" font-weight=\"600\" isolation=\"isolate\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003elidRight\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1621.999 619.722)\" fill=\"#251d1e\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"20.161\" font-weight=\"600\" isolation=\"isolate\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003elidSideFlap(R)\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(514.115 436.662)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\" isolation=\"isolate\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-1L\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(405.856 504.338)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\" isolation=\"isolate\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-2L\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(514.114 665.117)\" fill=\"#3c4c9e\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"18.61\" font-weight=\"600\" isolation=\"isolate\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003ef-1\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(305.526 799.594)\" fill=\"#3c4c9e\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"18.61\" font-weight=\"600\" isolation=\"isolate\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003ef-5\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(757.095 799.594)\" fill=\"#3c4c9e\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"18.61\" font-weight=\"600\" isolation=\"isolate\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003ef-6\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1073.938 808.582)\" fill=\"#3c4c9e\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"18.61\" font-weight=\"600\" isolation=\"isolate\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003ef-7\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1523.326 808.582)\" fill=\"#3c4c9e\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"18.61\" font-weight=\"600\" isolation=\"isolate\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003ef-8\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(515.619 925.662)\" fill=\"#3c4c9e\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"18.61\" font-weight=\"600\" isolation=\"isolate\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003ef-10\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(884.355 925.662)\" fill=\"#3c4c9e\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"18.61\" font-weight=\"600\" isolation=\"isolate\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003ef-11\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1279.06 925.662)\" fill=\"#3c4c9e\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"18.61\" font-weight=\"600\" isolation=\"isolate\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003ef-12\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1648.902 925.662)\" fill=\"#3c4c9e\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"18.61\" font-weight=\"600\" isolation=\"isolate\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003ef-13\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(684.145 1009.58)\" fill=\"#3c4c9e\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"18.61\" font-weight=\"600\" isolation=\"isolate\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003ef-14\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1454.742 1009.58)\" fill=\"#3c4c9e\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"18.61\" font-weight=\"600\" isolation=\"isolate\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003ef-15\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(905.293 665.307)\" fill=\"#3c4c9e\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"18.61\" font-weight=\"600\" isolation=\"isolate\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003ef-2\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1289.085 668.415)\" fill=\"#3c4c9e\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"18.61\" font-weight=\"600\" isolation=\"isolate\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003ef-3\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1669.534 668.619)\" fill=\"#3c4c9e\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"18.61\" font-weight=\"600\" isolation=\"isolate\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003ef-4\u003c/tspan\u003e\u003c/text\u003e","\u003cline x1=\"283.854\" y1=\"731.164\" x2=\"194.323\" y2=\"731.164\" fill=\"none\" stroke=\"#3c4c9e\" stroke-miterlimit=\"10\" stroke-width=\".75\"/\u003e","\u003cpolygon points=\"287.837 731.164 282.224 726.436 283.556 731.164 282.224 735.891 287.837 731.164\" fill=\"#3c4c9e\"/\u003e","\u003ctext transform=\"translate(3.703 734.84)\" fill=\"#3c4c9e\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"18.61\" font-weight=\"600\" isolation=\"isolate\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003eBleed Line(-40.7,80.02)\u003c/tspan\u003e\u003c/text\u003e","\u003cline x1=\"298.491\" y1=\"670.673\" x2=\"148.841\" y2=\"623.779\" fill=\"none\" stroke=\"#3c4c9e\" stroke-dasharray=\"3 3\" stroke-miterlimit=\"10\" stroke-width=\".75\"/\u003e","\u003cpolygon points=\"305.149 672.759 297.18 665.307 297.993 670.517 294.353 674.331 305.149 672.759\" fill=\"#3c4c9e\"/\u003e","\u003ctext transform=\"translate(55.306 620.029)\" fill=\"#3c4c9e\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"18.61\" font-weight=\"600\" isolation=\"isolate\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003eFold Line(-34.6,59.41)\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(101.922 509.066)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"18.61\" font-weight=\"600\" isolation=\"isolate\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003eCutPath(0,0)\u003c/tspan\u003e\u003c/text\u003e","\u003cline x1=\"395.005\" y1=\"504.338\" x2=\"205.413\" y2=\"504.338\" fill=\"none\" stroke=\"#e63725\" stroke-miterlimit=\"2.613\" stroke-width=\".75\"/\u003e","\u003cpolygon points=\"403.217 504.338 391.645 499.61 394.391 504.338 391.645 509.065 403.217 504.338\" fill=\"#e63725\"/\u003e","\u003ctext transform=\"translate(405.565 524.086)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-3L\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(325.277 622.281)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-4L\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(258.313 760.13)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-5L\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(256.187 829.216)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-6L\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(255.835 894.948)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-7L\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(314.626 1007.582)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-8L\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(382.483 1088.353)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-9L\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(446.527 1080.476)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-10L\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(460.772 1064.82)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-11L\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(552.196 1051.612)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-12L\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(656.701 1073.569)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-13L\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(687.491 1088.506)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-14L\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(700.792 1032.48)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-15L\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(699.238 946.61)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-16L\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(695.005 915.531)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-17L\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(792.386 982.776)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-18L\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(849.242 1051.612)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-19L\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(956.619 965.846)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-20L\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1038.492 749.346)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-21L\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(890.759 253.892)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-22L\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(733.308 742.133)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-23L\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(672.704 608.66)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-24L\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(600.186 524.262)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-25L\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(601.69 504.338)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-26L\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(506.43 477.227)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-27L\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(507.933 508.047)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-28L\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(890.773 533.445)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-29L\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(889.255 267.953)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-30L\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(858.694 406.838)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-31L\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(921.21 407.014)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-32L\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1271.394 477.003)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-27R\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1272.898 507.824)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-28R\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1655.738 533.222)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-29R\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1654.219 267.729)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-30R\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1623.658 406.614)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-31R\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1686.174 406.79)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-32R\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1280.659 437.396)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\" isolation=\"isolate\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-1R\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1172.4 505.072)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\" isolation=\"isolate\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-2R\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1172.109 524.82)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-3R\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1091.821 623.014)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-4R\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1081.171 1008.315)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-8R\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1149.027 1089.086)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-9R\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1213.072 1081.21)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-10R\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1227.316 1065.554)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-11R\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1318.741 1052.345)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-12R\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1423.245 1074.302)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-13R\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1454.035 1089.24)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-14R\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1467.337 1033.214)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-15R\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1465.783 947.344)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-16R\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1461.549 916.265)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-17R\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1558.93 983.51)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-18R\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1615.786 1052.345)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-19R\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1723.164 966.579)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-20R\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1785.679 736.353)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-21R\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1652.329 234.909)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-22R\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1499.853 742.866)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-23R\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1439.249 609.393)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-24R\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1366.731 524.995)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-25R\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(1368.235 505.071)\" fill=\"#e63725\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"16\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003e1-26R\u003c/tspan\u003e\u003c/text\u003e","\u003ctext transform=\"translate(275.833 197.353)\" fill=\"#251d1e\" font-family=\"MyriadPro-Semibold, \u0026apos;Myriad Pro\u0026apos;\" font-size=\"46.485\" font-weight=\"600\"\u003e\u003ctspan x=\"0\" y=\"0\"\u003eBakery\u003c/tspan\u003e\u003c/text\u003e"];

const B001_SOURCE_ANCHORS = {
  xGlue: 254.573,
  x0: 296.959,
  x1: 749.165,
  x2: 1062.458,
  x3: 1514.926,
  x4: 1828.218,
  yTop: 672.303,
  yBottom: 899.217
};

function B001_layoutNum(value) {
  return +(+value).toFixed(4);
}

function B001_layoutAttr(el, name) {
  const re = new RegExp(name + '="([^"]*)"');
  const match = el.match(re);
  return match ? match[1] : '';
}

function B001_layoutTag(el) {
  const match = el.match(/^<([a-z]+)/i);
  return match ? match[1].toLowerCase() : '';
}

function B001_isPerforationSourceElement(el) {
  return el.includes('593.793,510.961') ||
    el.includes('458.999" y1="512.18') ||
    el.includes('784.626" y="385.662') ||
    el.includes('1550.78" y="386.465') ||
    el.includes('1359.948,513.089') ||
    el.includes('1225.154" y1="514.308');
}

function B001_isRemovedLidSideFold(el) {
  if (B001_layoutTag(el) !== 'line') return false;
  const y1 = Number(B001_layoutAttr(el, 'y1'));
  const y2 = Number(B001_layoutAttr(el, 'y2'));
  const x1 = Number(B001_layoutAttr(el, 'x1'));
  const x2 = Number(B001_layoutAttr(el, 'x2'));
  const isHorizontal = Math.abs(y1 - y2) < 1;
  const isLeftSideLid = x1 >= 757 && x2 <= 1054;
  const isRightSideLid = x1 >= 1523 && x2 <= 1820;
  return isHorizontal && (isLeftSideLid || isRightSideLid);
}

function B001_isRemovedLidSideFoldGuide(el) {
  return /<tspan[^>]*>f-(?:2|4)<\/tspan>/.test(el);
}

function B001_layoutBase(input) {
  const spec = B001_getSpec(input);
  const W = spec.W;
  const D = spec.D;
  const H = spec.H;
  const unit = spec.base.unitToMm;
  const a = B001_SOURCE_ANCHORS;
  const topExtent = (a.yTop - spec.base.sourceBounds.minY) * unit * (D / spec.base.D);
  const sourceH = a.yBottom - a.yTop;

  return {
    spec,
    W,
    D,
    H,
    unit,
    topExtent,
    targetX: [-15 * (D / spec.base.D), 0, W, W + D, (2 * W) + D, (2 * W) + (2 * D)],
    sourceX: [a.xGlue, a.x0, a.x1, a.x2, a.x3, a.x4],
    sourceYTop: a.yTop,
    sourceYBottom: a.yBottom,
    sourceH
  };
}

function B001_lerp(v, a, b, c, d) {
  if (Math.abs(b - a) < 0.0001) return c;
  return c + ((v - a) / (b - a)) * (d - c);
}

function B001_mapX(x, ctx) {
  const sx = ctx.sourceX;
  const tx = ctx.targetX;

  if (x <= sx[0]) return tx[0] + (x - sx[0]) * ctx.unit * (ctx.D / ctx.spec.base.D);
  for (let i = 0; i < sx.length - 1; i++) {
    if (x <= sx[i + 1]) return B001_lerp(x, sx[i], sx[i + 1], tx[i], tx[i + 1]);
  }
  return tx[tx.length - 1] + (x - sx[sx.length - 1]) * ctx.unit * (ctx.D / ctx.spec.base.D);
}

function B001_mapFixedHandleX(x, y, ctx) {
  if (y >= ctx.sourceYTop) return B001_mapX(x, ctx);

  const panels = [
    { sourceStart: ctx.sourceX[1], sourceEnd: ctx.sourceX[2], targetStart: 0 },
    { sourceStart: ctx.sourceX[3], sourceEnd: ctx.sourceX[4], targetStart: ctx.W + ctx.D }
  ];
  const panel = panels.find(item => x >= item.sourceStart && x <= item.sourceEnd);
  if (!panel) return B001_mapX(x, ctx);

  const sourceWidthMm = (panel.sourceEnd - panel.sourceStart) * ctx.unit;
  const localMm = (x - panel.sourceStart) * ctx.unit;
  const sourceCenter = sourceWidthMm / 2;
  // Preserve the complete handle crown. Only its left/right shoulders stretch.
  const fixedHalfWidth = Math.min(44, sourceCenter - 1);
  const targetCenter = ctx.W / 2;

  if (ctx.W <= fixedHalfWidth * 2) {
    return panel.targetStart + (localMm / sourceWidthMm) * ctx.W;
  }
  if (localMm < sourceCenter - fixedHalfWidth) {
    return panel.targetStart + B001_lerp(
      localMm,
      0,
      sourceCenter - fixedHalfWidth,
      0,
      targetCenter - fixedHalfWidth
    );
  }
  if (localMm > sourceCenter + fixedHalfWidth) {
    return panel.targetStart + B001_lerp(
      localMm,
      sourceCenter + fixedHalfWidth,
      sourceWidthMm,
      targetCenter + fixedHalfWidth,
      ctx.W
    );
  }
  return panel.targetStart + targetCenter + (localMm - sourceCenter);
}

function B001_mapY(y, ctx) {
  if (y < ctx.sourceYTop) {
    return ctx.topExtent - (ctx.sourceYTop - y) * ctx.unit * (ctx.D / ctx.spec.base.D);
  }
  if (y <= ctx.sourceYBottom) {
    return ctx.topExtent + ((y - ctx.sourceYTop) / ctx.sourceH) * ctx.H;
  }
  return ctx.topExtent + ctx.H + (y - ctx.sourceYBottom) * ctx.unit * (ctx.D / ctx.spec.base.D);
}

function B001_mapPoint(x, y, ctx) {
  return {
    x: B001_layoutNum(B001_mapFixedHandleX(Number(x), Number(y), ctx)),
    y: B001_layoutNum(B001_mapY(Number(y), ctx))
  };
}

function B001_pointString(p) {
  return B001_layoutNum(p.x) + ' ' + B001_layoutNum(p.y);
}

function B001_copyStyle(el) {
  return el
    .replace(/^<[a-z]+\b/i, '')
    .replace(/\s(?:x|y|x1|y1|x2|y2|width|height|rx|ry|points|d|transform)="[^"]*"/g, '')
    .replace(/\/>$/, '')
    .trim();
}

function B001_rectCorners(el) {
  const x = Number(B001_layoutAttr(el, 'x'));
  const y = Number(B001_layoutAttr(el, 'y'));
  const w = Number(B001_layoutAttr(el, 'width'));
  const h = Number(B001_layoutAttr(el, 'height'));
  const raw = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  const transform = B001_layoutAttr(el, 'transform');
  const match = transform.match(/translate\(([-\d.]+)\s+([-\d.]+)\)\s+rotate\((-?90)\)/);

  if (!match) return raw;

  const tx = Number(match[1]);
  const ty = Number(match[2]);
  const angle = Number(match[3]);
  return raw.map(([px, py]) => angle < 0
    ? [tx + py, ty - px]
    : [tx - py, ty + px]);
}

function B001_transformLine(el, ctx) {
  const p1 = B001_mapPoint(B001_layoutAttr(el, 'x1'), B001_layoutAttr(el, 'y1'), ctx);
  const p2 = B001_mapPoint(B001_layoutAttr(el, 'x2'), B001_layoutAttr(el, 'y2'), ctx);
  return '<line x1="' + p1.x + '" y1="' + p1.y + '" x2="' + p2.x + '" y2="' + p2.y + '" ' + B001_copyStyle(el) + '/>';
}

function B001_transformPolyline(el, ctx) {
  const nums = (B001_layoutAttr(el, 'points').match(/[-+]?\d*\.?\d+(?:e[-+]?\d+)?/gi) || []).map(Number);
  const points = [];
  for (let i = 0; i < nums.length - 1; i += 2) points.push(B001_pointString(B001_mapPoint(nums[i], nums[i + 1], ctx)));
  return '<polyline points="' + points.join(' ') + '" ' + B001_copyStyle(el) + '/>';
}

function B001_transformRect(el, ctx) {
  const mapped = B001_rectCorners(el).map(p => B001_mapPoint(p[0], p[1], ctx));
  const minX = Math.min(...mapped.map(p => p.x));
  const minY = Math.min(...mapped.map(p => p.y));
  const maxX = Math.max(...mapped.map(p => p.x));
  const maxY = Math.max(...mapped.map(p => p.y));
  const r = B001_layoutNum(Math.min(maxX - minX, maxY - minY) * 0.32);
  const d = [
    'M' + B001_layoutNum(minX + r) + ' ' + B001_layoutNum(minY),
    'L' + B001_layoutNum(maxX - r) + ' ' + B001_layoutNum(minY),
    'Q' + B001_layoutNum(maxX) + ' ' + B001_layoutNum(minY) + ' ' + B001_layoutNum(maxX) + ' ' + B001_layoutNum(minY + r),
    'L' + B001_layoutNum(maxX) + ' ' + B001_layoutNum(maxY - r),
    'Q' + B001_layoutNum(maxX) + ' ' + B001_layoutNum(maxY) + ' ' + B001_layoutNum(maxX - r) + ' ' + B001_layoutNum(maxY),
    'L' + B001_layoutNum(minX + r) + ' ' + B001_layoutNum(maxY),
    'Q' + B001_layoutNum(minX) + ' ' + B001_layoutNum(maxY) + ' ' + B001_layoutNum(minX) + ' ' + B001_layoutNum(maxY - r),
    'L' + B001_layoutNum(minX) + ' ' + B001_layoutNum(minY + r),
    'Q' + B001_layoutNum(minX) + ' ' + B001_layoutNum(minY) + ' ' + B001_layoutNum(minX + r) + ' ' + B001_layoutNum(minY),
    'Z'
  ].join(' ');
  return '<path d="' + d + '" ' + B001_copyStyle(el) + '/>';
}

function B001_transformPathData(d, ctx) {
  const tokens = d.match(/[a-zA-Z]|[-+]?\d*\.?\d+(?:e[-+]?\d+)?/g) || [];
  const out = [];
  let i = 0;
  let cmd = '';
  let x = 0;
  let y = 0;
  let sx = 0;
  let sy = 0;
  const isCmd = value => /^[a-zA-Z]$/.test(value);
  const n = () => Number(tokens[i++]);
  const point = (px, py) => B001_pointString(B001_mapPoint(px, py, ctx));
  const readPoint = (relative) => {
    const px = (relative ? x : 0) + n();
    const py = (relative ? y : 0) + n();
    x = px;
    y = py;
    return point(px, py);
  };

  while (i < tokens.length) {
    if (isCmd(tokens[i])) cmd = tokens[i++];
    const relative = cmd === cmd.toLowerCase();
    const upper = cmd.toUpperCase();

    if (upper === 'M') {
      const px = (relative ? x : 0) + n();
      const py = (relative ? y : 0) + n();
      x = px;
      y = py;
      sx = x;
      sy = y;
      out.push('M' + point(x, y));
      cmd = relative ? 'l' : 'L';
    } else if (upper === 'L') {
      out.push('L' + readPoint(relative));
    } else if (upper === 'H') {
      x = (relative ? x : 0) + n();
      out.push('L' + point(x, y));
    } else if (upper === 'V') {
      y = (relative ? y : 0) + n();
      out.push('L' + point(x, y));
    } else if (upper === 'C') {
      const c1x = (relative ? x : 0) + n();
      const c1y = (relative ? y : 0) + n();
      const c2x = (relative ? x : 0) + n();
      const c2y = (relative ? y : 0) + n();
      const px = (relative ? x : 0) + n();
      const py = (relative ? y : 0) + n();
      out.push('C' + point(c1x, c1y) + ' ' + point(c2x, c2y) + ' ' + point(px, py));
      x = px;
      y = py;
    } else if (upper === 'S' || upper === 'Q') {
      const c1x = (relative ? x : 0) + n();
      const c1y = (relative ? y : 0) + n();
      const px = (relative ? x : 0) + n();
      const py = (relative ? y : 0) + n();
      out.push(upper + point(c1x, c1y) + ' ' + point(px, py));
      x = px;
      y = py;
    } else if (upper === 'T') {
      out.push('T' + readPoint(relative));
    } else if (upper === 'A') {
      const rx = n() * ctx.unit * (ctx.D / ctx.spec.base.D);
      const ry = n() * ctx.unit * (ctx.D / ctx.spec.base.D);
      const rot = n();
      const large = n();
      const sweep = n();
      const px = (relative ? x : 0) + n();
      const py = (relative ? y : 0) + n();
      out.push('A' + B001_layoutNum(rx) + ' ' + B001_layoutNum(ry) + ' ' + rot + ' ' + large + ' ' + sweep + ' ' + point(px, py));
      x = px;
      y = py;
    } else if (upper === 'Z') {
      x = sx;
      y = sy;
      out.push('Z');
    } else {
      break;
    }
  }

  return out.join(' ');
}

function B001_transformPath(el, ctx) {
  return '<path d="' + B001_transformPathData(B001_layoutAttr(el, 'd'), ctx) + '" ' + B001_copyStyle(el) + '/>';
}

function B001_transformText(el, ctx) {
  return el.replace(/translate\(([-\d.]+)\s+([-\d.]+)\)/g, (_, x, y) => {
    const p = B001_mapPoint(x, y, ctx);
    return 'translate(' + p.x + ' ' + p.y + ')';
  });
}

function B001_transformElement(el, ctx) {
  const tag = B001_layoutTag(el);
  if (tag === 'line') return B001_transformLine(el, ctx);
  if (tag === 'polyline') return B001_transformPolyline(el, ctx);
  if (tag === 'path') return B001_transformPath(el, ctx);
  if (tag === 'rect') return B001_transformRect(el, ctx);
  if (tag === 'text') return B001_transformText(el, ctx);
  return el;
}

function B001_collectElementPoints(el) {
  const tag = B001_layoutTag(el);
  const points = [];
  const add = (x, y) => {
    if (Number.isFinite(x) && Number.isFinite(y)) points.push({ x, y });
  };

  if (tag === 'line') {
    add(Number(B001_layoutAttr(el, 'x1')), Number(B001_layoutAttr(el, 'y1')));
    add(Number(B001_layoutAttr(el, 'x2')), Number(B001_layoutAttr(el, 'y2')));
  } else if (tag === 'polyline' || tag === 'polygon') {
    const nums = (B001_layoutAttr(el, 'points').match(/[-+]?\d*\.?\d+(?:e[-+]?\d+)?/gi) || []).map(Number);
    for (let i = 0; i < nums.length - 1; i += 2) add(nums[i], nums[i + 1]);
  } else if (tag === 'path') {
    const nums = (B001_layoutAttr(el, 'd').match(/[-+]?\d*\.?\d+(?:e[-+]?\d+)?/gi) || []).map(Number);
    for (let i = 0; i < nums.length - 1; i += 2) add(nums[i], nums[i + 1]);
  }

  return points;
}

function B001_getBoundsFromElements(groups) {
  const points = groups.flatMap(group => group.flatMap(B001_collectElementPoints));
  const minX = Math.min(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  const maxX = Math.max(...points.map(p => p.x));
  const maxY = Math.max(...points.map(p => p.y));
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY
  };
}

function B001_sampleCutElement(el) {
  const tag = B001_layoutTag(el);
  if (tag === 'line') {
    return [
      { x: Number(B001_layoutAttr(el, 'x1')), y: Number(B001_layoutAttr(el, 'y1')) },
      { x: Number(B001_layoutAttr(el, 'x2')), y: Number(B001_layoutAttr(el, 'y2')) }
    ];
  }
  if (tag === 'polyline') {
    const values = (B001_layoutAttr(el, 'points').match(/[-+]?\d*\.?\d+(?:e[-+]?\d+)?/gi) || []).map(Number);
    const points = [];
    for (let i = 0; i < values.length - 1; i += 2) points.push({ x: values[i], y: values[i + 1] });
    return points;
  }
  if (tag !== 'path' || typeof document === 'undefined') return [];
  const node = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  node.setAttribute('d', B001_layoutAttr(el, 'd'));
  const length = node.getTotalLength();
  if (!Number.isFinite(length) || length < 0.01) return [];
  const steps = Math.max(2, Math.ceil(length / 2));
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const point = node.getPointAtLength(length * i / steps);
    points.push({ x: point.x, y: point.y });
  }
  return points;
}

function B001_joinCutOutline(elements) {
  const segments = elements.map(B001_sampleCutElement).filter(points => points.length > 1);
  if (!segments.length) return [];
  let longest = 0;
  segments.forEach((points, index) => { if (points.length > segments[longest].length) longest = index; });
  let outline = segments.splice(longest, 1)[0].slice();
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  while (segments.length) {
    const start = outline[0];
    const end = outline[outline.length - 1];
    let best = { distance: Infinity, index: 0, mode: '' };
    segments.forEach((points, index) => {
      const first = points[0];
      const last = points[points.length - 1];
      [
        [distance(end, first), 'end-first'],
        [distance(end, last), 'end-last'],
        [distance(start, last), 'start-last'],
        [distance(start, first), 'start-first']
      ].forEach(option => {
        if (option[0] < best.distance) best = { distance: option[0], index, mode: option[1] };
      });
    });
    let next = segments.splice(best.index, 1)[0];
    if (best.mode === 'end-last' || best.mode === 'start-first') next.reverse();
    outline = best.mode.startsWith('end')
      ? outline.concat(next.slice(1))
      : next.slice(0, -1).concat(outline);
  }
  return outline;
}

function B001_outlinePath(points) {
  if (!points.length) return '';
  return points.map((point, index) =>
    (index ? 'L' : 'M') + B001_layoutNum(point.x) + ' ' + B001_layoutNum(point.y)
  ).join(' ') + ' Z';
}

function B001_buildRequiredHandleCuts(ctx) {
  // The two handle openings and two cross-lock slots are one functional set.
  // They are tooling dimensions, not decorative geometry: never scale them.
  const handleWidth = 47.683;
  const handleHeight = 18.711;
  const slotWidth = 5.492;
  const slotLength = 87.123;
  const depthPositionScale = ctx.D / ctx.spec.base.D;
  const bodyTop = ctx.topExtent;
  const handleBaseY = bodyTop - (56.488 * depthPositionScale);
  const slotCenterY = bodyTop - (98.199 * depthPositionScale);
  const handleCenters = [ctx.W / 2, ctx.W + ctx.D + (ctx.W / 2)];
  const slotCenters = [ctx.W + (ctx.D / 2), (2 * ctx.W) + ctx.D + (ctx.D / 2)];

  const handlePath = centerX => {
    const left = centerX - handleWidth / 2;
    const right = centerX + handleWidth / 2;
    const top = handleBaseY - handleHeight;
    const halfWidth = handleWidth / 2;
    const k = 0.55228475;
    return '<path d="M' + B001_layoutNum(left) + ' ' + B001_layoutNum(handleBaseY) +
      ' C' + B001_layoutNum(left) + ' ' + B001_layoutNum(handleBaseY - (k * handleHeight)) + ' ' +
      B001_layoutNum(centerX - (k * halfWidth)) + ' ' + B001_layoutNum(top) + ' ' +
      B001_layoutNum(centerX) + ' ' + B001_layoutNum(top) +
      ' C' + B001_layoutNum(centerX + (k * halfWidth)) + ' ' + B001_layoutNum(top) + ' ' +
      B001_layoutNum(right) + ' ' + B001_layoutNum(handleBaseY - (k * handleHeight)) + ' ' +
      B001_layoutNum(right) + ' ' + B001_layoutNum(handleBaseY) +
      ' L' + B001_layoutNum(left) + ' ' + B001_layoutNum(handleBaseY) +
      ' Z" fill="none" stroke="#e63725"/>';
  };

  const slotPath = centerX => {
    const x = centerX - slotWidth / 2;
    const y = slotCenterY - slotLength / 2;
    const radius = Math.min(slotWidth / 2, 2);
    return '<rect x="' + B001_layoutNum(x) + '" y="' + B001_layoutNum(y) +
      '" width="' + B001_layoutNum(slotWidth) + '" height="' + B001_layoutNum(slotLength) +
      '" rx="' + B001_layoutNum(radius) + '" ry="' + B001_layoutNum(radius) +
      '" fill="none" stroke="#e63725"/>';
  };

  return handleCenters.map(handlePath).concat(slotCenters.map(slotPath));
}

function B001_getLayout(W, D, H) {
  const ctx = B001_layoutBase({ W, D, H });
  const cutElements = B001_CUT_ELEMENTS
    .filter(el => !B001_isPerforationSourceElement(el))
    .map(el => B001_transformElement(el, ctx));
  const requiredCutElements = B001_buildRequiredHandleCuts(ctx);
  const perforationElements = [];
  // f-2/f-4 are not manufactured creases. Each lid-side flap stays one
  // continuous panel so it can bow smoothly into the handle lock.
  const foldElements = B001_FOLD_ELEMENTS
    .filter(el => !B001_isRemovedLidSideFold(el))
    .map(el => B001_transformElement(el, ctx));
  const guideElements = B001_GUIDE_ELEMENTS
    .filter(el => !B001_isRemovedLidSideFoldGuide(el))
    .map(el => B001_transformElement(el, ctx));
  const cutOutline = B001_joinCutOutline(cutElements);
  const fillPath = B001_outlinePath(cutOutline);
  const bleedOutline = cutOutline.length && typeof T001_offsetPolygonWithClipper === 'function'
    ? T001_offsetPolygonWithClipper(cutOutline, 3)
    : [];
  const bleedPath = B001_outlinePath(bleedOutline);
  const bleedElements = bleedPath
    ? ['<path d="' + bleedPath + '" fill="none" stroke="#0055ff"/>']
    : B001_BLEED_ELEMENTS.map(el => B001_transformElement(el, ctx));
  const bounds = B001_getBoundsFromElements([cutElements, requiredCutElements, foldElements, bleedElements]);

  return {
    spec: ctx.spec,
    cutElements,
    requiredCutElements,
    perforationElements,
    foldElements,
    bleedElements,
    fillPath,
    guideElements,
    bounds,
    transform: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
    anchors: {
      bodyTopY: ctx.topExtent,
      bodyBottomY: ctx.topExtent + ctx.H,
      panelsX: [0, ctx.W, ctx.W + ctx.D, (2 * ctx.W) + ctx.D, (2 * ctx.W) + (2 * ctx.D)]
    }
  };
}
