// ============================================================
// R001_layout.js — A-Type Regular Slotted Container (RSC)
// v16 - 원본 좌표 100% 검증 후 작성
//
// 원본 하단 arc:
//   f(y=210) → arc CW(sweep=1) → (f+dOff, 209.853)
//   = c0,-3.826,...,-6.668 + c-3.831,.112,...,7.084 합산
//
// 원본 상단 arc:
//   f(y=85) → arc CW(sweep=1) → (f+dOff, 85.147)
//   = c0,3.832,...,7.084 + s7.057,-2.842,7.282,-6.668
// ============================================================

function R001_getLayout(W, D, H) {
  var s = R001_getSpec(W, D, H);
  var {
    GW, FH, arcR,
    xGlueL, xFrontL, xFrontR, xSideLR, xBackR, xSideRR,
    yTop, yFoldTop, yFoldTop_arc, yFoldBot, yFoldBot_arc, yBot,
    glueAngle,
  } = s;

  var cOff  = D * (3.5  / 170);
  var dOff  = arcR * 2;           // 5mm
  var arcDY = D * (0.147 / 170); // 0.147mm (arc bezier 끝점 y offset)

  // 원본 검증 좌표
  var yArcBot = yFoldBot - arcDY; // 209.853 (하단 arc 끝점 y)
  var yArcTop = yFoldTop + arcDY; // 85.147  (상단 arc 끝점 y)
  var yFlap   = yBot;             // 295 (하단 플랩 끝 y = 원본 295)

  // 하단 대각 x 좌표 (원본 검증)
  var bL_arcEnd  = xFrontR + dOff;               // 290: 1-9 arc끝
  var bL_diagBot = xFrontR + dOff + dOff;         // 295: 1-10 대각끝
  // 295 = 290 + arcR + dOff? 290+2.5+2.5=295 ✓
  var bL_diagTop = xSideLR - dOff - arcR;        // 447.5 아님, 원본=445
  // 원본 1-12 시작: mmx(1432.503+14.185)=mmx(1446.688)=452.5? 아니라
  // 원본 1-12 대각끝: (445, 295) → 1-12 대각: (445,295)→(450,209.853)
  // 즉 bL_diagTop(대각시작) = 445 = xSideLR-dOff-dOff = 455-5-5 = 445 ✓
  var bL_diagTopX = xSideLR - dOff - dOff;       // 445
  var bL_arcPre   = xSideLR - dOff;              // 450: 1-13 arc전

  // sideR 하단
  var bR_arcEnd  = xBackR + dOff;                // 745: 1-17 arc끝
  var bR_diagBot = xBackR + dOff + dOff;         // 750: 1-18 대각끝 (원본 750)

  // 상단 대각 x 좌표 (원본 검증)
  var tR_flatL   = xBackR + dOff + dOff;         // 750: 1-25
  var tR_arcEnd  = xBackR + dOff;                // 745: 1-26/1-27
  var tL_diagR   = xSideLR - dOff;              // 450: 1-30/1-32
  var tL_flatEnd = xFrontR + dOff + dOff;        // 295: 1-33
  var tL_arcEnd  = xFrontR + dOff;              // 290: 1-34/1-35

  function _p(x, y) { return (+x).toFixed(4)+','+( +y).toFixed(4); }
  // arc CW(sweep=1): f → arc → (f+dOff, yArcBot/Top)
  function arcCW(x, y)  { return 'A '+arcR+' '+arcR+' 0 0 1 '+_p(x, y); }
  function arcCCW(x, y) { return 'A '+arcR+' '+arcR+' 0 0 0 '+_p(x, y); }

  var glueTopY = yFoldTop_arc + GW * glueAngle;
  var glueBotY = yFoldBot_arc - GW * glueAngle;

  var p = [];

  // 1-1~1-7
  p.push('M '+_p(xFrontR,  yTop));
  p.push('L '+_p(xFrontL,  yTop));
  p.push('L '+_p(xFrontL,  yFoldTop_arc));
  p.push('L '+_p(xGlueL,   glueTopY));
  p.push('L '+_p(xGlueL,   glueBotY));
  p.push('L '+_p(xFrontL,  yFoldBot_arc));
  p.push('L '+_p(xFrontL,  yBot));
  p.push('L '+_p(xFrontR,  yBot));

  // 1-8~1-13: botFlap-sideL
  // f-2(285,210) → arcCW → (290,209.853) → 대각↓ → (295,295)
  // → 직선 → (445,295) → 대각↑ → (450,209.853) → arcCW → f-3(455,210)
  p.push('L '+_p(xFrontR,   yFoldBot));                // 1-8 세로
  p.push(arcCW(bL_arcEnd,   yArcBot));                  // 1-9 arc CW
  p.push('L '+_p(bL_diagBot, yFlap));                   // 1-10 대각↓ (295,295)
  p.push('L '+_p(bL_diagTopX, yFlap));                  // 1-11 직선 (445,295)
  p.push('L '+_p(bL_arcPre,  yArcBot));                 // 1-12 대각↑ (450,209.853)
  p.push(arcCW(xSideLR,     yFoldBot));                 // 1-13 arc CW

  // 1-14~1-16: botFlap-back 직각
  p.push('L '+_p(xSideLR,   yBot));
  p.push('L '+_p(xBackR,    yBot));
  p.push('L '+_p(xBackR,    yFoldBot));

  // 1-17~1-21: botFlap-sideR
  // f-4(740,210) → arcCW → (745,209.853) → 대각↓ → (750,295)
  p.push(arcCW(bR_arcEnd,   yArcBot));                  // 1-17 arc CW
  p.push('L '+_p(bR_diagBot, yFlap));                   // 1-18 대각↓ (750,295)
  p.push('L '+_p(xSideRR-cOff-dOff, yFlap));            // 1-19 직선
  p.push('L '+_p(xSideRR-cOff, yFoldBot_arc+cOff));     // 1-20
  p.push('L '+_p(xSideRR,   yFoldBot_arc));              // 1-21

  // 1-22~1-27: sideR + topFlap-sideR
  p.push('L '+_p(xSideRR,   yFoldTop_arc));
  p.push('L '+_p(xSideRR-cOff, yFoldTop_arc-cOff)); // 1-23: (904.5, 84)
  p.push('L '+_p(xSideRR-cOff-dOff, yTop));
  p.push('L '+_p(tR_flatL,  yTop));                     // 1-25 (750)
  p.push('L '+_p(tR_arcEnd, yArcTop));                  // 1-26 (745,85.147)
  p.push(arcCW(xBackR,     yFoldTop));               // 1-27 arc CW → f-4

// 1-28~1-36: topFlap-back → topFlap-sideL
p.push('L '+_p(xBackR,     yTop));       // 1-28
p.push('L '+_p(xSideLR,    yTop));       // 1-29
p.push('L '+_p(xSideLR,    yFoldTop));   // 1-30

// 1-31: f-3 접점에서 arc
p.push(arcCW(tL_diagR,     yArcTop));    // 1-31

// 1-32: arc 끝점에서 좌측상단 대각선
p.push('L '+_p(tL_diagR - dOff, yTop)); // 1-32 (xSideLR-dOff-dOff)

// 1-33: 상단 가로선
p.push('L '+_p(tL_flatEnd, yTop));       // 1-33

// 1-34~1-35
p.push('L '+_p(tL_arcEnd,  yArcTop));    // 1-34
p.push(arcCW(xFrontR,      yFoldTop));   // 1-35

p.push('L '+_p(xFrontR,    yTop));       // 1-36
p.push('Z');

  var outerPath = p.join(' ');

  var fe = D*(0.3/170);
  var foldLines = [
    { id:'f-1', x1:xFrontL,    y1:yFoldTop_arc+fe, x2:xFrontL,   y2:yFoldBot_arc-fe },
    { id:'f-2', x1:xFrontR,    y1:yFoldTop+arcR, x2:xFrontR,   y2:yFoldBot-arcR },
    { id:'f-3', x1:xSideLR,    y1:yFoldTop+arcR, x2:xSideLR,   y2:yFoldBot-arcR },
    { id:'f-4', x1:xBackR,     y1:yFoldTop+fe,     x2:xBackR,    y2:yFoldBot-fe     },
    { id:'f-5', x1:xFrontL+fe, y1:yFoldTop,        x2:xFrontR-fe,y2:yFoldTop        },
    { id:'f-5-back', x1:xSideLR+fe, y1:yFoldTop,        x2:xBackR-fe, y2:yFoldTop        },
{ id:'f-6', x1:xFrontR+fe, y1:yFoldTop_arc, x2:xSideLR-fe, y2:yFoldTop_arc },
{ id:'f-6-sideR', x1:xBackR+fe,  y1:yFoldTop_arc, x2:xSideRR-fe, y2:yFoldTop_arc },
    { id:'f-7', x1:xFrontL+fe, y1:yFoldBot,        x2:xFrontR-fe,y2:yFoldBot        },
    { id:'f-7-back', x1:xSideLR+fe, y1:yFoldBot,        x2:xBackR-fe, y2:yFoldBot        },
{ id:'f-8', x1:xFrontR+fe, y1:yFoldBot_arc, x2:xSideLR-fe, y2:yFoldBot_arc },
{ id:'f-8-sideR', x1:xBackR+fe,  y1:yFoldBot_arc, x2:xSideRR-fe, y2:yFoldBot_arc },
  ];

  var gluePathD = [
    'M '+_p(xFrontL, yFoldTop_arc),
    'L '+_p(xGlueL,  glueTopY),
    'L '+_p(xGlueL,  glueBotY),
    'L '+_p(xFrontL, yFoldBot_arc),
    'Z'
  ].join(' ');

  var pad3 = D*(3/170);
  var bounds = {
    minX: xGlueL-pad3, minY: yTop-pad3,
    maxX: xSideRR+pad3, maxY: yBot+pad3,
    width: xSideRR-xGlueL+pad3*2, height: yBot+pad3*2,
  };

  var yCB=(yFoldTop+yFoldBot)/2, yCT=yTop+FH/2, yCBot=yFoldBot+FH/2;
  var labels = [
    {name:'Glue',         cx:(xGlueL+xFrontL)/2,  cy:yCB  },
    {name:'front',        cx:(xFrontL+xFrontR)/2,  cy:yCB  },
    {name:'sideL',        cx:(xFrontR+xSideLR)/2,  cy:yCB  },
    {name:'back',         cx:(xSideLR+xBackR)/2,   cy:yCB  },
    {name:'sideR',        cx:(xBackR+xSideRR)/2,   cy:yCB  },
    {name:'topFlap-front',cx:(xFrontL+xFrontR)/2,  cy:yCT  },
    {name:'topFlap-sideL',cx:(xFrontR+xSideLR)/2,  cy:yCT  },
    {name:'topFlap-back', cx:(xSideLR+xBackR)/2,   cy:yCT  },
    {name:'topFlap-sideR',cx:(xBackR+xSideRR)/2,   cy:yCT  },
    {name:'botFlap-front',cx:(xFrontL+xFrontR)/2,  cy:yCBot},
    {name:'botFlap-sideL',cx:(xFrontR+xSideLR)/2,  cy:yCBot},
    {name:'botFlap-back', cx:(xSideLR+xBackR)/2,   cy:yCBot},
    {name:'botFlap-sideR',cx:(xBackR+xSideRR)/2,   cy:yCBot},
  ];
  function box(name,x1,y1,x2,y2){return{name:name,x1:x1,y1:y1,x2:x2,y2:y2,cx:(x1+x2)/2,cy:(y1+y2)/2,width:x2-x1,height:y2-y1};}
  var panelBoxes={
    glue:box('Glue',xGlueL,yFoldTop_arc,xFrontL,yFoldBot_arc),front:box('front',xFrontL,yFoldTop,xFrontR,yFoldBot),
    sideL:box('sideL',xFrontR,yFoldTop_arc,xSideLR,yFoldBot_arc),back:box('back',xSideLR,yFoldTop,xBackR,yFoldBot),
    sideR:box('sideR',xBackR,yFoldTop_arc,xSideRR,yFoldBot_arc),topFlapFront:box('topFlap-front',xFrontL,yTop,xFrontR,yFoldTop),
    topFlapSideL:box('topFlap-sideL',xFrontR,yTop,xSideLR,yFoldTop_arc),topFlapBack:box('topFlap-back',xSideLR,yTop,xBackR,yFoldTop),
    topFlapSideR:box('topFlap-sideR',xBackR,yTop,xSideRR,yFoldTop_arc),botFlapFront:box('botFlap-front',xFrontL,yFoldBot,xFrontR,yBot),
    botFlapSideL:box('botFlap-sideL',xFrontR,yFoldBot_arc,xSideLR,yBot),botFlapBack:box('botFlap-back',xSideLR,yFoldBot,xBackR,yBot),
    botFlapSideR:box('botFlap-sideR',xBackR,yFoldBot_arc,xSideRR,yBot)
  };

  // bleedPathD: 칼선 바깥쪽 3mm offset path (별도 함수)
  var bleedPathD = R001_buildBleedPath(W, D, H, 3);

  var dielineBounds={minX:xGlueL,minY:yTop,maxX:xSideRR,maxY:yBot,width:xSideRR-xGlueL,height:yBot-yTop};
  return { outerPath, bleedPathD, gluePathD, foldLines, labels, panelBoxes:panelBoxes,
    panels:window.PacVuShipping.panels(panelBoxes,foldLines), bounds:bounds,
    dielineBounds:dielineBounds,bleedBounds:bounds,spec:s };
}

// ============================================================
// R001_buildBleedPath(W, D, H, d) — bleed offset path 생성
// d = bleed offset mm (기본 3mm)
// outerPath 기준 바깥쪽으로만 확장
// 기존 코드 변경 없음 — 별도 함수로 분리
// ============================================================
function R001_buildBleedPath(W, D, H, d) {
  if (d === undefined) d = 3;
  var s = R001_getSpec(W, D, H);
  var {
    GW, FH, arcR,
    xGlueL, xFrontL, xFrontR, xSideLR, xBackR, xSideRR,
    yTop, yFoldTop, yFoldTop_arc, yFoldBot, yFoldBot_arc, yBot,
    glueAngle,
  } = s;

  var cOff  = D * (3.5  / 170);
  var dOff  = arcR * 2;
  var arcDY = D * (0.147 / 170);
  var yArcBot = yFoldBot - arcDY;
  var yFlap   = yBot;

  // Glue 사선 법선 계산 (바깥쪽 = 왼쪽 법선)
  var glueTopY = yFoldTop_arc + GW * glueAngle;
  var glueBotY = yFoldBot_arc - GW * glueAngle;
  var gDx = xGlueL - xFrontL;
  var gDy = glueTopY - yFoldTop_arc;
  var gLen = Math.sqrt(gDx*gDx + gDy*gDy);
  var gNx = -gDy/gLen; // 바깥쪽 법선 x
  var gNy =  gDx/gLen; // 바깥쪽 법선 y

  // sideR 코너대각 법선
  var c23dx = -cOff, c23dy = -cOff;
  var c23len = Math.sqrt(c23dx*c23dx + c23dy*c23dy);
  var c23nx = -c23dy/c23len;
  var c23ny =  c23dx/c23len;

  function N(v) { return (+v).toFixed(4); }
  function _p(x, y) { return N(x)+','+N(y); }
  function offPts(x1,y1,x2,y2){
    var dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy);
    var nx=-dy/len,ny=dx/len;
    return {p1:[x1+nx*d,y1+ny*d],p2:[x2+nx*d,y2+ny*d]};
  }
  function isect(a,b){
    var d1=[a.p2[0]-a.p1[0],a.p2[1]-a.p1[1]];
    var d2=[b.p2[0]-b.p1[0],b.p2[1]-b.p1[1]];
    var dx=b.p1[0]-a.p1[0],dy=b.p1[1]-a.p1[1];
    var cr=d1[0]*d2[1]-d1[1]*d2[0];
    if(Math.abs(cr)<1e-10)return a.p2;
    var t=(dx*d2[1]-dy*d2[0])/cr;
    return [a.p1[0]+t*d1[0], a.p1[1]+t*d1[1]];
  }

  var bp = [];

  // ── 상단 (yTop 위로 d) ────────────────────────────────────
  bp.push('M '+_p(xFrontR+d,         yTop-d));        // topFlap-front 우상
  bp.push('L '+_p(xFrontL-d,         yTop-d));        // 좌상

  // ── Glue 구간: 단순 수직선 ───────────────────────────────
  (function(){
    var leftTop = offPts(xFrontL, yTop, xFrontL, yFoldTop_arc);
    var glueTop = offPts(xFrontL, yFoldTop_arc, xGlueL, glueTopY);
    var glueLeft = offPts(xGlueL, glueTopY, xGlueL, glueBotY);
    var glueBot = offPts(xGlueL, glueBotY, xFrontL, yFoldBot_arc);
    var leftBot = offPts(xFrontL, yFoldBot_arc, xFrontL, yBot);
    var bottom = offPts(xFrontL, yBot, xFrontR, yBot);
    var iTop = isect(leftTop, glueTop);
    var iGlueTop = isect(glueTop, glueLeft);
    var iGlueBot = isect(glueLeft, glueBot);
    var iBot = isect(glueBot, leftBot);
    var iFrontBot = isect(leftBot, bottom);
    bp.push('L '+_p(iTop[0], iTop[1]));
    bp.push('L '+_p(iGlueTop[0], iGlueTop[1]));
    bp.push('L '+_p(iGlueBot[0], iGlueBot[1]));
    bp.push('L '+_p(iBot[0], iBot[1]));
    bp.push('L '+_p(iFrontBot[0], iFrontBot[1]));
  })();
  bp.push('L '+_p(xFrontR,           yBot+d));        // front 하단

  // ── sideL 하단 (아래로 d) ─────────────────────────────────
  bp.push('L '+_p(xSideLR,           yBot+d));        // sideL 하단

  // ── back 하단 (아래로 d) ──────────────────────────────────
  bp.push('L '+_p(xBackR,            yBot+d));        // back 하단

  // ── sideR 하단 + 우측 + 상단 (런타임 교점 계산) ──────────────
  (function(){
    function offPts(x1,y1,x2,y2){
      var dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy);
      var nx=-dy/len,ny=dx/len;
      return {p1:[x1+nx*d,y1+ny*d],p2:[x2+nx*d,y2+ny*d]};
    }
    function isect(a,b){
      var d1=[a.p2[0]-a.p1[0],a.p2[1]-a.p1[1]];
      var d2=[b.p2[0]-b.p1[0],b.p2[1]-b.p1[1]];
      var dx=b.p1[0]-a.p1[0],dy=b.p1[1]-a.p1[1];
      var cr=d1[0]*d2[1]-d1[1]*d2[0];
      if(Math.abs(cr)<1e-10)return a.p2;
      var t=(dx*d2[1]-dy*d2[0])/cr;
      return [a.p1[0]+t*d1[0], a.p1[1]+t*d1[1]];
    }
    var L19=offPts(xSideRR-cOff-dOff,yBot, xSideRR-cOff,yFoldBot_arc+cOff);
    var L20=offPts(xSideRR-cOff,yFoldBot_arc+cOff, xSideRR,yFoldBot_arc);
    var L21=offPts(xSideRR,yFoldBot_arc, xSideRR,yFoldTop_arc);
    var L22=offPts(xSideRR,yFoldTop_arc, xSideRR-cOff,yFoldTop_arc-cOff);
    var L23=offPts(xSideRR-cOff,yFoldTop_arc-cOff, xSideRR-cOff-dOff,yTop);
    var Lbot={p1:[xSideRR-cOff-dOff,yBot+d],p2:[xSideRR,yBot+d]};
    var Ltop={p1:[xSideRR-cOff-dOff,yTop-d],p2:[xSideRR,yTop-d]};
    var iBot=isect(Lbot,L19), iA=isect(L19,L20), iB=isect(L20,L21);
    var iC=isect(L21,L22), iD=isect(L22,L23), iTop=isect(L23,Ltop);
    bp.push('L '+_p(xSideRR-cOff-dOff, yBot+d));
    bp.push('L '+_p(iBot[0], iBot[1]));
    bp.push('L '+_p(iA[0],   iA[1]));
    bp.push('L '+_p(iB[0],   iB[1]));
    bp.push('L '+_p(iC[0],   iC[1]));
    bp.push('L '+_p(iD[0],   iD[1]));
    bp.push('L '+_p(iTop[0], iTop[1]));
  })();

  // ── 상단 가로선 전체 ──────────────────────────────────────
  bp.push('L '+_p(xBackR+dOff,        yTop-d));        // 1-25 좌상
  bp.push('L '+_p(xBackR,             yTop-d));        // 1-27→1-28
  bp.push('L '+_p(xSideLR,            yTop-d));        // 1-29 back 상단
  bp.push('L '+_p(xSideLR-dOff,       yTop-d));        // 1-31→1-32
  bp.push('L '+_p(xFrontR+dOff+dOff,  yTop-d));        // 1-33
  bp.push('L '+_p(xFrontR+dOff,       yTop-d));        // 1-34→1-35
  bp.push('L '+_p(xFrontR+d,          yTop-d));        // 1-36→닫힘
  bp.push('Z');

  return bp.join(' ');
}
