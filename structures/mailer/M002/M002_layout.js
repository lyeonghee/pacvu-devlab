// ============================================================
// M002_layout.js - SVG-based layout data for G-style Mailer Box 2
// Source geometry extracted from M002 SVG.
// ============================================================

function M002_getLayout(W, D, H) {
  var spec = M002_getSpec(W, D, H);
  var cutElements = [
    `<line x1="338.792" y1="2302.154" x2="564.146" y2="2302.154" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<polyline points="569.815 2526.09 561.311 2523.256 185.721 2523.256" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<path d="M158.792,2496.327c0,14.865,12.064,26.929,26.929,26.929" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<polyline points="158.792 2496.327 158.792 2319.161 564.146 2313.492" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<line x1="1683.831" y1="2526.09" x2="569.815" y2="2526.09" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<path d="M564.146,2313.492c3.129,0,5.669-2.54,5.669-5.669s-2.54-5.669-5.669-5.669" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<polyline points="109.185 2296.484 324.619 2296.484 338.792 2302.154" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<path d="M1689.5,2302.154c-3.13,0-5.669,2.54-5.669,5.669s2.54,5.669,5.669,5.669" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<path d="M1695.17,1417.744c-3.13,0-5.669,2.54-5.669,5.669s2.54,5.669,5.669,5.669" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<polyline points="1689.5 2313.492 2094.854 2319.161 2094.854 2496.327" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<path d="M2067.925,2523.256c14.865,0,26.929-12.064,26.929-26.929" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<polyline points="2067.925 2523.256 1692.335 2523.256 1683.831 2526.09" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<line x1="1914.854" y1="2302.154" x2="1689.5" y2="2302.154" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<line x1="1914.854" y1="1429.083" x2="1695.17" y2="1429.083" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<polyline points="2144.461 2296.484 1929.028 2296.484 1914.854 2302.154" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<polyline points="2144.461 1434.752 1929.028 1434.752 1914.854 1429.083" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<polyline points="2144.461 2296.484 2144.461 2168.926 2158.634 2165.128 2158.634 2016.817 2144.461 2013.019 2144.461 1718.217 2158.634 1714.419 2158.634 1566.109 2144.461 1562.311 2144.461 1434.752" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<line x1="2100.524" y1="1412.075" x2="1695.17" y2="1417.744" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<line x1="1686.666" y1="1210.815" x2="2073.595" y2="1210.815" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<path d="M2100.524,1237.744c0-14.865-12.064-26.929-26.929-26.929" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<line x1="2100.524" y1="1237.744" x2="2100.524" y2="1412.075" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<path d="M558.477,1429.083c3.129,0,5.669-2.54,5.669-5.669s-2.54-5.669-5.669-5.669" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<line x1="558.477" y1="1417.744" x2="153.123" y2="1412.075" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<line x1="338.792" y1="1429.083" x2="558.477" y2="1429.083" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<polyline points="109.185 1434.752 324.619 1434.752 338.792 1429.083" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<polyline points="108.504 2296.484 108.504 2169.051 94.331 2165.257 94.331 2017.092 108.504 2013.298 108.504 1718.785 94.331 1714.991 94.331 1566.826 108.504 1563.032 108.504 1435.599" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<line x1="153.123" y1="1412.075" x2="153.123" y2="1237.744" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<path d="M180.051,1210.815c-14.865,0-26.929,12.064-26.929,26.929" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<line x1="180.051" y1="1210.815" x2="566.981" y2="1210.815" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<path d="M566.981,1210.815c3.557,0,6.562-2.635,7.026-6.162.464-3.526-1.757-6.849-5.192-7.77l-186.019-49.844" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<path d="M358.634,1115.552c0,14.741,9.922,27.672,24.161,31.488" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<line x1="358.634" y1="1115.552" x2="358.634" y2="410.33" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<path d="M382.796,378.842c-14.239,3.815-24.161,16.747-24.161,31.488" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<path d="M382.796,378.842l186.019-49.844c3.435-.92,5.656-4.244,5.192-7.77-.464-3.526-3.469-6.162-7.026-6.162h-154.222" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<path d="M366.763,252.506c-4.578,14.653-1.922,30.549,7.171,42.917,9.093,12.368,23.474,19.644,38.825,19.644" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<path d="M566.981,105.303c-91.599,0-172.898,59.773-200.218,147.203" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<polyline points="566.981 105.303 566.981 99.634 1686.666 99.634 1686.666 105.303" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<path d="M1886.883,252.506c-27.319-87.43-108.619-147.203-200.217-147.203" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<path d="M1840.887,315.067c15.351,0,29.732-7.276,38.825-19.644,9.093-12.368,11.749-28.264,7.171-42.917" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<path d="M1840.887,315.067h-154.222c-3.557,0-6.562,2.635-7.026,6.162-.464,3.526,1.756,6.85,5.192,7.77l186.019,49.844" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<path d="M1895.012,410.33c0-14.741-9.923-27.672-24.161-31.488" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<line x1="1895.012" y1="410.33" x2="1895.012" y2="1115.552" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<path d="M1870.851,1147.04c14.239-3.815,24.161-16.747,24.161-31.488" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
    `<path d="M1870.851,1147.04l-186.019,49.844c-3.435.921-5.656,4.244-5.192,7.77.464,3.526,3.469,6.162,7.026,6.162" fill="none" stroke="#cb2026" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`
  ];
  var foldElements = [
    `<line x1="569.815" y1="2526.09" x2="569.815" y2="2307.823" fill="none" stroke="#416eb5" stroke-dasharray="5.669 4.535" stroke-miterlimit="11.339" stroke-width=".992"/>`,
    `<line x1="1683.831" y1="2526.09" x2="1683.831" y2="2307.823" fill="none" stroke="#416eb5" stroke-dasharray="5.669 4.535" stroke-miterlimit="11.339" stroke-width=".992"/>`,
    `<line x1="564.146" y1="2302.154" x2="1689.5" y2="2302.154" fill="none" stroke="#416eb5" stroke-dasharray="5.669 4.535" stroke-miterlimit="11.339" stroke-width=".992"/>`,
    `<line x1="558.477" y1="1429.083" x2="1695.169" y2="1429.083" fill="none" stroke="#416eb5" stroke-dasharray="5.669 4.535" stroke-miterlimit="11.339" stroke-width=".992"/>`,
    `<line x1="1929.028" y1="2296.484" x2="1929.028" y2="1434.752" fill="none" stroke="#416eb5" stroke-dasharray="5.669 4.535" stroke-miterlimit="11.339" stroke-width=".992"/>`,
    `<line x1="1914.854" y1="2302.154" x2="1914.854" y2="1429.083" fill="none" stroke="#416eb5" stroke-dasharray="5.669 4.535" stroke-miterlimit="11.339" stroke-width=".992"/>`,
    `<line x1="338.792" y1="2302.154" x2="338.792" y2="1429.083" fill="none" stroke="#416eb5" stroke-dasharray="5.669 4.535" stroke-miterlimit="11.339" stroke-width=".992"/>`,
    `<line x1="324.619" y1="2296.484" x2="324.619" y2="1434.752" fill="none" stroke="#416eb5" stroke-dasharray="5.669 4.535" stroke-miterlimit="11.339" stroke-width=".992"/>`,
    `<line x1="559.894" y1="2302.154" x2="559.894" y2="2161.838" fill="none" stroke="#416eb5" stroke-dasharray="5.669 4.535" stroke-miterlimit="11.339" stroke-width=".992"/>`,
    `<line x1="559.894" y1="2020.106" x2="559.894" y2="1711.13" fill="none" stroke="#416eb5" stroke-dasharray="5.669 4.535" stroke-miterlimit="11.339" stroke-width=".992"/>`,
    `<line x1="559.894" y1="1569.398" x2="559.894" y2="1429.083" fill="none" stroke="#416eb5" stroke-dasharray="5.669 4.535" stroke-miterlimit="11.339" stroke-width=".992"/>`,
    `<line x1="1693.752" y1="2302.154" x2="1693.752" y2="2161.838" fill="none" stroke="#416eb5" stroke-dasharray="5.669 4.535" stroke-miterlimit="11.339" stroke-width=".992"/>`,
    `<line x1="1693.752" y1="2020.106" x2="1693.752" y2="1711.13" fill="none" stroke="#416eb5" stroke-dasharray="5.669 4.535" stroke-miterlimit="11.339" stroke-width=".992"/>`,
    `<line x1="1693.752" y1="1569.398" x2="1693.752" y2="1429.083" fill="none" stroke="#416eb5" stroke-dasharray="5.669 4.535" stroke-miterlimit="11.339" stroke-width=".992"/>`,
    `<line x1="1689.5" y1="1210.815" x2="1689.5" y2="1423.413" fill="none" stroke="#416eb5" stroke-dasharray="5.669 4.535" stroke-miterlimit="11.339" stroke-width=".992"/>`,
    `<line x1="564.146" y1="1210.815" x2="564.146" y2="1423.413" fill="none" stroke="#416eb5" stroke-dasharray="5.669 4.535" stroke-miterlimit="11.339" stroke-width=".992"/>`,
    `<line x1="1679.579" y1="1202.311" x2="574.067" y2="1202.311" fill="none" stroke="#416eb5" stroke-dasharray="5.669 4.535" stroke-miterlimit="11.339" stroke-width=".992"/>`,
    `<line x1="574.067" y1="1203.728" x2="574.067" y2="322.154" fill="none" stroke="#416eb5" stroke-dasharray="5.669 4.535" stroke-miterlimit="11.339" stroke-width=".992"/>`,
    `<line x1="574.067" y1="323.571" x2="1679.579" y2="323.571" fill="none" stroke="#416eb5" stroke-dasharray="5.669 4.535" stroke-miterlimit="11.339" stroke-width=".992"/>`,
    `<line x1="1679.579" y1="1203.728" x2="1679.579" y2="322.154" fill="none" stroke="#416eb5" stroke-dasharray="5.669 4.535" stroke-miterlimit="11.339" stroke-width=".992"/>`,
    `<line x1="566.981" y1="315.067" x2="566.981" y2="105.303" fill="none" stroke="#416eb5" stroke-dasharray="5.669 4.535" stroke-miterlimit="11.339" stroke-width=".992"/>`,
    `<line x1="1686.666" y1="315.067" x2="1686.666" y2="105.303" fill="none" stroke="#416eb5" stroke-dasharray="5.669 4.535" stroke-miterlimit="11.339" stroke-width=".992"/>`
  ];
  var greenElements = [
    `<path d="M559.894,2161.838c0,3.912,3.175,7.087,7.087,7.087s7.086-3.176,7.086-7.087v-141.732c0-3.912-3.175-7.087-7.086-7.087s-7.087,3.175-7.087,7.087v141.732" fill="none" stroke="#209050" stroke-miterlimit="11.339" stroke-width="1.276"/>`,
    `<path d="M559.894,1711.13c0,3.912,3.175,7.087,7.087,7.087s7.086-3.175,7.086-7.087v-141.732c0-3.912-3.175-7.087-7.086-7.087s-7.087,3.175-7.087,7.087v141.732" fill="none" stroke="#209050" stroke-miterlimit="11.339" stroke-width="1.276"/>`,
    `<path d="M1679.579,2161.838c0,3.912,3.175,7.087,7.086,7.087s7.087-3.176,7.087-7.087v-141.732c0-3.912-3.175-7.087-7.087-7.087s-7.086,3.175-7.086,7.087v141.732" fill="none" stroke="#209050" stroke-miterlimit="11.339" stroke-width="1.276"/>`,
    `<path d="M1679.579,1711.13c0,3.912,3.175,7.087,7.086,7.087s7.087-3.175,7.087-7.087v-141.732c0-3.912-3.175-7.087-7.087-7.087s-7.086,3.175-7.086,7.087v141.732" fill="none" stroke="#209050" stroke-miterlimit="11.339" stroke-width="1.276"/>`,
    `<line x1="785.248" y1="1351.13" x2="856.114" y2="1351.13" fill="none" stroke="#209050" stroke-miterlimit="11.339" stroke-width="1.276"/>`,
    `<line x1="785.248" y1="1280.264" x2="856.114" y2="1280.264" fill="none" stroke="#209050" stroke-miterlimit="11.339" stroke-width="1.276"/>`,
    `<path d="M785.248,1280.264c-19.559,0-35.433,15.874-35.433,35.433s15.874,35.433,35.433,35.433" fill="none" stroke="#209050" stroke-miterlimit="11.339" stroke-width="1.276"/>`,
    `<path d="M856.114,1351.13c19.559,0,35.433-15.874,35.433-35.433s-15.874-35.433-35.433-35.433" fill="none" stroke="#209050" stroke-miterlimit="11.339" stroke-width="1.276"/>`,
    `<line x1="1468.398" y1="1351.13" x2="1397.532" y2="1351.13" fill="none" stroke="#209050" stroke-miterlimit="11.339" stroke-width="1.276"/>`,
    `<line x1="1468.398" y1="1280.264" x2="1397.532" y2="1280.264" fill="none" stroke="#209050" stroke-miterlimit="11.339" stroke-width="1.276"/>`,
    `<path d="M1468.398,1351.13c19.559,0,35.433-15.874,35.433-35.433s-15.874-35.433-35.433-35.433" fill="none" stroke="#209050" stroke-miterlimit="11.339" stroke-width="1.276"/>`,
    `<path d="M1397.532,1280.264c-19.559,0-35.433,15.874-35.433,35.433s15.874,35.433,35.433,35.433" fill="none" stroke="#209050" stroke-miterlimit="11.339" stroke-width="1.276"/>`
  ];
  var bleedElement = `<path d="M1684.172,2533.629H570.156c-.914,0-1.822-.147-2.689-.436l-7.196-2.399H186.061c-19.538,0-35.433-15.896-35.433-35.433l.629-191.147c-4.728.128-35.748.177-42.413-.192-4.696,0-8.504-3.808-8.504-8.504v-120.906l-7.868-2.106c-3.719-.996-6.305-4.365-6.305-8.215v-148.164c0-3.85,2.586-7.219,6.305-8.215l7.868-2.106v-281.459l-7.868-2.106c-3.719-.996-6.305-4.365-6.305-8.215v-148.164c0-3.85,2.586-7.219,6.305-8.215l7.868-2.106v-120.907c0-2.215.847-4.231,2.234-5.745,1.539-2.181,4.079-3.604,6.951-3.604,0,0,25.15-1.87,35.433-1.87v-186.635c0-19.569,15.864-35.433,35.433-35.433h366.252c1.526,0,1.812-2.171.338-2.566l-166.046-44.492c-17.938-4.806-30.465-21.132-30.465-39.701V409.365c0-18.57,12.527-34.896,30.465-39.702l168.125-45.049c1.154-.309.93-2.008-.264-2.008h-135.697c-17.961,0-35.036-8.64-45.677-23.111-10.64-14.472-13.793-33.346-8.437-50.49,13.949-44.64,41.296-82.92,79.084-110.703,35.609-26.18,78.474-41.012,122.304-42.603,1.125-3.379-1.295-5.533,6.947-5.533h1124.075c1.813,0,.928,3.375,1.381,6.656,43.83,1.591,87.87,15.301,123.48,41.481,37.788,27.783,65.135,66.063,79.084,110.703,5.356,17.144,2.203,36.019-8.437,50.49-10.641,14.472-27.716,23.111-45.677,23.111h-137.344c-.941,0-1.117,1.338-.208,1.582l169.717,45.475c17.937,4.807,30.464,21.133,30.464,39.702v705.222c0,18.569-12.527,34.895-30.464,39.701l-166.342,44.959c-1.249.337-1.004,2.176.289,2.176l366.596-.077c19.569,0,35.433,15.864,35.433,35.433v188.33c14.546-.173,35.434.175,35.434.175,4.696,0,8.504,3.808,8.504,8.504v121.033l7.87,2.109c3.718.996,6.303,4.366,6.303,8.214v148.308c0,3.849-2.585,7.218-6.303,8.214l-7.87,2.109v281.752l7.871,2.11c3.717.996,6.302,4.365,6.302,8.214v148.311c0,3.849-2.585,7.217-6.302,8.214l-7.871,2.11v121.033c0,4.696-3.808,8.504-8.504,8.504,0,0-16.662.677-42.035.969l.933,190.37c0,19.537-15.895,35.433-35.433,35.433h-374.21l-7.196,2.399c-.867.289-1.775.436-2.689.436Z" fill="none" stroke="#4151a3" stroke-miterlimit="10" stroke-width="2"/>`;
  var labels = [{"name":"lidFront","x":1126.823,"y":226.561},{"name":"lid","x":1126.823,"y":762.941},{"name":"back","x":1126.823,"y":1324.909},{"name":"base","x":1126.823,"y":1916.23},{"name":"front","x":1126.823,"y":2441.073},{"name":"sidePanelLeft","x":438.792,"y":1910.35},{"name":"sidePanelRight","x":1815.097,"y":1910.35},{"name":"lidDustFlapLeft","x":450.792,"y":252.506},{"name":"lidDustFlapRight","x":1775.835,"y":246.025},{"name":"lidSideFlapLeft","x":450.792,"y":788.675},{"name":"lidSideFlapRight","x":1775.835,"y":793.877},{"name":"backInsertFlapLeft","x":350.997,"y":1324.909},{"name":"backInsertFlapRight","x":1865.352,"y":1325.269},{"name":"bottomLockFlapLeft","x":225.997,"y":1860},{"name":"bottomLockFlapRight","x":2047.079,"y":1860},{"name":"frontInsertFlapLeft","x":350.997,"y":2441.073},{"name":"frontInsertFlapRight","x":1865.352,"y":2441.073}];
  return { cutElements:cutElements, foldElements:foldElements, greenElements:greenElements, bleedElement:bleedElement, labels:labels, bounds:spec.bounds, transform:spec.transform, spec:spec };
}

// Preserve the extracted SVG payload while exposing an M001-compatible,
// structured geometry contract. Rendering can migrate one layer at a time
// without changing the approved M002 reference data above.
var M002_getSvgLayout = M002_getLayout;

M002_getLayout = function(W, D, H) {
  var legacy = M002_getSvgLayout(W, D, H);
  var cfg = M002_normalizeDimensions(W, D, H);
  var map = M002_referenceMapper(cfg);
  var fragments = legacy.cutElements.map(M002_fragmentPoints);
  var sourceCut = M002_chainFragments(fragments);
  var referenceSize=cfg.W===400&&cfg.D===308&&cfg.H===80;
  var mappedSourceCut=sourceCut.map(function(point) { return M002_mapFinalCutPoint(point, cfg, map); });
  // The reference size is the immutable SVG master. Resize rules are applied
  // only away from 400 x 308 x 80 so the approved source lock contour remains
  // coordinate-for-coordinate identical at its native size.
  var cutPoints = referenceSize?mappedSourceCut:M002_applyLockRule(mappedSourceCut, cfg);
  var foldMeta = M002_foldMetadata();
  var fold = legacy.foldElements.map(function(element, index) {
    var points = M002_fragmentPoints(element);
    return {
      id: foldMeta[index].id,
      type: 'line',
      a: map.point(points[0]),
      b: map.point(points[points.length - 1]),
      panelIds: foldMeta[index].panelIds.slice()
    };
  });
  var lockFeatures = M002_lockFeatures(cfg);
  fold = M002_applyInterruptedFolds(fold, cfg, lockFeatures);
  var slots = M002_buildSlots(cfg, lockFeatures);
  var locks = M002_buildLocks(cfg, lockFeatures);
  var insertionRelations = M002_buildInsertionRelations(slots, locks);
  var holes = M002_handleHoles(cfg, map);
  var panels = M002_buildPanels(cutPoints, cfg, fold);
  var foldRelations = M002_buildFoldRelations(fold);
  var dielineBounds = M002_polygonBounds(cutPoints);
  var cutPath = M002_polylinePath(cutPoints) + ' Z';
  var bleedPoints = referenceSize
    ? M002_cleanClosedPoints(M002_fragmentPoints(legacy.bleedElement).map(function(point){return map.point(point);} ))
    : M002_offsetClosedPolyline(cutPoints, cfg.bleed);
  var bleedPath = M002_polylinePath(bleedPoints) + ' Z';
  var bleedBounds = M002_polygonBounds(bleedPoints);
  var labels = legacy.labels.map(function(label) { return {name:label.name,x:map.x(label.x),y:map.y(label.y)}; });
  return Object.assign(legacy, {
    meta: { id:'M002', unit:'mm', referenceSize:{ W:400, D:308, H:80 }, isGlueFree:true },
    config: cfg,
    cut: [{ id:'cutPath', type:'polyline', points:cutPoints.concat([cutPoints[0]]), closed:true, d:cutPath }],
    cutPath: cutPath,
    fold: fold,
    foldLines: fold,
    bleed: [{id:'bleedPath',type:'polyline',points:bleedPoints.concat([bleedPoints[0]]),closed:true,offset:cfg.bleed,source:'cutPath',d:bleedPath}],
    bleedPath: bleedPath,
    bleedElement: null,
    holes: holes,
    slots: slots,
    locks: locks,
    insertionRelations: insertionRelations,
    panels: panels,
    foldRelations: foldRelations,
    dimensions: M002_dimensions(cfg),
    labels: labels,
    dielineBounds: dielineBounds,
    bleedBounds: bleedBounds,
    bounds: bleedBounds,
    geometryContract: 'final-cut-first'
  });
};

function M002_clipPolygon(source, axis, value, keepGreater) {
  var output=[],epsilon=.0001;
  var inside=function(point){return keepGreater?point[axis]>=value-epsilon:point[axis]<=value+epsilon;};
  for(var index=0;index<source.length;index++){
    var current=source[index],previous=source[(index+source.length-1)%source.length];
    var currentInside=inside(current),previousInside=inside(previous);
    if(currentInside!==previousInside){
      var delta=current[axis]-previous[axis],amount=Math.abs(delta)<epsilon?0:(value-previous[axis])/delta;
      output.push(M002_point(axis==='x'?value:previous.x+(current.x-previous.x)*amount,axis==='y'?value:previous.y+(current.y-previous.y)*amount));
    }
    if(currentInside)output.push(M002_point(current.x,current.y));
  }
  return M002_cleanClosedPoints(output);
}

function M002_panelFromRegion(id,cutPoints,region){
  var polygon=cutPoints.slice();
  if(Number.isFinite(region.minX))polygon=M002_clipPolygon(polygon,'x',region.minX,true);
  if(Number.isFinite(region.maxX))polygon=M002_clipPolygon(polygon,'x',region.maxX,false);
  if(Number.isFinite(region.minY))polygon=M002_clipPolygon(polygon,'y',region.minY,true);
  if(Number.isFinite(region.maxY))polygon=M002_clipPolygon(polygon,'y',region.maxY,false);
  var raw=M002_polygonBounds(polygon),bounds={x:raw.minX,y:raw.minY,width:raw.width,height:raw.height,minX:raw.minX,minY:raw.minY,maxX:raw.maxX,maxY:raw.maxY};
  return {id:id,polygon:polygon,bounds:bounds,origin:M002_point(bounds.x,bounds.y),localPolygon:polygon.map(function(point){return M002_point(point.x-bounds.x,point.y-bounds.y);})};
}

function M002_buildPanels(cutPoints,cfg,fold){
  var minX=Math.min.apply(null,cutPoints.map(function(p){return p.x;})),maxX=Math.max.apply(null,cutPoints.map(function(p){return p.x;}));
  function line(id){return fold.find(function(item){return item.id===id;});}
  function x(id){var item=line(id);return item?item.a.x:NaN;}
  function y(id){var item=line(id);return item?item.a.y:NaN;}
  var dustLeft=x('f-1L'),dustRight=x('f-1R'),lidLeft=x('f-3L'),lidRight=x('f-3R');
  var backLeft=x('f-5L'),backRight=x('f-5R'),frontLeft=x('f-9L'),frontRight=x('f-9R');
  var baseLeft=x('f-7L-3'),baseRight=x('f-7R-3'),sideOuterLeft=x('f-7L-2'),sideOuterRight=x('f-7R-2');
  var lockInnerLeft=x('f-7L-1'),lockInnerRight=x('f-7R-1');
  var y1=y('f-2'),y2=y('f-4'),y3=y('f-6'),y4=y('f-8'),y5=3*cfg.H+2*cfg.D;
  var regions={
    lidFront:{minX:dustLeft,maxX:dustRight,maxY:y1},lidDustFlapLeft:{maxX:dustLeft,maxY:y1},lidDustFlapRight:{minX:dustRight,maxY:y1},
    lid:{minX:lidLeft,maxX:lidRight,minY:y1,maxY:y2},lidSideFlapLeft:{maxX:lidLeft,minY:y1,maxY:y2},lidSideFlapRight:{minX:lidRight,minY:y1,maxY:y2},
    back:{minX:backLeft,maxX:backRight,minY:y2,maxY:y3},backInsertFlapLeft:{maxX:backLeft,minY:y2,maxY:y3},backInsertFlapRight:{minX:backRight,minY:y2,maxY:y3},
    base:{minX:baseLeft,maxX:baseRight,minY:y3,maxY:y4},sidePanelLeft:{minX:sideOuterLeft,maxX:baseLeft,minY:y3,maxY:y4},sidePanelRight:{minX:baseRight,maxX:sideOuterRight,minY:y3,maxY:y4},
    bottomLockFlapLeft:{minX:minX,maxX:lockInnerLeft,minY:y3,maxY:y4},bottomLockFlapRight:{minX:lockInnerRight,maxX:maxX,minY:y3,maxY:y4},
    front:{minX:frontLeft,maxX:frontRight,minY:y4,maxY:y5},frontInsertFlapLeft:{maxX:frontLeft,minY:y4},frontInsertFlapRight:{minX:frontRight,minY:y4}
  };
  return Object.keys(regions).map(function(id){return M002_panelFromRegion(id,cutPoints,regions[id]);});
}

function M002_buildFoldRelations(fold){
  var groups={};
  fold.filter(function(item){return item.panelIds&&item.panelIds.length===2;}).forEach(function(item){
    var vertical=Math.abs(item.a.x-item.b.x)<.0001,key=item.panelIds.join('>')+':' +(vertical?'V'+item.a.x:'H'+item.a.y);
    (groups[key]||(groups[key]=[])).push(item);
  });
  return Object.keys(groups).map(function(key){
    var group=groups[key].slice(),first=group[0],vertical=Math.abs(first.a.x-first.b.x)<.0001;
    group.sort(function(a,b){return vertical?a.a.y-b.a.y:a.a.x-b.a.x;});
    var axis={a:group[0].a,b:group[group.length-1].b},child=first.panelIds[1],signed=/Left$/.test(child)?-90:90;
    return {id:'relation_'+group.map(function(item){return item.id;}).join('_'),foldId:first.id,foldIds:group.map(function(item){return item.id;}),parentPanelId:first.panelIds[0],childPanelId:child,axis:axis,angle:90,signedAngle:signed,direction:signed<0?'negative':'positive',initialState:'flat',minAngle:Math.min(0,signed),maxAngle:Math.max(0,signed)};
  });
}

function M002_lockFeatures(cfg) {
  var top=2*cfg.H+cfg.D,bottom=top+cfg.D;
  // Source SVG centers are 74.5 mm and 233.5 mm from the 308 mm base top.
  var sourceA=74.5/308,sourceB=233.5/308;
  var centers=cfg.lockCount===1?[{key:'C',y:(top+bottom)/2}]:[{key:'A',y:top+cfg.D*sourceA},{key:'B',y:top+cfg.D*sourceB}];
  var available=[2*(centers[0].y-top-3),2*(bottom-centers[centers.length-1].y-3)];
  for(var i=1;i<centers.length;i++)available.push(centers[i].y-centers[i-1].y-3);
  var length=Math.max(1,Math.min.apply(null,[55].concat(available)));
  return centers.map(function(f){return {key:f.key,y:f.y,y1:f.y-length/2,y2:f.y+length/2,length:length};});
}

function M002_applyLockRule(points,cfg){
  var features=M002_lockFeatures(cfg),top=2*cfg.H+cfg.D,bottom=top+cfg.D;
  function replaceSide(source,side){
    var threshold=side==='L'?-2*cfg.H+2:cfg.W+2*cfg.H-2,matches=[];
    source.forEach(function(p,index){if(p.y>=top-.01&&p.y<=bottom+.01&&(side==='L'?p.x<threshold:p.x>threshold))matches.push(index);});
    if(!matches.length)return source;
    var start=Math.min.apply(null,matches),end=Math.max.apply(null,matches),first=source[start],last=source[end];
    var xs=matches.map(function(index){return source[index].x;}).filter(function(value,index,all){return all.indexOf(value)===index;}).sort(function(a,b){return b-a;});
    var outer=side==='L'?(xs[1]===undefined?xs[0]:xs[1]):xs[xs.length-1],sign=side==='L'?-1:1;
    var ascending=last.y>=first.y,ordered=ascending?features:features.slice().reverse(),edge=[M002_point(outer,first.y)];
    ordered.forEach(function(f){var a=ascending?f.y1:f.y2,b=ascending?f.y2:f.y1;edge.push(M002_point(outer,a),M002_point(outer+sign*5,a+(ascending?1.5:-1.5)),M002_point(outer+sign*5,b+(ascending?-1.5:1.5)),M002_point(outer,b));});
    edge.push(M002_point(outer,last.y));
    return source.slice(0,start).concat(edge,source.slice(end+1));
  }
  return replaceSide(replaceSide(points,'R'),'L');
}

function M002_roundedRect(id,x,y,width,height,radius,panelId){
  var r=Math.max(0,Math.min(radius,width/2,height/2));
  return {id:id,type:'roundedRect',x:x,y:y,width:width,height:height,radius:r,panelId:panelId,d:['M',x+r,y,'L',x+width-r,y,'Q',x+width,y,x+width,y+r,'L',x+width,y+height-r,'Q',x+width,y+height,x+width-r,y+height,'L',x+r,y+height,'Q',x,y+height,x,y+height-r,'L',x,y+r,'Q',x,y,x+r,y,'Z'].join(' ')};
}

function M002_buildSlots(cfg,features){var width=5;return features.reduce(function(out,f){out.push(M002_roundedRect('slot_'+f.key+'_L',0,f.y1,width,f.length,width/2,'base'));out.push(M002_roundedRect('slot_'+f.key+'_R',cfg.W-width,f.y1,width,f.length,width/2,'base'));return out;},[]);}
function M002_buildLocks(cfg,features){return features.reduce(function(out,f){out.push({id:'lock_'+f.key+'_L',side:'L',centerY:f.y,y1:f.y1,y2:f.y2,depth:5,panelId:'bottomLockFlapLeft'});out.push({id:'lock_'+f.key+'_R',side:'R',centerY:f.y,y1:f.y1,y2:f.y2,depth:5,panelId:'bottomLockFlapRight'});return out;},[]);}

function M002_applyInterruptedFolds(fold,cfg,features){
  // f-7*-2 is the original outer side-lock hinge. Preserve it. Only the
  // base/side interrupted spans f-7*-3..5 are regenerated around the slots.
  var kept=fold.filter(function(item){return !/^f-7[LR]-[3-5]$/.test(item.id);});
  ['L','R'].forEach(function(side){var x=side==='L'?0:cfg.W,cursor=2*cfg.H+cfg.D,index=3;features.forEach(function(f){if(f.y1>cursor)kept.push({id:'f-7'+side+'-'+index++,type:'line',a:M002_point(x,cursor),b:M002_point(x,f.y1),panelIds:['base','sidePanel'+(side==='L'?'Left':'Right')]});cursor=f.y2;});var bottom=2*cfg.H+2*cfg.D;if(cursor<bottom)kept.push({id:'f-7'+side+'-'+index,type:'line',a:M002_point(x,cursor),b:M002_point(x,bottom),panelIds:['base','sidePanel'+(side==='L'?'Left':'Right')]});});
  return kept;
}

function M002_buildInsertionRelations(slots,locks){return locks.map(function(lock){var slot=slots.find(function(s){return s.id===lock.id.replace('lock_','slot_');});return {id:'insert_'+lock.id.slice(5),movingPanelId:lock.side==='L'?'bottomLockFlapLeft':'bottomLockFlapRight',targetPanelId:'base',lockId:lock.id,slotId:slot.id,insertionDirection:{x:lock.side==='L'?1:-1,y:0,z:0},targetPosition:{x:slot.x+slot.width/2,y:slot.y+slot.height/2,z:0},depth:lock.depth,tolerance:.5,order:7};});}

function M002_dimensions(cfg){var top=2*cfg.H+cfg.D,bottom=top+cfg.D;return [{id:'dim-W',axis:'horizontal',a:M002_point(0,bottom-18),b:M002_point(cfg.W,bottom-18),label:'W '+cfg.W+' mm'},{id:'dim-D',axis:'vertical',a:M002_point(cfg.W-18,top),b:M002_point(cfg.W-18,bottom),label:'D '+cfg.D+' mm'},{id:'dim-H',axis:'vertical',a:M002_point(cfg.W-36,cfg.H+cfg.D),b:M002_point(cfg.W-36,2*cfg.H+cfg.D),label:'H '+cfg.H+' mm'}];}

function M002_normalizeDimensions(W, D, H) {
  return Object.freeze({
    W: Math.max(20, Number(W) || 400),
    D: Math.max(20, Number(D) || 308),
    H: Math.max(10, Number(H) || 80),
    bleed: 3,
    lockCount: (Number(D) || 308) <= 120 ? 1 : 2
  });
}

function M002_referenceMapper(cfg) {
  var sx0 = 559.894, sx1 = 1693.752;
  var sy = [99.634, 323.571, 1202.311, 1429.083, 2302.154, 2526.09];
  var ty = [0, cfg.H, cfg.H + cfg.D, 2 * cfg.H + cfg.D, 2 * cfg.H + 2 * cfg.D, 3 * cfg.H + 2 * cfg.D];
  var refW = sx1 - sx0, refH = 226.772;
  function x(value) {
    if (value < sx0) return (value - sx0) / refH * cfg.H;
    if (value > sx1) return cfg.W + (value - sx1) / refH * cfg.H;
    return (value - sx0) / refW * cfg.W;
  }
  function y(value) {
    if (value <= sy[0]) return (value - sy[0]) / (sy[1] - sy[0]) * cfg.H;
    for (var index = 1; index < sy.length; index += 1) {
      if (value <= sy[index]) {
        return ty[index - 1] + (value - sy[index - 1]) / (sy[index] - sy[index - 1]) * (ty[index] - ty[index - 1]);
      }
    }
    return ty[ty.length - 1] + (value - sy[sy.length - 1]) / (sy[sy.length - 2] - sy[sy.length - 1]) * (ty[ty.length - 2] - ty[ty.length - 1]);
  }
  return {
    x:x, y:y,
    point:function(point) { return M002_point(x(point.x), y(point.y)); }
  };
}

function M002_mapFinalCutPoint(point, cfg, map) {
  var mapped = map.point(point);
  var seamLeft = 559.894, seamRight = 1693.752;
  var backTop = 1202.311, backBottom = 1429.083;
  var frontTop = 2302.154, frontBottom = 2526.09;
  var inBackInsert = point.y >= backTop - 0.001 && point.y <= backBottom + 0.001;
  var inFrontInsert = point.y >= frontTop - 0.001 && point.y <= frontBottom + 0.001;
  if (!(inBackInsert || inFrontInsert)) return mapped;

  // Insert reach follows the base depth while f-5/f-9 stay fixed. The
  // reference D=308 result remains coordinate-identical to the source SVG.
  var referenceDepth = 308;
  var referenceHeight = 80;
  var referencePanelHeight = 226.772;
  var depthScale = cfg.D / referenceDepth;
  if (point.x < seamLeft) {
    var leftReferenceReach = (seamLeft - point.x) / referencePanelHeight * referenceHeight;
    return M002_point(-leftReferenceReach * depthScale, mapped.y);
  }
  if (point.x > seamRight) {
    var rightReferenceReach = (point.x - seamRight) / referencePanelHeight * referenceHeight;
    return M002_point(cfg.W + rightReferenceReach * depthScale, mapped.y);
  }
  return mapped;
}

function M002_point(x, y) {
  return { x:Math.round(x * 10000) / 10000, y:Math.round(y * 10000) / 10000 };
}

function M002_attr(element, name) {
  var match = element.match(new RegExp('\\b' + name + '="([^"]+)"'));
  return match ? match[1] : '';
}

function M002_fragmentPoints(element) {
  if (/^<line\b/.test(element)) {
    return [
      M002_point(+M002_attr(element, 'x1'), +M002_attr(element, 'y1')),
      M002_point(+M002_attr(element, 'x2'), +M002_attr(element, 'y2'))
    ];
  }
  if (/^<polyline\b/.test(element)) {
    var values = M002_attr(element, 'points').trim().split(/[ ,]+/).map(Number);
    var polyline = [];
    for (var p = 0; p < values.length; p += 2) polyline.push(M002_point(values[p], values[p + 1]));
    return polyline;
  }
  return M002_flattenPath(M002_attr(element, 'd'), 16);
}

function M002_flattenPath(d, curveSteps) {
  var tokens = d.match(/[MLHVCSZmlhvcsz]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || [];
  var index = 0, command = '', current = M002_point(0, 0), start = current, points = [], lastC2 = null;
  var isCommand = function(value) { return /^[A-Za-z]$/.test(value || ''); };
  var add = function(point) { current = M002_point(point.x, point.y); points.push(current); };
  while (index < tokens.length) {
    if (isCommand(tokens[index])) command = tokens[index++];
    var relative = command === command.toLowerCase();
    var op = command.toUpperCase();
    if (op === 'M' || op === 'L') {
      var lx = +tokens[index++], ly = +tokens[index++];
      add(M002_point(relative ? current.x + lx : lx, relative ? current.y + ly : ly));
      lastC2 = null;
      if (op === 'M') { start = current; command = relative ? 'l' : 'L'; }
    } else if (op === 'H') {
      var hx = +tokens[index++]; add(M002_point(relative ? current.x + hx : hx, current.y));
      lastC2 = null;
    } else if (op === 'V') {
      var vy = +tokens[index++]; add(M002_point(current.x, relative ? current.y + vy : vy));
      lastC2 = null;
    } else if (op === 'C') {
      var p0 = current;
      var raw = [+tokens[index++],+tokens[index++],+tokens[index++],+tokens[index++],+tokens[index++],+tokens[index++]];
      var c1 = M002_point(relative ? p0.x + raw[0] : raw[0], relative ? p0.y + raw[1] : raw[1]);
      var c2 = M002_point(relative ? p0.x + raw[2] : raw[2], relative ? p0.y + raw[3] : raw[3]);
      var end = M002_point(relative ? p0.x + raw[4] : raw[4], relative ? p0.y + raw[5] : raw[5]);
      for (var step = 1; step <= curveSteps; step += 1) {
        var t = step / curveSteps, u = 1 - t;
        add(M002_point(
          u*u*u*p0.x + 3*u*u*t*c1.x + 3*u*t*t*c2.x + t*t*t*end.x,
          u*u*u*p0.y + 3*u*u*t*c1.y + 3*u*t*t*c2.y + t*t*t*end.y
        ));
      }
      lastC2 = c2;
    } else if (op === 'S') {
      var s0 = current;
      var smoothRaw = [+tokens[index++],+tokens[index++],+tokens[index++],+tokens[index++]];
      var sc1 = lastC2 ? M002_point(2*s0.x-lastC2.x,2*s0.y-lastC2.y) : s0;
      var sc2 = M002_point(relative ? s0.x+smoothRaw[0] : smoothRaw[0], relative ? s0.y+smoothRaw[1] : smoothRaw[1]);
      var smoothEnd = M002_point(relative ? s0.x+smoothRaw[2] : smoothRaw[2], relative ? s0.y+smoothRaw[3] : smoothRaw[3]);
      for (var smoothStep=1;smoothStep<=curveSteps;smoothStep+=1) {
        var st=smoothStep/curveSteps,su=1-st;
        add(M002_point(
          su*su*su*s0.x+3*su*su*st*sc1.x+3*su*st*st*sc2.x+st*st*st*smoothEnd.x,
          su*su*su*s0.y+3*su*su*st*sc1.y+3*su*st*st*sc2.y+st*st*st*smoothEnd.y
        ));
      }
      lastC2=sc2;
    } else if (op === 'Z') {
      add(start); command = ''; lastC2 = null;
    } else {
      throw new Error('Unsupported M002 SVG path command: ' + command);
    }
  }
  return points;
}

function M002_chainFragments(fragments) {
  var remaining = fragments.map(function(points) { return points.slice(); });
  var chain = remaining.shift(), tolerance = 2;
  var close = function(a, b) { return Math.hypot(a.x - b.x, a.y - b.y) <= tolerance; };
  while (remaining.length) {
    var end = chain[chain.length - 1], found = -1, reverse = false;
    for (var index = 0; index < remaining.length; index += 1) {
      var fragment = remaining[index];
      if (close(end, fragment[0])) { found = index; break; }
      if (close(end, fragment[fragment.length - 1])) { found = index; reverse = true; break; }
    }
    if (found < 0) throw new Error('M002 final Cut is not continuous near ' + end.x + ',' + end.y);
    var next = remaining.splice(found, 1)[0];
    if (reverse) next.reverse();
    var joinDistance=Math.hypot(end.x-next[0].x,end.y-next[0].y);
    chain.push.apply(chain, joinDistance<=.02?next.slice(1):next);
  }
  if (close(chain[0], chain[chain.length - 1])) chain.pop();
  return chain;
}

function M002_foldMetadata() {
  return [
    {id:'f-9L',panelIds:['front','frontInsertFlapLeft']},{id:'f-9R',panelIds:['front','frontInsertFlapRight']},
    {id:'f-8',panelIds:['base','front']},{id:'f-6',panelIds:['back','base']},
    {id:'f-7R-1',panelIds:['sidePanelRight','bottomLockFlapRight']},{id:'f-7R-2',panelIds:['base','sidePanelRight']},
    {id:'f-7L-2',panelIds:['base','sidePanelLeft']},{id:'f-7L-1',panelIds:['sidePanelLeft','bottomLockFlapLeft']},
    {id:'f-7L-3',panelIds:['base','sidePanelLeft']},{id:'f-7L-4',panelIds:['base','sidePanelLeft']},{id:'f-7L-5',panelIds:['base','sidePanelLeft']},
    {id:'f-7R-3',panelIds:['base','sidePanelRight']},{id:'f-7R-4',panelIds:['base','sidePanelRight']},{id:'f-7R-5',panelIds:['base','sidePanelRight']},
    {id:'f-5R',panelIds:['back','backInsertFlapRight']},{id:'f-5L',panelIds:['back','backInsertFlapLeft']},
    {id:'f-4',panelIds:['lid','back']},{id:'f-3L',panelIds:['lid','lidSideFlapLeft']},{id:'f-2',panelIds:['lidFront','lid']},
    {id:'f-3R',panelIds:['lid','lidSideFlapRight']},{id:'f-1L',panelIds:['lidFront','lidDustFlapLeft']},{id:'f-1R',panelIds:['lidFront','lidDustFlapRight']}
  ];
}

function M002_handleHoles(cfg, map) {
  var centers = [820.681, 1432.965], cy = 1315.697;
  var width = 50 * cfg.W / 400, height = 25 * cfg.H / 80;
  return centers.map(function(cx, index) {
    return {
      id:index ? 'handleHoleRight' : 'handleHoleLeft', type:'roundedRect',
      cx:map.x(cx), cy:map.y(cy), width:width, height:height,
      radius:height / 2, panelId:'back'
    };
  });
}

function M002_polygonBounds(points) {
  var xs = points.map(function(point) { return point.x; });
  var ys = points.map(function(point) { return point.y; });
  var minX=Math.min.apply(null,xs),maxX=Math.max.apply(null,xs),minY=Math.min.apply(null,ys),maxY=Math.max.apply(null,ys);
  return {minX:minX,minY:minY,maxX:maxX,maxY:maxY,width:maxX-minX,height:maxY-minY};
}

function M002_cleanClosedPoints(points){
  var result=[];
  points.forEach(function(p){var q=M002_point(p.x,p.y),last=result[result.length-1];if(!last||Math.hypot(q.x-last.x,q.y-last.y)>1e-7)result.push(q);});
  if(result.length>1&&Math.hypot(result[0].x-result[result.length-1].x,result[0].y-result[result.length-1].y)<1e-7)result.pop();
  return result;
}

function M002_lineIntersection(a,ad,b,bd){var cross=ad.x*bd.y-ad.y*bd.x;if(Math.abs(cross)<1e-9)return null;var qx=b.x-a.x,qy=b.y-a.y,t=(qx*bd.y-qy*bd.x)/cross;return M002_point(a.x+ad.x*t,a.y+ad.y*t);}

function M002_offsetClosedPolyline(sourcePoints,distance){
  var points=M002_cleanClosedPoints(sourcePoints),count=points.length;if(count<3||distance<=0)return points;
  var clipper=typeof ClipperLib!=='undefined'?ClipperLib:null;
  if(clipper&&clipper.ClipperOffset){
    var scale=10000;
    var source=points.map(function(point){return {X:Math.round(point.x*scale),Y:Math.round(point.y*scale)};});
    var offsetter=new clipper.ClipperOffset(2,0.05*scale);
    var solution=new clipper.Paths();
    offsetter.AddPath(source,clipper.JoinType.jtRound,clipper.EndType.etClosedPolygon);
    offsetter.Execute(solution,distance*scale);
    if(solution.length){
      var cleaned=clipper.Clipper.CleanPolygons?clipper.Clipper.CleanPolygons(solution,0.01*scale):solution;
      var candidates=cleaned&&cleaned.length?cleaned:solution;
      var outer=candidates.reduce(function(largest,current){
        return Math.abs(clipper.Clipper.Area(current))>Math.abs(clipper.Clipper.Area(largest))?current:largest;
      },candidates[0]);
      return M002_cleanClosedPoints(outer.map(function(point){return M002_point(point.X/scale,point.Y/scale);}));
    }
  }
  var area=0;for(var i=0;i<count;i++){var a=points[i],b=points[(i+1)%count];area+=a.x*b.y-b.x*a.y;}
  var outward=area>0?1:-1;
  var edges=points.map(function(a,index){var b=points[(index+1)%count],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1;return {dir:M002_point(dx/len,dy/len),normal:M002_point(outward*dy/len,-outward*dx/len)};});
  var result=[];
  for(var j=0;j<count;j++){
    var p=points[j],prev=edges[(j-1+count)%count],next=edges[j];
    var pa=M002_point(p.x+prev.normal.x*distance,p.y+prev.normal.y*distance),pb=M002_point(p.x+next.normal.x*distance,p.y+next.normal.y*distance);
    var hit=M002_lineIntersection(pa,prev.dir,pb,next.dir),miter=hit?Math.hypot(hit.x-p.x,hit.y-p.y):Infinity;
    if(hit&&miter<=distance*8)result.push(hit);else result.push(pa,pb);
  }
  return M002_cleanClosedPoints(result);
}

function M002_polylinePath(points) {
  return points.map(function(point, index) { return (index ? 'L ' : 'M ') + point.x + ' ' + point.y; }).join(' ');
}
