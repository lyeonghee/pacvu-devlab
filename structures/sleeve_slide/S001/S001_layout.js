// ============================================================
// S001_layout.js - S-Series template-mapped dieline engine
// Generated from S001_template.js production geometry.
// Runtime flow: Outer Sleeve -> Inner Tray -> Insert Pad.
// ============================================================

const S001_UNIT_TO_MM = 0.3527778112205911;
const S001_UNIT_PER_MM = 1 / S001_UNIT_TO_MM;
const S001_BLEED_OFFSET_MM = 3;
const S001_SOURCE_PARTS = {"outerSleeve":{"cut":[{"kind":"path","d":"M1776.675,1406.984c11.735,0,21.26-9.524,21.26-21.26"},{"kind":"path","d":"M1308.958,335.487c-.005-14.863-12.066-26.924-26.929-26.929"},{"kind":"path","d":"M502.502,308.558c-14.863.005-26.924,12.066-26.929,26.929"},{"kind":"path","d":"M1517.305,376.589c-14.863.005-26.923,12.067-26.929,26.929"},{"kind":"path","d":"M2329.431,403.519c-.006-14.863-12.066-26.924-26.929-26.929"},{"kind":"line","x1":475.572,"y1":439.66,"x2":475.572,"y2":335.487},{"kind":"line","x1":1479.953,"y1":499.535,"x2":1479.953,"y2":481.415},{"kind":"line","x1":1471.449,"y1":470.077,"x2":1479.953,"y2":481.415},{"kind":"line","x1":1490.376,"y1":499.424,"x2":1490.376,"y2":403.519},{"kind":"line","x1":1471.449,"y1":470.077,"x2":1471.449,"y2":394.315},{"kind":"path","d":"M1308.958,431.676c.429,2.98,2.535,5.456,5.408,6.356,2.873.901,6.016.071,8.069-2.131"},{"kind":"path","d":"M1479.953,499.535c.065,2.855,2.418,5.128,5.273,5.093,2.855-.034,5.153-2.363,5.15-5.218"},{"kind":"line","x1":2339.853,"y1":499.535,"x2":2339.853,"y2":481.415},{"kind":"line","x1":2348.357,"y1":470.077,"x2":2339.853,"y2":481.415},{"kind":"path","d":"M2329.43,499.411c-.003,2.856,2.294,5.184,5.15,5.218,2.855.034,5.208-2.238,5.273-5.093"},{"kind":"line","x1":2329.43,"y1":499.424,"x2":2329.43,"y2":403.519},{"kind":"line","x1":2348.357,"y1":470.077,"x2":2348.357,"y2":394.315},{"kind":"line","x1":475.572,"y1":439.66,"x2":399.037,"y2":468.361},{"kind":"path","d":"M2092.745,405.021c-6.21.78-10.617,6.454-9.837,12.664.781,6.21,6.454,10.617,12.664,9.836,5.672-.713,9.925-5.534,9.925-11.25s-4.253-10.537-9.925-11.25"},{"kind":"path","d":"M1724.241,405.021c-6.21.78-10.617,6.454-9.836,12.664.78,6.21,6.454,10.617,12.664,9.836,5.672-.713,9.925-5.534,9.925-11.25s-4.253-10.537-9.925-11.25"},{"kind":"line","x1":469.903,"y1":1263.834,"x2":399.037,"y2":1244.846},{"kind":"line","x1":1308.958,"y1":431.676,"x2":1308.958,"y2":335.487},{"kind":"line","x1":1282.029,"y1":308.558,"x2":502.499,"y2":308.558},{"kind":"line","x1":2302.502,"y1":376.589,"x2":1517.305,"y2":376.589},{"kind":"line","x1":399.037,"y1":468.361,"x2":399.037,"y2":1244.846},{"kind":"line","x1":2500.927,"y1":437.79,"x2":2500.927,"y2":1263.834},{"kind":"path","d":"M1725.651,583.518c-4.694.002-8.503,3.811-8.504,8.504.002,4.694,3.811,8.502,8.504,8.504"},{"kind":"path","d":"M1725.651,600.527c4.693-.002,8.502-3.811,8.504-8.504"},{"kind":"path","d":"M1734.155,592.023c-.002-4.694-3.81-8.502-8.504-8.504"},{"kind":"path","d":"M2102.659,592.023c-.002-4.693-3.81-8.502-8.503-8.504"},{"kind":"path","d":"M2085.651,592.023c.002,4.694,3.811,8.502,8.505,8.504"},{"kind":"path","d":"M2094.155,600.527c4.693-.002,8.502-3.811,8.503-8.504"},{"kind":"path","d":"M2094.155,583.518c-4.694.002-8.503,3.811-8.505,8.504"},{"kind":"path","d":"M1085.021,592.023c-.002-4.694-3.811-8.503-8.504-8.504"},{"kind":"path","d":"M1068.014,592.023c.002,4.693,3.81,8.502,8.503,8.504"},{"kind":"path","d":"M1076.517,600.527c4.694-.002,8.503-3.81,8.504-8.504"},{"kind":"path","d":"M1076.517,583.518c-4.693.002-8.502,3.811-8.503,8.504"},{"kind":"path","d":"M716.517,592.023c-.002-4.694-3.81-8.502-8.504-8.504-4.694.002-8.502,3.811-8.504,8.504"},{"kind":"path","d":"M708.014,600.527c4.693-.002,8.502-3.811,8.504-8.504"},{"kind":"path","d":"M699.51,592.023c.002,4.693,3.811,8.502,8.504,8.504"},{"kind":"path","d":"M892.25,467.314c17.212,0,31.181-13.969,31.181-31.181s-13.969-31.181-31.181-31.181-31.181,13.969-31.181,31.181,13.969,31.181,31.181,31.181"},{"kind":"polyline","points":"2500.927 1263.834 2414.47 1350.291 2428.79 1375.094"},{"kind":"path","d":"M2410.379,1406.984c7.594,0,14.615-4.053,18.412-10.63,3.797-6.577,3.797-14.683,0-21.26"},{"kind":"polyline","points":"2410.379 1406.984 2340.769 1406.984 2340.769 1272.338 2332.265 1263.834 2245.809 1350.291 2245.809 1385.724"},{"kind":"path","d":"M2224.549,1406.984c11.735,0,21.26-9.524,21.26-21.26"},{"kind":"line","x1":2224.549,"y1":1406.984,"x2":2043.131,"y2":1406.984},{"kind":"path","d":"M2021.872,1385.724c0,11.735,9.524,21.26,21.26,21.26"},{"kind":"polyline","points":"2021.872 1385.724 2021.872 1350.291 1797.935 1350.291 1797.935 1385.724"},{"kind":"line","x1":1776.675,"y1":1406.984,"x2":1595.257,"y2":1406.984},{"kind":"path","d":"M1573.998,1385.724c0,11.735,9.524,21.26,21.26,21.26"},{"kind":"polyline","points":"1573.998 1385.724 1573.998 1350.291 1487.541 1263.834 1479.037 1272.338 1479.037 1406.984 1409.571 1406.984"},{"kind":"path","d":"M1391.113,1375.174c-3.76,6.579-3.734,14.666.069,21.22,3.803,6.554,10.811,10.59,18.389,10.59"},{"kind":"polyline","points":"1391.113 1375.174 1405.336 1350.291 1314.628 1263.834 1306.124 1272.338 1306.124 1406.984 1252.265 1406.984"},{"kind":"path","d":"M1231.005,1385.724c0,11.735,9.524,21.26,21.26,21.26"},{"kind":"polyline","points":"1231.005 1385.724 1231.005 1350.291 1001.399 1350.291 1001.399 1385.724"},{"kind":"path","d":"M980.139,1406.984c11.735,0,21.26-9.524,21.26-21.26"},{"kind":"line","x1":980.139,"y1":1406.984,"x2":804.391,"y2":1406.984},{"kind":"path","d":"M783.131,1385.724c0,11.735,9.524,21.26,21.26,21.26"},{"kind":"polyline","points":"783.131 1385.724 783.131 1350.291 553.525 1350.291 553.525 1385.724"},{"kind":"path","d":"M532.265,1406.984c11.735,0,21.26-9.524,21.26-21.26"},{"kind":"polyline","points":"532.265 1406.984 478.407 1406.984 478.407 1272.338 469.903 1263.834"},{"kind":"line","x1":1420.378,"y1":355.878,"x2":1454.379,"y2":369.255},{"kind":"path","d":"M1471.449,394.315c0-11.042-6.794-21.016-17.07-25.059"},{"kind":"line","x1":1390.825,"y1":362.57,"x2":1322.435,"y2":435.901},{"kind":"path","d":"M1420.378,355.878c-10.268-4.04-22.028-1.377-29.553,6.693"},{"kind":"path","d":"M2399.428,355.878l-34.001,13.378c-10.276,4.043-17.07,14.017-17.07,25.059"},{"kind":"path","d":"M2428.982,362.57c-7.525-8.069-19.286-10.733-29.553-6.693"},{"kind":"line","x1":2500.927,"y1":437.79,"x2":2428.982,"y2":362.57}],"fold":[{"kind":"line","x1":1314.628,"y1":436.117,"x2":1487.541,"y2":504.149},{"kind":"line","x1":1314.628,"y1":436.117,"x2":923.431,"y2":436.117},{"kind":"line","x1":861.069,"y1":436.117,"x2":475.572,"y2":436.117},{"kind":"line","x1":469.903,"y1":441.786,"x2":469.903,"y2":1263.834},{"kind":"line","x1":1314.628,"y1":436.117,"x2":1314.628,"y2":1263.834},{"kind":"line","x1":1487.541,"y1":504.149,"x2":1487.541,"y2":1263.834},{"kind":"line","x1":2332.265,"y1":504.149,"x2":2332.265,"y2":1263.834},{"kind":"line","x1":2332.265,"y1":504.149,"x2":1487.541,"y2":504.149},{"kind":"polyline","points":"2500.927 1263.834 2332.265 1263.834 1487.541 1263.834 1314.628 1263.834 469.903 1263.834"},{"kind":"line","x1":2500.927,"y1":437.79,"x2":2332.265,"y2":504.149}]},"innerTray":{"cut":[{"kind":"polyline","points":"1574.89 2304.303 1518.197 2304.303 1518.197 2295.799"},{"kind":"line","x1":1569.221,"y1":2304.303,"x2":1569.221,"y2":1957.976},{"kind":"path","d":"M1502.607,1900.366c-2.7,0-5.027,1.906-5.558,4.553-.531,2.647.879,5.304,3.37,6.346"},{"kind":"path","d":"M1502.607,1900.366h31.181c14.865,0,26.929-12.064,26.929-26.929v-31.181c0-14.865-12.064-26.929-26.929-26.929h-82.205c-14.865,0-26.929,12.064-26.929,26.929v384.094"},{"kind":"line","x1":1441.662,"y1":2226.351,"x2":1407.646,"y2":2226.351},{"kind":"path","d":"M1453.001,2237.689c0-6.259-5.08-11.339-11.339-11.339"},{"kind":"path","d":"M1407.646,2226.351v-384.094c0-14.865-12.064-26.929-26.929-26.929h-109.134l-8.504,405.354"},{"kind":"path","d":"M1251.741,2220.681c0,3.129,2.54,5.669,5.669,5.669s5.669-2.54,5.669-5.669"},{"kind":"path","d":"M1251.741,2220.681v-225.354c0-5.477-4.445-9.921-9.921-9.921h-9.921v-199.843c0-14.865-12.064-26.929-26.929-26.929"},{"kind":"polyline","points":"106.544 2304.303 163.237 2304.303 163.237 2295.799"},{"kind":"line","x1":112.213,"y1":2304.303,"x2":112.213,"y2":1842.256},{"kind":"path","d":"M139.142,1815.327c-14.865,0-26.929,12.064-26.929,26.929"},{"kind":"line","x1":139.142,"y1":1815.327,"x2":215.678,"y2":1815.327},{"kind":"path","d":"M242.607,1842.256c0-14.865-12.064-26.929-26.929-26.929"},{"kind":"line","x1":242.607,"y1":1842.256,"x2":242.607,"y2":1873.437},{"kind":"path","d":"M215.678,1900.366c14.865,0,26.929-12.064,26.929-26.929"},{"kind":"path","d":"M215.678,1900.366h-36.85c-2.755,0-5.113,1.982-5.585,4.697-.473,2.714,1.076,5.377,3.669,6.308"},{"kind":"line","x1":256.78,"y1":1958.994,"x2":256.78,"y2":2226.351},{"kind":"path","d":"M256.78,1958.994c0-11.333-7.162-21.515-17.828-25.345"},{"kind":"line","x1":256.781,"y1":2226.35,"x2":273.788,"y2":2226.35},{"kind":"path","d":"M228.434,2237.689c0-6.259,5.08-11.339,11.339-11.339h16.241"},{"kind":"line","x1":273.788,"y1":2226.351,"x2":273.788,"y2":1842.256},{"kind":"path","d":"M300.717,1815.327c-14.865,0-26.929,12.064-26.929,26.929"},{"kind":"path","d":"M300.717,1815.327h109.134l8.504,405.354c0,3.129,2.54,5.669,5.669,5.669s5.669-2.54,5.669-5.669v-225.354"},{"kind":"path","d":"M439.615,1985.406c-5.477,0-9.921,4.445-9.921,9.921"},{"kind":"polyline","points":"439.615 1985.406 449.536 1985.406 449.536 1785.563"},{"kind":"polyline","points":"1574.89 3018.634 1518.197 3018.634 1518.197 3027.138"},{"kind":"polyline","points":"1574.89 3018.634 1574.89 3374.382 1451.583 3374.382"},{"kind":"path","d":"M1424.654,3347.453c0,14.865,12.064,26.929,26.929,26.929"},{"kind":"line","x1":1424.654,"y1":3347.453,"x2":1424.654,"y2":3037.059},{"kind":"polyline","points":"1424.654 3037.059 1407.646 3037.059 1407.646 3347.453"},{"kind":"path","d":"M1380.717,3374.382c14.865,0,26.929-12.064,26.929-26.929"},{"kind":"path","d":"M1380.717,3374.382h-109.134l-8.504-331.654c0-3.13-2.54-5.669-5.669-5.669s-5.669,2.54-5.669,5.669v165.827"},{"kind":"path","d":"M1241.819,3218.477c5.477,0,9.921-4.445,9.921-9.921"},{"kind":"polyline","points":"1241.819 3218.477 1231.898 3218.477 1231.898 3320.524 1243.237 3326.193 1243.237 3374.382"},{"kind":"line","x1":1574.89,"y1":3018.634,"x2":1574.89,"y2":2304.303},{"kind":"polyline","points":"106.544 3018.634 163.237 3018.634 163.237 3027.138"},{"kind":"path","d":"M106.544,3029.06v345.322h123.307c14.865,0,26.929-11.711,26.929-26.14v-310.928"},{"kind":"path","d":"M256.78,3037.059h17.008v310.394c0,14.865,12.064,26.929,26.929,26.929h109.134l8.504-331.654"},{"kind":"path","d":"M429.694,3042.728c0-3.13-2.54-5.669-5.669-5.669s-5.669,2.54-5.669,5.669"},{"kind":"path","d":"M429.694,3042.728v165.827c0,5.476,4.445,9.921,9.921,9.921h9.921v102.047l-11.339,5.669v48.189"},{"kind":"line","x1":438.197,"y1":3374.382,"x2":1243.237,"y2":3374.382},{"kind":"line","x1":106.544,"y1":3029.059,"x2":106.544,"y2":2304.303},{"kind":"line","x1":1453.001,"y1":2237.689,"x2":1453.001,"y2":2267.453},{"kind":"line","x1":1424.654,"y1":2295.799,"x2":1453.001,"y2":2267.453},{"kind":"line","x1":238.952,"y1":1933.649,"x2":176.911,"y2":1911.371},{"kind":"line","x1":228.434,"y1":2237.689,"x2":228.434,"y2":2267.453},{"kind":"line","x1":256.78,"y1":2295.799,"x2":228.434,"y2":2267.453},{"kind":"line","x1":476.465,"y1":1758.634,"x2":1204.969,"y2":1758.634},{"kind":"path","d":"M476.465,1758.634c-14.865,0-26.929,12.064-26.929,26.929"},{"kind":"line","x1":1552.686,"y1":1933.133,"x2":1500.419,"y2":1911.266},{"kind":"path","d":"M1569.221,1957.976c0-10.837-6.538-20.66-16.535-24.843"}],"fold":[{"kind":"line","x1":1424.654,"y1":2295.799,"x2":1518.197,"y2":2295.799},{"kind":"line","x1":1257.41,"y1":2226.351,"x2":1407.646,"y2":2226.351},{"kind":"line","x1":256.78,"y1":2295.799,"x2":163.237,"y2":2295.799},{"kind":"line","x1":424.024,"y1":2226.351,"x2":273.788,"y2":2226.351},{"kind":"line","x1":449.536,"y1":1829.5,"x2":1231.898,"y2":1829.5},{"kind":"line","x1":449.536,"y1":1985.406,"x2":1231.898,"y2":1985.406},{"kind":"line","x1":429.694,"y1":2061.941,"x2":1251.741,"y2":2061.941},{"kind":"line","x1":429.694,"y1":2223.516,"x2":1251.741,"y2":2223.516},{"kind":"line","x1":1424.654,"y1":3027.138,"x2":1518.197,"y2":3027.138},{"kind":"line","x1":1259.481,"y1":3037.059,"x2":1407.646,"y2":3037.059},{"kind":"line","x1":1251.741,"y1":3039.893,"x2":1251.741,"y2":2220.681},{"kind":"line","x1":1407.646,"y1":3037.059,"x2":1407.646,"y2":2226.351},{"kind":"line","x1":1424.654,"y1":3035.361,"x2":1424.654,"y2":2295.799},{"kind":"line","x1":256.78,"y1":3027.138,"x2":163.237,"y2":3027.138},{"kind":"line","x1":424.024,"y1":3037.059,"x2":273.788,"y2":3037.059},{"kind":"line","x1":449.536,"y1":3218.477,"x2":1231.898,"y2":3218.477},{"kind":"line","x1":429.694,"y1":3201.468,"x2":1251.741,"y2":3201.468},{"kind":"line","x1":429.694,"y1":3039.894,"x2":1251.741,"y2":3039.894},{"kind":"line","x1":429.694,"y1":3042.728,"x2":429.694,"y2":2220.681},{"kind":"line","x1":273.789,"y1":3036.138,"x2":273.789,"y2":2226.915},{"kind":"line","x1":256.78,"y1":3035.966,"x2":256.78,"y2":2295.799}]},"insertPad":{"cut":[{"kind":"polyline","points":"2206.094 2867.016 2359.165 2867.016 2359.165 2787.646 2359.165 2597.724 2359.165 2518.354 2206.094 2518.354 2206.094 2597.724 2206.094 2787.646 2206.094 2867.016"},{"kind":"line","x1":1965.149,"y1":2867.016,"x2":2092.708,"y2":2867.016},{"kind":"line","x1":2106.881,"y1":2852.843,"x2":2106.881,"y2":2787.646},{"kind":"path","d":"M2092.708,2867.016c7.824,0,14.173-6.349,14.173-14.173"},{"kind":"line","x1":2106.881,"y1":2787.646,"x2":2106.881,"y2":2469.912},{"kind":"line","x1":2075.7,"y1":2271.74,"x2":1982.157,"y2":2271.74},{"kind":"path","d":"M1950.976,2469.912v382.93c0,7.824,6.35,14.173,14.173,14.173"},{"kind":"line","x1":2656.803,"y1":2135.677,"x2":1908.456,"y2":2135.677},{"kind":"line","x1":1814.913,"y1":2229.221,"x2":1814.913,"y2":2909.536},{"kind":"polyline","points":"1908.456 2135.677 1894.283 2215.047 1814.913 2229.221"},{"kind":"polyline","points":"2656.803 2135.677 2670.976 2215.047 2750.346 2229.221"},{"kind":"polyline","points":"1908.456 3003.079 1894.283 2923.709 1814.913 2909.536"},{"kind":"polyline","points":"2656.803 3003.079 2670.976 2923.709 2750.346 2909.536"},{"kind":"line","x1":2656.803,"y1":3003.079,"x2":1908.456,"y2":3003.079},{"kind":"line","x1":2750.346,"y1":2229.221,"x2":2750.346,"y2":2909.536},{"kind":"line","x1":1950.976,"y1":2787.646,"x2":2106.881,"y2":2787.646},{"kind":"line","x1":2359.165,"y1":2597.724,"x2":2206.094,"y2":2597.724},{"kind":"line","x1":2206.094,"y1":2787.646,"x2":2359.165,"y2":2787.646},{"kind":"line","x1":2282.629,"y1":2787.646,"x2":2282.629,"y2":2597.724},{"kind":"line","x1":2028.929,"y1":2787.646,"x2":2028.929,"y2":2469.912},{"kind":"line","x1":2075.7,"y1":2271.74,"x2":2075.7,"y2":2399.553},{"kind":"line","x1":1982.157,"y1":2271.74,"x2":1982.157,"y2":2399.553},{"kind":"line","x1":2106.881,"y1":2469.912,"x2":1950.976,"y2":2469.912},{"kind":"path","d":"M1959.207,2444.767l14.718-20.07c5.341-7.283,8.232-16.113,8.232-25.145"},{"kind":"path","d":"M1959.207,2444.767c-5.341,7.283-8.232,16.114-8.232,25.145"},{"kind":"line","x1":2098.65,"y1":2444.767,"x2":2083.932,"y2":2424.697},{"kind":"path","d":"M2106.881,2469.912c0-9.031-2.891-17.862-8.232-25.145"},{"kind":"path","d":"M2075.7,2399.553c0,9.031,2.891,17.862,8.232,25.145"},{"kind":"line","x1":2075.7,"y1":2351.11,"x2":1982.157,"y2":2351.11},{"kind":"line","x1":2600.11,"y1":2867.016,"x2":2472.551,"y2":2867.016},{"kind":"line","x1":2458.377,"y1":2852.843,"x2":2458.377,"y2":2787.646},{"kind":"path","d":"M2458.377,2852.843c0,7.824,6.35,14.173,14.173,14.173"},{"kind":"line","x1":2458.377,"y1":2787.646,"x2":2458.377,"y2":2469.912},{"kind":"line","x1":2489.559,"y1":2271.74,"x2":2583.102,"y2":2271.74},{"kind":"polyline","points":"2614.283 2469.912 2614.283 2787.646 2614.283 2852.843"},{"kind":"path","d":"M2600.11,2867.016c7.824,0,14.173-6.349,14.173-14.173"},{"kind":"line","x1":2614.283,"y1":2787.646,"x2":2458.377,"y2":2787.646},{"kind":"line","x1":2536.33,"y1":2787.646,"x2":2536.33,"y2":2469.912},{"kind":"line","x1":2489.559,"y1":2271.74,"x2":2489.559,"y2":2399.553},{"kind":"line","x1":2583.102,"y1":2271.74,"x2":2583.102,"y2":2399.553},{"kind":"line","x1":2458.377,"y1":2469.912,"x2":2614.283,"y2":2469.912},{"kind":"line","x1":2606.051,"y1":2444.767,"x2":2591.334,"y2":2424.697},{"kind":"path","d":"M2583.102,2399.553c0,9.031,2.891,17.862,8.232,25.145"},{"kind":"path","d":"M2614.283,2469.912c0-9.031-2.891-17.862-8.232-25.145"},{"kind":"line","x1":2466.609,"y1":2444.767,"x2":2481.327,"y2":2424.697},{"kind":"path","d":"M2466.609,2444.767c-5.341,7.283-8.232,16.114-8.232,25.145"},{"kind":"path","d":"M2481.327,2424.697c5.341-7.283,8.232-16.113,8.232-25.145"},{"kind":"line","x1":2489.559,"y1":2351.11,"x2":2583.102,"y2":2351.11}],"fold":[{"kind":"polyline","points":"2670.976 2923.709 1894.283 2923.709 1894.283 2215.047"},{"kind":"line","x1":2670.976,"y1":2215.047,"x2":1894.283,"y2":2215.047},{"kind":"line","x1":2670.976,"y1":2215.047,"x2":2670.976,"y2":2923.709}]}};

const S001_IDENTITY_MAPPER = { point: (x, y) => ({ x, y }) };
const S001_OUTER_SOURCE_BLEED = [{ kind: 'path', d: 'M411.915,1257.235l53.848,14.428,4.403,4.402v131.123c0,4.696,3.807,8.504,8.504,8.504h53.858c16.412,0,29.764-13.352,29.764-29.764v-26.929h212.599v26.929c0,16.412,13.352,29.764,29.764,29.764h175.748c16.412,0,29.764-13.352,29.764-29.764v-26.929h212.599v26.929c0,16.412,13.352,29.764,29.764,29.764h53.858c4.697,0,8.504-3.808,8.504-8.504v-131.123l.143-.143,79.878,76.135-10.913,19.093s-.004.005-.005.008c-5.247,9.18-5.21,20.563.096,29.708,5.306,9.146,15.17,14.826,25.744,14.826h69.467c4.697,0,8.504-3.808,8.504-8.504v-131.123l77.953,77.953v31.91c0,16.412,13.352,29.764,29.764,29.764h181.417c16.412,0,29.764-13.352,29.764-29.764v-26.929h206.929v26.929c0,16.412,13.353,29.764,29.765,29.764h181.417c16.412,0,29.764-13.352,29.764-29.764v-31.91l77.953-77.953v131.123c0,4.696,3.808,8.504,8.504,8.504h69.609c10.6,0,20.477-5.702,25.775-14.882,5.3-9.179,5.3-20.583,0-29.764-.003-.005-.006-.009-.009-.014l-11.049-19.137,81.844-81.843c.07-.07.131-.147.198-.219.122-.131.246-.26.36-.398.099-.12.186-.246.277-.37.073-.099.151-.196.219-.298.09-.134.168-.273.25-.411.06-.101.123-.199.179-.303.073-.136.135-.276.2-.415.053-.114.11-.225.158-.341.055-.132.099-.266.147-.4.046-.128.095-.255.135-.386.04-.132.069-.266.103-.4.034-.136.072-.27.1-.409.03-.151.048-.304.07-.456.017-.123.041-.243.053-.367.028-.279.042-.559.042-.839V437.994c0-.092-.011-.181-.014-.272-.005-.16-.01-.32-.024-.48-.012-.132-.03-.261-.048-.391-.019-.144-.039-.288-.066-.431-.026-.136-.057-.27-.089-.404-.032-.135-.065-.269-.103-.402-.039-.134-.084-.266-.129-.397-.045-.131-.091-.261-.143-.39-.051-.127-.107-.251-.164-.375-.059-.128-.118-.256-.184-.381-.063-.121-.131-.239-.2-.357-.071-.121-.141-.241-.218-.359-.079-.12-.163-.236-.247-.352-.078-.107-.155-.215-.239-.32-.098-.123-.203-.239-.308-.357-.062-.07-.117-.143-.182-.211l-71.945-75.219c-.037-.039-.078-.071-.116-.109-9.847-10.396-25.356-13.866-38.696-8.619l-34.002,13.378c-13.435,5.286-22.46,18.537-22.46,32.973v72.928l-1.919,2.558v-66.283s0-.001,0-.002,0-.001,0-.002c-.008-19.529-15.901-35.423-35.43-35.43h-785.203c-19.529.007-35.423,15.901-35.43,35.43,0,0,0,0,0,.001s0,0,0,.001v66.281l-1.918-2.558v-72.928c0-14.436-9.026-27.687-22.46-32.973l-34.001-13.378s-.009-.003-.013-.004c-13.409-5.268-29.016-1.738-38.852,8.79-.007.007-.014.013-.021.021l-67.144,71.995v-93.278s0,0,0-.001,0,0,0-.001c-.007-19.529-15.901-35.423-35.43-35.43H502.761c-19.529.007-35.423,15.901-35.43,35.43h0v98.283l-71.018,26.632c-.041.015-.079.036-.12.052-.167.066-.33.138-.492.213-.102.048-.204.095-.303.146-.137.071-.27.147-.402.225-.117.068-.233.137-.346.21-.106.069-.207.143-.31.217-.127.091-.254.183-.375.28-.084.068-.164.14-.245.21-.127.111-.253.222-.373.339-.075.074-.146.152-.218.228-.113.12-.226.239-.332.365-.078.092-.149.188-.223.284-.09.116-.18.232-.264.352-.081.117-.156.24-.231.361-.065.105-.132.209-.193.318-.079.14-.149.284-.22.429-.048.098-.098.195-.142.295-.066.15-.125.304-.182.458-.039.104-.08.207-.115.313-.048.145-.089.294-.129.442-.034.124-.068.248-.096.373-.029.129-.051.26-.074.391-.027.153-.052.307-.07.462-.013.109-.021.22-.03.33-.014.179-.024.359-.027.539,0,.043-.007.085-.007.129v776.484c0,.044.006.086.007.13.003.181.013.361.027.541.008.108.016.215.029.322.019.163.046.324.074.485.021.122.042.245.069.365.031.137.067.272.104.407.038.138.076.277.12.412.038.115.082.228.125.341.055.146.111.292.174.435.046.105.098.206.149.309.07.142.139.283.217.42.06.106.125.208.189.312.077.125.154.249.238.37.079.114.165.224.25.334.078.102.155.204.238.302.101.12.209.234.316.348.077.081.151.164.231.242.119.116.244.226.37.336.08.069.158.14.24.207.127.102.259.198.391.293.093.067.186.135.281.198.124.081.251.156.38.231.117.068.233.137.354.199.112.058.228.112.344.166.146.068.292.134.443.194.1.04.203.076.305.112.17.06.341.117.515.166.042.012.081.028.123.04l14.817,3.97' }];

const S001_INNER_SOURCE_BLEED = [{ kind: 'path', d: 'M1580.725,3012.499v-708.557c0-2.596-1.167-4.916-3-6.476v-339.45c0-14.316-8.528-27.136-21.727-32.674-.01-.004-.02-.01-.03-.014l-39.241-16.417h17.061c19.538,0,35.434-15.895,35.434-35.433v-31.181c0-19.538-15.896-35.433-35.434-35.433h-82.204c-19.538,0-35.434,15.895-35.434,35.433,0-19.538-15.895-35.433-35.433-35.433h-109.134c-4.627,0-8.405,3.7-8.502,8.326l-3.665,174.711c-2.335-7.498-9.34-12.957-17.596-12.957h-1.418v-191.339c0-19.538-15.895-35.433-35.433-35.433H476.465c-19.538,0-35.434,15.895-35.434,35.433v191.339h-1.417c-.294,0-.584.015-.871.044-7.873.371-14.475,5.682-16.726,12.914l-3.665-174.712c-.097-4.626-3.875-8.326-8.502-8.326h-109.134c-19.538,0-35.434,15.895-35.434,35.433v116.738c0-14.908-9.427-28.31-23.458-33.348l-46.717-16.776h20.569c19.538,0,35.434-15.895,35.434-35.433v-31.181c0-19.538-15.896-35.433-35.434-35.433h-76.535c-19.538,0-35.433,15.895-35.433,35.433v454.038c-3.3,1.169-5.669,4.308-5.669,8.01v724.737c0,.007,0,.013,0,.019v345.322c0,4.696,3.808,8.504,8.504,8.504h123.307c19.538,0,35.434-15.541,35.434-34.645v-.789c0,19.538,15.896,35.434,35.434,35.434h109.134c4.611,0,8.383-3.676,8.501-8.286l4.088-159.426c2.667,6.895,9.35,11.806,17.175,11.806h1.417v88.288l-6.637,3.318c-2.882,1.44-4.701,4.386-4.701,7.606v48.189c0,4.696,3.808,8.504,8.504,8.504h805.039c4.696,0,8.504-3.808,8.504-8.504v-48.189c0-3.221-1.82-6.166-4.701-7.606l-6.638-3.318v-88.288h1.418c.294,0,.585-.015.871-.044,7.445-.351,13.737-5.126,16.304-11.762l4.088,159.426c.118,4.61,3.89,8.286,8.501,8.286h109.134c19.538,0,35.433-15.896,35.433-35.434,0,19.538,15.896,35.434,35.434,35.434h123.307c4.696,0,8.504-3.808,8.504-8.504v-355.748c0-2.435-1.029-4.625-2.669-6.175Z' }];

const S001_INSERT_SOURCE_BLEED = [{ kind: 'path', d: 'M2656.802,3010.319h-748.346c-4.12,0-7.647-2.953-8.371-7.009l-13.132-73.535-73.536-13.132c-4.056-.724-7.009-4.251-7.009-8.371v-680.315c0-4.12,2.953-7.647,7.009-8.371l73.536-13.131,13.132-73.536c.724-4.056,4.251-7.009,8.371-7.009h748.346c4.12,0,7.647,2.953,8.371,7.009l13.132,73.536,73.536,13.131c4.056.724,7.009,4.251,7.009,8.371v680.315c0,4.12-2.953,7.647-7.009,8.371l-73.536,13.132-13.132,73.535c-.724,4.056-4.251,7.009-8.371,7.009Z' }];

function S001_num(value) {
  return Number(value).toFixed(3).replace(/\.?0+$/, '');
}

function S001_clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function S001_distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function S001_tokenizePath(d) {
  return String(d || '').match(/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g) || [];
}

function S001_isCommand(token) {
  return /^[a-zA-Z]$/.test(token);
}

function S001_piecewise(value, sourceAnchors, targetAnchors) {
  if (value <= sourceAnchors[0]) {
    const s = (targetAnchors[1] - targetAnchors[0]) / (sourceAnchors[1] - sourceAnchors[0]);
    return targetAnchors[0] + (value - sourceAnchors[0]) * s;
  }
  for (let i = 0; i < sourceAnchors.length - 1; i += 1) {
    if (value <= sourceAnchors[i + 1]) {
      const s = (targetAnchors[i + 1] - targetAnchors[i]) / (sourceAnchors[i + 1] - sourceAnchors[i]);
      return targetAnchors[i] + (value - sourceAnchors[i]) * s;
    }
  }
  const n = sourceAnchors.length - 1;
  const s = (targetAnchors[n] - targetAnchors[n - 1]) / (sourceAnchors[n] - sourceAnchors[n - 1]);
  return targetAnchors[n] + (value - sourceAnchors[n]) * s;
}

function S001_createMapper(spec) {
  return {
    point(x, y) {
      return {
        x: S001_piecewise(x, spec.sourceX, spec.targetX),
        y: S001_piecewise(y, spec.sourceY, spec.targetY)
      };
    }
  };
}

function S001_pathPoint(mapper, point) {
  const p = mapper.point(point.x, point.y);
  return S001_num(p.x) + ' ' + S001_num(p.y);
}

function S001_transformPathD(d, mapper) {
  const tokens = S001_tokenizePath(d);
  const out = [];
  let i = 0;
  let cmd = '';
  let current = { x: 0, y: 0 };
  let start = { x: 0, y: 0 };
  let previousC2 = null;

  function read() { return Number(tokens[i++]); }
  function hasNumber() { return i < tokens.length && !S001_isCommand(tokens[i]); }

  while (i < tokens.length) {
    if (S001_isCommand(tokens[i])) cmd = tokens[i++];
    const lower = cmd.toLowerCase();
    const relative = cmd === lower;

    if (lower === 'z') {
      out.push('Z');
      current = { x: start.x, y: start.y };
      previousC2 = null;
      continue;
    }

    if (lower === 'm') {
      let first = true;
      while (hasNumber()) {
        const x = read();
        const y = read();
        const next = relative ? { x: current.x + x, y: current.y + y } : { x, y };
        out.push((first ? 'M ' : 'L ') + S001_pathPoint(mapper, next));
        current = next;
        if (first) start = { x: current.x, y: current.y };
        first = false;
        previousC2 = null;
      }
      cmd = relative ? 'l' : 'L';
      continue;
    }

    if (lower === 'l') {
      while (hasNumber()) {
        const x = read();
        const y = read();
        const next = relative ? { x: current.x + x, y: current.y + y } : { x, y };
        out.push('L ' + S001_pathPoint(mapper, next));
        current = next;
        previousC2 = null;
      }
      continue;
    }

    if (lower === 'h') {
      while (hasNumber()) {
        const x = read();
        const next = { x: relative ? current.x + x : x, y: current.y };
        out.push('L ' + S001_pathPoint(mapper, next));
        current = next;
        previousC2 = null;
      }
      continue;
    }

    if (lower === 'v') {
      while (hasNumber()) {
        const y = read();
        const next = { x: current.x, y: relative ? current.y + y : y };
        out.push('L ' + S001_pathPoint(mapper, next));
        current = next;
        previousC2 = null;
      }
      continue;
    }

    if (lower === 'c') {
      while (hasNumber()) {
        const c1 = { x: read(), y: read() };
        const c2 = { x: read(), y: read() };
        const end = { x: read(), y: read() };
        const a1 = relative ? { x: current.x + c1.x, y: current.y + c1.y } : c1;
        const a2 = relative ? { x: current.x + c2.x, y: current.y + c2.y } : c2;
        const ae = relative ? { x: current.x + end.x, y: current.y + end.y } : end;
        out.push('C ' + S001_pathPoint(mapper, a1) + ' ' + S001_pathPoint(mapper, a2) + ' ' + S001_pathPoint(mapper, ae));
        current = ae;
        previousC2 = a2;
      }
      continue;
    }

    if (lower === 's') {
      while (hasNumber()) {
        const c1 = previousC2
          ? { x: current.x * 2 - previousC2.x, y: current.y * 2 - previousC2.y }
          : { x: current.x, y: current.y };
        const c2 = { x: read(), y: read() };
        const end = { x: read(), y: read() };
        const a2 = relative ? { x: current.x + c2.x, y: current.y + c2.y } : c2;
        const ae = relative ? { x: current.x + end.x, y: current.y + end.y } : end;
        out.push('C ' + S001_pathPoint(mapper, c1) + ' ' + S001_pathPoint(mapper, a2) + ' ' + S001_pathPoint(mapper, ae));
        current = ae;
        previousC2 = a2;
      }
      continue;
    }

    throw new Error('Unsupported SVG path command in S001 template: ' + cmd);
  }

  return out.join(' ');
}

function S001_pointsToPathD(points, mapper) {
  const nums = String(points || '').match(/-?\d+(?:\.\d+)?/g) || [];
  const out = [];
  for (let i = 0; i < nums.length - 1; i += 2) {
    const p = mapper.point(Number(nums[i]), Number(nums[i + 1]));
    out.push((i === 0 ? 'M ' : 'L ') + S001_num(p.x) + ' ' + S001_num(p.y));
  }
  return out.join(' ');
}

function S001_transformElementToPath(element, mapper) {
  if (element.kind === 'path') {
    return {
      kind: 'path',
      d: S001_transformPathD(element.d, mapper),
      sourceD: S001_transformPathD(element.d, S001_IDENTITY_MAPPER)
    };
  }
  if (element.kind === 'line') {
    const p1 = mapper.point(element.x1, element.y1);
    const p2 = mapper.point(element.x2, element.y2);
    return {
      kind: 'path',
      d: 'M ' + S001_num(p1.x) + ' ' + S001_num(p1.y) + ' L ' + S001_num(p2.x) + ' ' + S001_num(p2.y),
      sourceD: 'M ' + S001_num(element.x1) + ' ' + S001_num(element.y1) + ' L ' + S001_num(element.x2) + ' ' + S001_num(element.y2)
    };
  }
  if (element.kind === 'polyline' || element.kind === 'polygon') {
    const d = S001_pointsToPathD(element.points, mapper) + (element.kind === 'polygon' ? ' Z' : '');
    const sourceD = S001_pointsToPathD(element.points, S001_IDENTITY_MAPPER) + (element.kind === 'polygon' ? ' Z' : '');
    return { kind: 'path', d, sourceD };
  }
  return null;
}

function S001_parseAbsolutePath(d) {
  const tokens = S001_tokenizePath(d);
  const segments = [];
  let i = 0;
  let cmd = '';
  let current = null;
  let start = null;

  function read() { return Number(tokens[i++]); }
  function hasNumber() { return i < tokens.length && !S001_isCommand(tokens[i]); }

  while (i < tokens.length) {
    if (S001_isCommand(tokens[i])) cmd = tokens[i++];
    const upper = cmd.toUpperCase();

    if (upper === 'M') {
      while (hasNumber()) {
        const point = { x: read(), y: read() };
        if (!current) {
          current = point;
          start = point;
        } else {
          segments.push({ type: 'L', from: current, to: point });
          current = point;
        }
        cmd = 'L';
      }
    } else if (upper === 'L') {
      while (hasNumber()) {
        const point = { x: read(), y: read() };
        segments.push({ type: 'L', from: current, to: point });
        current = point;
      }
    } else if (upper === 'C') {
      while (hasNumber()) {
        const c1 = { x: read(), y: read() };
        const c2 = { x: read(), y: read() };
        const point = { x: read(), y: read() };
        segments.push({ type: 'C', from: current, c1, c2, to: point });
        current = point;
      }
    } else if (upper === 'Z') {
      if (current && start) {
        segments.push({ type: 'L', from: current, to: start });
        current = start;
      }
    } else {
      throw new Error('Unsupported absolute S001 path command: ' + cmd);
    }
  }

  return { start, end: current, segments };
}

function S001_cubicPoint(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  return {
    x: mt2 * mt * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t2 * t * p3.x,
    y: mt2 * mt * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t2 * t * p3.y
  };
}

function S001_segmentLength(segment) {
  if (!segment || !segment.from || !segment.to) return 0;
  if (segment.type === 'L') return S001_distance(segment.from, segment.to);
  return S001_distance(segment.from, segment.c1) + S001_distance(segment.c1, segment.c2) + S001_distance(segment.c2, segment.to);
}

function S001_pathLength(parsed) {
  return parsed.segments.reduce((sum, segment) => sum + S001_segmentLength(segment), 0);
}

function S001_getEndpoints(parsed) {
  if (!parsed.start || !parsed.end) return [];
  return [parsed.start, parsed.end];
}

function S001_parsedPathBounds(parsed) {
  const xs = [];
  const ys = [];
  function add(point) {
    if (!point) return;
    xs.push(point.x);
    ys.push(point.y);
  }
  add(parsed.start);
  add(parsed.end);
  parsed.segments.forEach(segment => {
    add(segment.from);
    add(segment.to);
    add(segment.c1);
    add(segment.c2);
  });
  if (!xs.length) return null;
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

function S001_mergeBounds(boundsList) {
  const valid = boundsList.filter(Boolean);
  if (!valid.length) return null;
  const minX = Math.min(...valid.map(bounds => bounds.minX));
  const minY = Math.min(...valid.map(bounds => bounds.minY));
  const maxX = Math.max(...valid.map(bounds => bounds.maxX));
  const maxY = Math.max(...valid.map(bounds => bounds.maxY));
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

function S001_boundsInside(inner, outer, tolerance) {
  const t = tolerance || 0;
  return Boolean(inner && outer &&
    inner.minX >= outer.minX - t &&
    inner.maxX <= outer.maxX + t &&
    inner.minY >= outer.minY - t &&
    inner.maxY <= outer.maxY + t);
}

function S001_partitionCutElements(elements) {
  const parsed = elements.map((element, index) => {
    const path = S001_parseAbsolutePath(element.d);
    const sourcePath = element.sourceD ? S001_parseAbsolutePath(element.sourceD) : null;
    return {
      index,
      element,
      path,
      length: S001_pathLength(path),
      endpoints: S001_getEndpoints(path),
      bounds: S001_parsedPathBounds(path),
      sourceBounds: sourcePath ? S001_parsedPathBounds(sourcePath) : null
    };
  }).filter(item => item.path.start && item.path.end);

  if (!parsed.length) return { cutElements: [], cutGroups: [], holeElements: [], holeGroups: [] };

  const parent = parsed.map((_, index) => index);
  function find(x) {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  }
  function union(a, b) {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[rb] = ra;
  }

  const tol = 4;
  for (let i = 0; i < parsed.length; i += 1) {
    for (let j = i + 1; j < parsed.length; j += 1) {
      const connected = parsed[i].endpoints.some(a => parsed[j].endpoints.some(b => S001_distance(a, b) <= tol));
      if (connected) union(i, j);
    }
  }

  const groups = new Map();
  parsed.forEach((item, index) => {
    const root = find(index);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(item);
  });

  let main = null;
  groups.forEach(group => {
    const length = group.reduce((sum, item) => sum + item.length, 0);
    const bounds = S001_mergeBounds(group.map(item => item.bounds));
    if (!main || length > main.length) main = { group, length, bounds };
  });

  const mainSet = new Set(main.group.map(item => item.index));
  const cutSet = new Set();
  const holeSet = new Set();
  const cutGroups = [];
  const holeGroups = [];
  groups.forEach(group => {
    const groupBounds = S001_mergeBounds(group.map(item => item.bounds));
    const isMain = group.some(item => mainSet.has(item.index));
    const isInternalHole = !isMain && S001_boundsInside(groupBounds, main.bounds, 2);
    if (isInternalHole) holeGroups.push(group);
    else cutGroups.push(group);
    group.forEach(item => {
      if (isInternalHole) holeSet.add(item.index);
      else cutSet.add(item.index);
    });
  });

  return {
    cutElements: parsed.filter(item => cutSet.has(item.index)).map(item => item.element),
    cutGroups: cutGroups.map(group => group.map(item => item.element)),
    holeElements: parsed.filter(item => holeSet.has(item.index)).map(item => item.element),
    holeGroups
  };
}

function S001_ellipsePath(cx, cy, rx, ry) {
  const k = 0.5522847498;
  return 'M ' + S001_num(cx - rx) + ' ' + S001_num(cy) +
    ' C ' + S001_num(cx - rx) + ' ' + S001_num(cy - ry * k) + ' ' + S001_num(cx - rx * k) + ' ' + S001_num(cy - ry) + ' ' + S001_num(cx) + ' ' + S001_num(cy - ry) +
    ' C ' + S001_num(cx + rx * k) + ' ' + S001_num(cy - ry) + ' ' + S001_num(cx + rx) + ' ' + S001_num(cy - ry * k) + ' ' + S001_num(cx + rx) + ' ' + S001_num(cy) +
    ' C ' + S001_num(cx + rx) + ' ' + S001_num(cy + ry * k) + ' ' + S001_num(cx + rx * k) + ' ' + S001_num(cy + ry) + ' ' + S001_num(cx) + ' ' + S001_num(cy + ry) +
    ' C ' + S001_num(cx - rx * k) + ' ' + S001_num(cy + ry) + ' ' + S001_num(cx - rx) + ' ' + S001_num(cy + ry * k) + ' ' + S001_num(cx - rx) + ' ' + S001_num(cy) + ' Z';
}

function S001_buildStableHoleElements(holeGroups, spec) {
  const s = spec || {};
  if (s.key === 'outerSleeve' && s.outerStringHoleEnabled === false) return [];
  return (holeGroups || []).map(group => {
    const targetBounds = S001_mergeBounds(group.map(item => item.bounds));
    const sourceBounds = S001_mergeBounds(group.map(item => item.sourceBounds || item.bounds));
    if (!targetBounds || !sourceBounds) return null;
    const cx = (targetBounds.minX + targetBounds.maxX) / 2;
    const cy = (targetBounds.minY + targetBounds.maxY) / 2 +
      (s.key === 'outerSleeve' ? (Number(s.outerHoleOffsetY) || 0) * S001_UNIT_PER_MM : 0);
    let rx = Math.max(1, sourceBounds.width / 2);
    let ry = Math.max(1, sourceBounds.height / 2);
    if (s.key === 'outerSleeve') {
      const sourceDiaMm = Math.max(sourceBounds.width, sourceBounds.height) * S001_UNIT_TO_MM;
      const isMainStringHole = sourceDiaMm > 15;
      const diaMm = isMainStringHole
        ? Number(s.outerMainHoleDia) || sourceDiaMm
        : Number(s.outerSmallHoleDia) || sourceDiaMm;
      rx = Math.max(1, diaMm * S001_UNIT_PER_MM / 2);
      ry = rx;
    }
    return { kind: 'path', d: S001_ellipsePath(cx, cy, rx, ry) };
  }).filter(Boolean);
}

function S001_reverseParsedPath(parsed) {
  const reversed = parsed.segments.slice().reverse().map(segment => {
    if (segment.type === 'L') return { type: 'L', from: segment.to, to: segment.from };
    return { type: 'C', from: segment.to, c1: segment.c2, c2: segment.c1, to: segment.from };
  });
  return { start: parsed.end, end: parsed.start, segments: reversed };
}

function S001_segmentsToD(start, segments) {
  const out = ['M ' + S001_num(start.x) + ' ' + S001_num(start.y)];
  segments.forEach(segment => {
    if (segment.type === 'L') {
      out.push('L ' + S001_num(segment.to.x) + ' ' + S001_num(segment.to.y));
    } else {
      out.push('C ' + S001_num(segment.c1.x) + ' ' + S001_num(segment.c1.y) + ' ' +
        S001_num(segment.c2.x) + ' ' + S001_num(segment.c2.y) + ' ' +
        S001_num(segment.to.x) + ' ' + S001_num(segment.to.y));
    }
  });
  out.push('Z');
  return out.join(' ');
}

function S001_buildCutFillPath(elements) {
  const paths = elements.map(element => S001_parseAbsolutePath(element.d))
    .filter(path => path.start && path.end && path.segments.length);
  if (!paths.length) return '';

  const ordered = [paths.shift()];
  while (paths.length) {
    const currentEnd = ordered[ordered.length - 1].end;
    let bestIndex = 0;
    let bestReverse = false;
    let bestDistance = Infinity;
    paths.forEach((path, index) => {
      const startDistance = S001_distance(currentEnd, path.start);
      const endDistance = S001_distance(currentEnd, path.end);
      if (startDistance < bestDistance) {
        bestDistance = startDistance;
        bestIndex = index;
        bestReverse = false;
      }
      if (endDistance < bestDistance) {
        bestDistance = endDistance;
        bestIndex = index;
        bestReverse = true;
      }
    });
    const next = paths.splice(bestIndex, 1)[0];
    ordered.push(bestReverse ? S001_reverseParsedPath(next) : next);
  }

  const start = ordered[0].start;
  const segments = [];
  ordered.forEach((path, index) => {
    if (index > 0 && segments.length && S001_distance(segments[segments.length - 1].to, path.start) > 0.02) {
      segments.push({ type: 'L', from: segments[segments.length - 1].to, to: path.start });
    }
    path.segments.forEach(segment => segments.push(segment));
  });
  return S001_segmentsToD(start, segments);
}

function S001_buildMappedPolygonPath(spec, points) {
  const mapper = S001_createMapper(spec);
  return S001_polygonToPath(points.map(point => mapper.point(point.x, point.y)));
}

function S001_buildMappedSourcePath(spec, d, sourceMapper) {
  const mapper = S001_createMapper(spec);
  if (!sourceMapper) return S001_transformPathD(d, mapper);
  return S001_transformPathD(d, {
    point(x, y) {
      const sourcePoint = sourceMapper.point(x, y);
      return mapper.point(sourcePoint.x, sourcePoint.y);
    }
  });
}

function S001_mirrorSourceMapper(axisX) {
  return {
    point(x, y) {
      return { x: axisX * 2 - x, y };
    }
  };
}

function S001_buildInnerFillClosures(spec) {
  if (!spec || spec.key !== 'innerTray') return [];
  const mirrorAxisX = (106.544 + 1574.89) / 2;
  const leftUpperSidePath = 'M106.544,2304.303 H163.237 V2295.799 H256.78 L228.434,2267.453 V2237.689 C228.434,2231.43 233.514,2226.35 239.773,2226.35 H256.78 V1958.994 C256.78,1947.661 249.618,1937.479 238.952,1933.649 L176.911,1911.371 C174.318,1910.44 172.77,1907.777 173.243,1905.063 C173.715,1902.348 176.073,1900.366 178.828,1900.366 H215.678 C230.543,1900.366 242.607,1888.302 242.607,1873.437 V1842.256 C242.607,1827.391 230.543,1815.327 215.678,1815.327 H139.142 C124.277,1815.327 112.213,1827.391 112.213,1842.256 V2304.303 Z';
  const rightUpperSidePath = 'M1424.654,2295.799 H1518.197 V2304.303 H1574.89 H1569.221 V1957.976 C1569.221,1947.139 1562.683,1937.316 1552.686,1933.133 L1500.419,1911.266 C1497.928,1910.224 1496.518,1907.567 1497.049,1904.92 C1497.58,1902.272 1499.907,1900.366 1502.607,1900.366 H1533.788 C1548.653,1900.366 1560.717,1888.302 1560.717,1873.437 V1842.256 C1560.717,1827.391 1548.653,1815.327 1533.788,1815.327 H1451.583 C1436.718,1815.327 1424.654,1827.391 1424.654,1842.256 V2226.35 H1441.662 C1447.921,2226.35 1453.001,2231.43 1453.001,2237.689 V2267.453 Z';
  const leftLowerSidePath = 'M106.544,3018.634 H163.237 V3027.138 H256.78 V3348.242 C256.78,3362.671 244.716,3374.382 229.851,3374.382 H106.544 V3029.059 Z';
  const leftSideWallPath = 'M106.544,2304.303 H256.78 V3037.059 H106.544 Z';
  const regionPaths = [
    // Upper center rim: bounded by production cuts plus fold edges.
    'M228.434,2267.453 L256.78,2295.799 H1424.654 L1453.001,2267.453 V2237.689 C1453.001,2231.43 1447.921,2226.35 1441.662,2226.35 H1257.41 C1254.281,2226.35 1251.741,2223.81 1251.741,2220.681 V2223.516 H429.694 V2220.681 C429.694,2223.81 427.154,2226.35 424.024,2226.35 H239.773 C233.514,2226.35 228.434,2231.43 228.434,2237.689 Z',
    // Center latch/lip band between the upper tray wall and body wall.
    'M163.237,2295.799 H1518.197 V2304.303 H163.237 Z',
    // Left hook/side panel. Keep the source curves so the white fill stays inside the red path.
    leftUpperSidePath,
    // Right hook/side panel follows the source right-hand cut, which is not a perfect mirror of the left hook.
    rightUpperSidePath,
    // Lower left side panel.
    leftLowerSidePath,
    // Side wall face between upper and lower hook panels.
    leftSideWallPath
  ];
  const fills = regionPaths.map(d => S001_buildMappedSourcePath(spec, d));
  const mirror = S001_mirrorSourceMapper(mirrorAxisX);
  fills.push(S001_buildMappedSourcePath(spec, leftLowerSidePath, mirror));
  fills.push(S001_buildMappedSourcePath(spec, leftSideWallPath, mirror));
  return fills;
}

function S001_flattenPathD(d) {
  const parsed = S001_parseAbsolutePath(d);
  if (!parsed.start) return [];
  const points = [{ x: parsed.start.x, y: parsed.start.y }];
  parsed.segments.forEach(segment => {
    if (segment.type === 'L') {
      points.push({ x: segment.to.x, y: segment.to.y });
    } else {
      const control = S001_segmentLength(segment);
      const steps = Math.max(8, Math.min(48, Math.ceil(control / 16)));
      for (let i = 1; i <= steps; i += 1) {
        points.push(S001_cubicPoint(segment.from, segment.c1, segment.c2, segment.to, i / steps));
      }
    }
  });
  return points.filter((point, index) => index === 0 || S001_distance(point, points[index - 1]) > 0.01);
}

function S001_polygonBounds(points) {
  const xs = points.map(point => point.x);
  const ys = points.map(point => point.y);
  return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
}

function S001_polygonArea(points) {
  let area = 0;
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    area += a.x * b.y - b.x * a.y;
  }
  return area / 2;
}

function S001_polygonToPath(points) {
  if (!points.length) return '';
  return points.map((point, index) =>
    (index === 0 ? 'M ' : 'L ') + S001_num(point.x) + ' ' + S001_num(point.y)
  ).join(' ') + ' Z';
}

function S001_lineIntersection(a1, a2, b1, b2) {
  const den = (a1.x - a2.x) * (b1.y - b2.y) - (a1.y - a2.y) * (b1.x - b2.x);
  if (Math.abs(den) < 0.000001) return null;
  return {
    x: ((a1.x * a2.y - a1.y * a2.x) * (b1.x - b2.x) - (a1.x - a2.x) * (b1.x * b2.y - b1.y * b2.x)) / den,
    y: ((a1.x * a2.y - a1.y * a2.x) * (b1.y - b2.y) - (a1.y - a2.y) * (b1.x * b2.y - b1.y * b2.x)) / den
  };
}

function S001_offsetPolygonFallback(points, offset) {
  if (points.length < 3) return null;
  const baseBounds = S001_polygonBounds(points);

  function offsetWithSide(side) {
    const shifted = [];
    for (let i = 0; i < points.length; i += 1) {
      const prev = points[(i - 1 + points.length) % points.length];
      const curr = points[i];
      const next = points[(i + 1) % points.length];
      const pDx = curr.x - prev.x;
      const pDy = curr.y - prev.y;
      const nDx = next.x - curr.x;
      const nDy = next.y - curr.y;
      const pLen = Math.sqrt(pDx * pDx + pDy * pDy) || 1;
      const nLen = Math.sqrt(nDx * nDx + nDy * nDy) || 1;
      const pNormal = { x: (-pDy / pLen) * side, y: (pDx / pLen) * side };
      const nNormal = { x: (-nDy / nLen) * side, y: (nDx / nLen) * side };
      const a1 = { x: prev.x + pNormal.x * offset, y: prev.y + pNormal.y * offset };
      const a2 = { x: curr.x + pNormal.x * offset, y: curr.y + pNormal.y * offset };
      const b1 = { x: curr.x + nNormal.x * offset, y: curr.y + nNormal.y * offset };
      const b2 = { x: next.x + nNormal.x * offset, y: next.y + nNormal.y * offset };
      let point = S001_lineIntersection(a1, a2, b1, b2);
      if (!point || S001_distance(point, curr) > offset * 10) {
        const mx = pNormal.x + nNormal.x;
        const my = pNormal.y + nNormal.y;
        const mLen = Math.sqrt(mx * mx + my * my) || 1;
        point = { x: curr.x + (mx / mLen) * offset, y: curr.y + (my / mLen) * offset };
      }
      shifted.push(point);
    }
    return shifted;
  }

  function expansionScore(candidate) {
    const bounds = S001_polygonBounds(candidate);
    return (baseBounds.minX - bounds.minX) + (baseBounds.minY - bounds.minY) +
      (bounds.maxX - baseBounds.maxX) + (bounds.maxY - baseBounds.maxY);
  }

  const a = offsetWithSide(1);
  const b = offsetWithSide(-1);
  return expansionScore(a) >= expansionScore(b) ? a : b;
}

function S001_buildBleedPathFromCut(fillPath) {
  const points = S001_flattenPathD(fillPath);
  const offsetPoints = S001_offsetPolygonFallback(points, S001_BLEED_OFFSET_MM * S001_UNIT_PER_MM);
  if (!offsetPoints) return '';
  const result = S001_polygonArea(offsetPoints) > 0 ? offsetPoints.slice().reverse() : offsetPoints;
  return S001_polygonToPath(result);
}

function S001_boundsFromPaths(paths) {
  const xs = [];
  const ys = [];
  paths.forEach(path => {
    const nums = String(path || '').match(/-?\d+(?:\.\d+)?/g) || [];
    for (let i = 0; i < nums.length - 1; i += 2) {
      xs.push(Number(nums[i]));
      ys.push(Number(nums[i + 1]));
    }
  });
  if (!xs.length) return { minX: 0, minY: 0, maxX: 100, maxY: 100, width: 100, height: 100 };
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

function S001_getDefaultConfig() {
  const spec = typeof S001_SPEC !== 'undefined' ? S001_SPEC : {};
  const product = spec.defaultProductSize || spec.product || { W: 298, D: 61, H: 292 };
  const clearance = spec.clearance || {};
  const material = spec.material || {};
  return {
    W: product.W,
    D: product.D,
    H: product.H,
    productW: product.W,
    productD: product.D,
    productH: product.H,
    productGap: clearance.productGap ?? 1.0,
    padGap: clearance.padGap ?? 1.0,
    trayGap: clearance.trayGap ?? 1.0,
    slideGap: clearance.slideGap ?? 1.5,
    paperThickness: material.paperThickness ?? 0.4,
    insertPadEnabled: true,
    showOuterSleeve: true,
    showInnerTray: true,
    showInsertPad: true,
    viewMode: 'All Parts',
    outerStringHoleEnabled: true,
    outerMainHoleDia: 22,
    outerSmallHoleDia: 6,
    outerHoleOffsetY: 0
  };
}

function S001_getClearanceConfig(cfg) {
  const c = Object.assign(S001_getDefaultConfig(), cfg || {});
  return {
    productGap: Number(c.productGap) || 0,
    padGap: Number(c.padGap) || 0,
    trayGap: Number(c.trayGap) || 0,
    slideGap: Number(c.slideGap) || 0,
    paperThickness: Number(c.paperThickness) || 0
  };
}

function S001_getOuterSpec(cfg) {
  const c = Object.assign(S001_getDefaultConfig(), cfg || {});
  const W = Number(c.W ?? c.productW) || 298;
  const D = Number(c.D ?? c.productD) || 61;
  const H = Number(c.H ?? c.productH) || 292;
  const sx = [399.037, 469.903, 1314.628, 1487.541, 2332.265, 2500.927];
  const sy = [308.558, 436.117, 504.149, 1263.834, 1406.984];
  const dScale = D / 61;
  const tx0 = sx[0];
  const tx1 = tx0 + (sx[1] - sx[0]) * dScale;
  const tx2 = tx1 + W * S001_UNIT_PER_MM;
  const tx3 = tx2 + D * S001_UNIT_PER_MM;
  const tx4 = tx3 + W * S001_UNIT_PER_MM;
  const tx5 = tx4 + (sx[5] - sx[4]) * dScale;
  const ty0 = sy[0];
  const ty1 = ty0 + (sy[1] - sy[0]) * dScale;
  const ty2 = ty1 + (sy[2] - sy[1]) * dScale;
  const ty3 = ty1 + H * S001_UNIT_PER_MM;
  const ty4 = ty3 + (sy[4] - sy[3]) * dScale;
  return {
    key: 'outerSleeve',
    label: 'Outer Sleeve',
    W, D, H,
    outerStringHoleEnabled: c.outerStringHoleEnabled !== false,
    outerMainHoleDia: Number(c.outerMainHoleDia) || 22,
    outerSmallHoleDia: Number(c.outerSmallHoleDia) || 6,
    outerHoleOffsetY: Number(c.outerHoleOffsetY) || 0,
    sourceX: sx,
    sourceY: sy,
    targetX: [tx0, tx1, tx2, tx3, tx4, tx5],
    targetY: [ty0, ty1, ty2, ty3, ty4]
  };
}

function S001_getStructureScale(outerSpec) {
  const ratios = [
    outerSpec.W / 298,
    outerSpec.D / 61,
    outerSpec.H / 292
  ].filter(Number.isFinite);
  return S001_clamp(Math.min(1, ...ratios), 0.2, 1);
}

function S001_getInnerSpec(outerSpec, clearance) {
  const structureScale = S001_getStructureScale(outerSpec);
  const baseWGap = 8 * structureScale;
  const baseDGap = 6 * structureScale;
  const baseHGap = 4 * structureScale;
  const clearanceDelta = (clearance.slideGap - 1.5) + (clearance.trayGap - 1.0) + (clearance.paperThickness - 0.4);
  const scaledClearanceDelta = clearanceDelta * structureScale;
  const W = Math.max(20, outerSpec.W - baseWGap - scaledClearanceDelta * 2);
  const D = Math.max(6, outerSpec.D - baseDGap - scaledClearanceDelta);
  const H = Math.max(20, outerSpec.H - baseHGap - scaledClearanceDelta * 2);
  const sx = [106.544, 256.78, 429.694, 1251.741, 1407.646, 1424.654, 1574.89];
  const sy = [1758.634, 1829.5, 1985.406, 2061.941, 2226.351, 2304.303, 3039.894, 3218.477, 3374.382];
  const k = S001_UNIT_PER_MM;
  const yScale = H / 288;
  const tx2 = sx[2];
  const sideHook = Math.max(4 * structureScale, D - 2 * structureScale);
  const sideSpacer = 6 * structureScale;
  const tx1 = tx2 - (D + sideSpacer) * k;
  const tx0 = tx1 - sideHook * k;
  const tx3 = tx2 + W * k;
  const tx4 = tx3 + D * k;
  const tx5 = tx4 + sideSpacer * k;
  const tx6 = tx5 + sideHook * k;
  return {
    key: 'innerTray',
    label: 'Inner Tray',
    W, D, H,
    structureScale,
    sourceX: sx,
    sourceY: sy,
    targetX: [tx0, tx1, tx2, tx3, tx4, tx5, tx6],
    targetY: sy.map(y => sy[0] + (y - sy[0]) * yScale)
  };
}

function S001_getInsertSpec(innerSpec, clearance, cfg) {
  const c = Object.assign(S001_getDefaultConfig(), cfg || {});
  const structureScale = innerSpec.structureScale ?? 1;
  const gapDelta = ((clearance.padGap - 1.0) + (clearance.productGap - 1.0)) * structureScale;
  const productFit = typeof S001_runProductFitPreset === 'function'
    ? S001_runProductFitPreset(c.productFitPreset || 'baseline')
    : null;
  const calculatedW = Math.max(20, innerSpec.W - 16 * structureScale - gapDelta * 2);
  const D = Math.max(4, innerSpec.D - 27 * structureScale - gapDelta);
  const calculatedH = Math.max(20, innerSpec.H - 38 * structureScale - gapDelta * 2);
  const W = productFit ? productFit.insert.width : calculatedW;
  const H = productFit ? productFit.insert.height : calculatedH;
  const sx = [1814.913, 1894.283, 1908.456, 1950.976, 2106.881, 2206.094, 2359.165, 2458.377, 2614.283, 2656.803, 2670.976, 2750.346];
  const sy = [2135.677, 2215.047, 2229.221, 2271.74, 2469.912, 2597.724, 2787.646, 2867.016, 2909.536, 2923.709, 3003.079];
  const k = S001_UNIT_PER_MM;
  const sourceFoldLeft = 1894.283;
  const sourceFoldRight = 2670.976;
  const sourceOuterLeft = 1814.913;
  const sourceOuterRight = 2750.346;
  const sourceFoldTop = 2215.047;
  const sourceFoldBottom = 2923.709;
  const sourceOuterTop = 2135.677;
  const sourceOuterBottom = 3003.079;
  const targetFoldLeft = sourceFoldLeft;
  const targetFoldTop = sourceFoldTop;
  const targetFoldRight = targetFoldLeft + W * k;
  const targetOuterLeft = targetFoldLeft - D * k;
  const targetOuterRight = targetFoldRight + D * k;
  const targetFoldBottom = targetFoldTop + H * k;
  const targetOuterTop = targetFoldTop - D * k;
  const targetOuterBottom = targetFoldBottom + D * k;
  const scaleSegment = (value, a1, a2, b1, b2) => b1 + (value - a1) * ((b2 - b1) / (a2 - a1));
  const tx = sx.map(x => {
    if (x <= sourceFoldLeft) return scaleSegment(x, sourceOuterLeft, sourceFoldLeft, targetOuterLeft, targetFoldLeft);
    if (x >= sourceFoldRight) return scaleSegment(x, sourceFoldRight, sourceOuterRight, targetFoldRight, targetOuterRight);
    return scaleSegment(x, sourceFoldLeft, sourceFoldRight, targetFoldLeft, targetFoldRight);
  });
  const ty = sy.map(y => {
    if (y <= sourceFoldTop) return scaleSegment(y, sourceOuterTop, sourceFoldTop, targetOuterTop, targetFoldTop);
    if (y >= sourceFoldBottom) return scaleSegment(y, sourceFoldBottom, sourceOuterBottom, targetFoldBottom, targetOuterBottom);
    return scaleSegment(y, sourceFoldTop, sourceFoldBottom, targetFoldTop, targetFoldBottom);
  });
  return {
    key: 'insertPad',
    label: 'Insert Pad',
    W, D, H,
    productFitPreset: c.productFitPreset || 'baseline',
    productFit,
    holeCount: Math.max(1, Math.round(Number(c.holeCount) || 3)),
    sourceX: sx,
    sourceY: sy,
    targetX: tx,
    targetY: ty
  };
}

function S001_buildProductFitHoleElements(spec) {
  if (!spec.productFit || spec.productFitPreset === 'baseline') return null;
  const foldLeftIndex = spec.sourceX.indexOf(1894.283);
  const foldTopIndex = spec.sourceY.indexOf(2215.047);
  const originX = spec.targetX[foldLeftIndex];
  const originY = spec.targetY[foldTopIndex];
  return spec.productFit.placedProductObjects.map(product => {
    const d = product.cutPath.commands.map(command => {
      if (command[0] === 'Z') return 'Z';
      const values = [];
      for (let index = 1; index < command.length; index += 2) {
        values.push(S001_num(originX + command[index] * S001_UNIT_PER_MM));
        values.push(S001_num(originY + command[index + 1] * S001_UNIT_PER_MM));
      }
      return command[0] + ' ' + values.join(' ');
    }).join(' ');
    return { kind: 'path', d, productInstanceId: product.instanceId };
  });
}

function S001_buildPartGeometry(spec) {
  const mapper = S001_createMapper(spec);
  const source = S001_SOURCE_PARTS[spec.key];
  const rawCut = source.cut.map(element => S001_transformElementToPath(element, mapper)).filter(Boolean);
  const partitioned = S001_partitionCutElements(rawCut);
  const foldElements = source.fold.map(element => S001_transformElementToPath(element, mapper)).filter(Boolean);
  const cutElements = spec.key === 'innerTray'
    ? partitioned.cutElements.concat(partitioned.holeElements)
    : partitioned.cutElements;
  const productFitHoleElements = spec.key === 'insertPad'
    ? S001_buildProductFitHoleElements(spec)
    : null;
  const holeElements = spec.key === 'innerTray'
    ? []
    : spec.key === 'outerSleeve'
    ? S001_buildStableHoleElements(partitioned.holeGroups, spec)
    : productFitHoleElements || partitioned.holeElements
    ;
  const fillGroups = partitioned.cutGroups && partitioned.cutGroups.length
    ? partitioned.cutGroups
    : [cutElements];
  const fillPaths = fillGroups.map(group => S001_buildCutFillPath(group)).filter(Boolean)
    .concat(S001_buildInnerFillClosures(spec))
    .filter(Boolean);
  const fillPath = fillPaths.join(' ');
  const sourceBleed = spec.key === 'outerSleeve'
    ? S001_OUTER_SOURCE_BLEED
    : spec.key === 'innerTray'
    ? S001_INNER_SOURCE_BLEED
    : spec.key === 'insertPad'
    ? S001_INSERT_SOURCE_BLEED
    : (source.bleed || []);
  const bleedElements = sourceBleed.map(element => S001_transformElementToPath(element, mapper)).filter(Boolean);
  const bleedPath = bleedElements.length
    ? bleedElements.map(element => element.d).join(' ')
    : (fillPath ? S001_buildBleedPathFromCut(fillPath) : '');
  const bounds = S001_boundsFromPaths([fillPath, bleedPath].concat(
    cutElements.map(element => element.d),
    foldElements.map(element => element.d),
    holeElements.map(element => element.d)
  ));
  return {
    key: spec.key,
    label: spec.label,
    spec,
    cutElements,
    holeElements,
    foldElements,
    fillPaths,
    fillPath,
    bleedPath,
    bounds
  };
}

function S001_buildOuterGeometry(spec) {
  return S001_buildPartGeometry(spec);
}

function S001_buildInnerGeometry(spec) {
  return S001_buildPartGeometry(spec);
}

function S001_buildInsertGeometry(spec) {
  return S001_buildPartGeometry(spec);
}

function S001_translatePart(part, x, y) {
  return Object.assign({}, part, {
    transform: { x, y },
    placedBounds: {
      minX: part.bounds.minX + x,
      minY: part.bounds.minY + y,
      maxX: part.bounds.maxX + x,
      maxY: part.bounds.maxY + y,
      width: part.bounds.width,
      height: part.bounds.height
    }
  });
}

function S001_unionBounds(parts) {
  const visible = parts.filter(part => part && part.placedBounds);
  if (!visible.length) return { minX: 0, minY: 0, maxX: 100, maxY: 100, width: 100, height: 100 };
  const minX = Math.min(...visible.map(part => part.placedBounds.minX));
  const minY = Math.min(...visible.map(part => part.placedBounds.minY));
  const maxX = Math.max(...visible.map(part => part.placedBounds.maxX));
  const maxY = Math.max(...visible.map(part => part.placedBounds.maxY));
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

function S001_unionPlacedBleedBounds(parts) {
  const placed = parts.map(part => {
    const local = part?.bleedPath ? S001_parsedPathBounds(S001_parseAbsolutePath(part.bleedPath)) : part?.bounds;
    if (!local) return null;
    const tx = part.transform?.x || 0;
    const ty = part.transform?.y || 0;
    return {
      placedBounds: {
        minX: local.minX + tx, minY: local.minY + ty,
        maxX: local.maxX + tx, maxY: local.maxY + ty,
        width: local.width, height: local.height
      }
    };
  });
  return S001_unionBounds(placed);
}

function S001_normalizeViewMode(value) {
  const mode = String(value || 'All Parts').toLowerCase();
  if (mode.indexOf('outer') >= 0) return 'outerSleeve';
  if (mode.indexOf('tray') >= 0 || mode.indexOf('inner') >= 0) return 'innerTray';
  if (mode.indexOf('insert') >= 0) return 'insertPad';
  return 'all';
}

function S001_arrangeParts(sourceParts, cfg) {
  const c = Object.assign(S001_getDefaultConfig(), cfg || {});
  const mode = S001_normalizeViewMode(c.viewMode);
  const gap = Math.max(120, sourceParts.outerSleeve.bounds.width * 0.07);
  const parts = [];

  if (mode === 'outerSleeve') {
    parts.push(S001_translatePart(sourceParts.outerSleeve, -sourceParts.outerSleeve.bounds.minX, -sourceParts.outerSleeve.bounds.minY));
  } else if (mode === 'innerTray') {
    parts.push(S001_translatePart(sourceParts.innerTray, -sourceParts.innerTray.bounds.minX, -sourceParts.innerTray.bounds.minY));
  } else if (mode === 'insertPad') {
    parts.push(S001_translatePart(sourceParts.insertPad, -sourceParts.insertPad.bounds.minX, -sourceParts.insertPad.bounds.minY));
  } else {
    const outer = S001_translatePart(sourceParts.outerSleeve, -sourceParts.outerSleeve.bounds.minX, -sourceParts.outerSleeve.bounds.minY);
    const rowY = outer.placedBounds.maxY + gap;
    const inner = S001_translatePart(sourceParts.innerTray, -sourceParts.innerTray.bounds.minX, rowY - sourceParts.innerTray.bounds.minY);
    const insert = S001_translatePart(sourceParts.insertPad, inner.placedBounds.maxX + gap - sourceParts.insertPad.bounds.minX, rowY - sourceParts.insertPad.bounds.minY);
    // Assembly layout and bounds always contain every required component.
    // Preview visibility is handled by the renderer only.
    parts.push(outer, inner, insert);
  }

  return { parts, bounds: S001_unionBounds(parts), viewMode: mode };
}

function S001_getLayout(cfg, appState) {
  const stateCfg = appState || {};
  const c = Object.assign(S001_getDefaultConfig(), cfg || {}, {
    viewMode: cfg?.viewMode ?? stateCfg.sViewMode ?? stateCfg.viewMode ?? cfg?.sViewMode,
    showOuterSleeve: cfg?.showOuterSleeve ?? stateCfg.showOuterSleeve,
    showInnerTray: cfg?.showInnerTray ?? stateCfg.showInnerTray,
    showInsertPad: cfg?.showInsertPad ?? stateCfg.showInsertPad,
    insertPadEnabled: cfg?.insertPadEnabled ?? stateCfg.insertPadEnabled
  });
  const clearance = S001_getClearanceConfig(c);
  const outerSpec = S001_getOuterSpec(c);
  const innerSpec = S001_getInnerSpec(outerSpec, clearance);
  const insertSpec = S001_getInsertSpec(innerSpec, clearance, c);
  const rawParts = {
    outerSleeve: S001_buildOuterGeometry(outerSpec),
    innerTray: S001_buildInnerGeometry(innerSpec),
    insertPad: S001_buildInsertGeometry(insertSpec)
  };
  const arranged = S001_arrangeParts(rawParts, c);
  const componentMetrics = Object.fromEntries(Object.entries(rawParts).map(([key, part]) => {
    const bleed = part.bleedPath
      ? S001_parsedPathBounds(S001_parseAbsolutePath(part.bleedPath))
      : part.bounds;
    return [key, { dieline: part.bounds, bleed: bleed || part.bounds }];
  }));
  return {
    engineKey: 'sSeries',
    variantKey: 'S001',
    cfg: c,
    clearance,
    specs: { outer: outerSpec, inner: innerSpec, insert: insertSpec },
    rawParts,
    componentMetrics,
    parts: arranged.parts,
    bounds: arranged.bounds,
    dielineBounds: arranged.bounds,
    bleedBounds: S001_unionPlacedBleedBounds(arranged.parts),
    viewMode: arranged.viewMode
  };
}

if (typeof window !== 'undefined') {
  window.S001_getDefaultConfig = S001_getDefaultConfig;
  window.S001_getClearanceConfig = S001_getClearanceConfig;
  window.S001_getOuterSpec = S001_getOuterSpec;
  window.S001_getInnerSpec = S001_getInnerSpec;
  window.S001_getInsertSpec = S001_getInsertSpec;
  window.S001_buildOuterGeometry = S001_buildOuterGeometry;
  window.S001_buildInnerGeometry = S001_buildInnerGeometry;
  window.S001_buildInsertGeometry = S001_buildInsertGeometry;
  window.S001_getLayout = S001_getLayout;
}
