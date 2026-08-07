// ============================================================
// R001_spec.js — A-Type Regular Slotted Container (RSC)
// R001_getSpec(W, D, H) → spec 객체 반환
//
// 기준: 285×170×120mm
// 전개 순서: Glue(35) → front(W) → sideL(D) → back(W) → sideR(D-2)
// 넘버링: 시계 반대 방향 (1-1 ~ 1-36)
// ============================================================

function R001_getSpec(W, D, H) {

  /* ── 고정 파생값 ─────────────────────────────────────────── */
  var GW   = 35;                 // 승인 원본의 고정 Glue 너비
  var FH   = D / 2;              // 플랩 높이 = D/2
  var arcR = D * (2.5 / 170);    // arc 반지름 (D 비율)
  var diagOffset = D * (10 / 170); // 플랩 대각 offset (D 비율)
  var botDiag    = D * (3.5 / 170); // 하단 대각 offset (D 비율)
  var glueAngle  = Math.tan(15 * Math.PI / 180); // Glue 사선 기울기 (15도)

  /* ── X 기준선 ─────────────────────────────────────────────── */
  var xGlueL  = -GW;               // Glue 좌측
  var xFrontL = 0;                 // front 좌측 (기준점)
  var xFrontR = W;                 // front 우측 = sideL 좌측
  var xSideLR = W + D;             // sideL 우측 = back 좌측
  var xBackR  = W + D + W;         // back 우측 = sideR 좌측
  var xSideRR = W + D + W + (D-2); // sideR 우측 (Glue 겹침 2mm)

  /* ── Y 기준선 ─────────────────────────────────────────────── */
  var yTop         = 0;
  var yFoldTop     = FH;               // 상단 접힘선 (front/back/sideL)
  var yFoldTop_arc = FH + arcR;        // 상단 접힘 arc 끝 (Glue/sideR)
  var yFoldBot     = FH + H + arcR*2;  // 하단 접힘선
  var yFoldBot_arc = FH + H + arcR;    // 하단 접힘 arc 시작 (Glue/sideR)
  var yBot         = FH*2 + H + arcR*2; // 하단 플랩 끝

  /* ── 플랩 대각선 포인트 ───────────────────────────────────── */
  // sideL 상단 플랩 (1-34 ~ 1-36 구간)
  var sideL_diagOffsetL = xFrontR + diagOffset;  // 좌측 대각 시작
  var sideL_diagOffsetR = xSideLR - diagOffset;  // 우측 대각 시작

  // sideR 상단 플랩 (1-25 ~ 1-28 구간)
  var sideR_diagOffsetL = xBackR + diagOffset;   // 좌측 대각 시작
  var sideR_diagOffsetR = xSideRR - D*(8.5/170); // 우측 대각 시작

  // sideR arc 연결점 (1-27: backR+5mm)
  var sideR_arcL = xBackR + D*(5/170);

  /* ── Glue 사선 포인트 ─────────────────────────────────────── */
  // 상단 사선: (xFrontL, yFoldTop_arc) → (xGlueL, yFoldTop_arc + GW*glueAngle)
  var glueTop_dy   = GW * glueAngle;            // ≈ 9.37mm
  var glueTopEndY  = yFoldTop_arc + glueTop_dy;

  // 하단 사선
  var glueBot_dy   = GW * glueAngle;
  var glueBotEndY  = yFoldBot_arc - glueBot_dy;

  /* ── 하단 플랩 대각 ───────────────────────────────────────── */
  var botDiagOff = botDiag; // 3.5mm

  return {
    W: W, D: D, H: H,
    /* 파생값 */
    GW: GW, FH: FH, arcR: arcR,
    diagOffset: diagOffset, botDiag: botDiag,
    glueAngle: glueAngle,
    /* X grid */
    xGlueL: xGlueL, xFrontL: xFrontL, xFrontR: xFrontR,
    xSideLR: xSideLR, xBackR: xBackR, xSideRR: xSideRR,
    /* Y grid */
    yTop: yTop, yFoldTop: yFoldTop, yFoldTop_arc: yFoldTop_arc,
    yFoldBot: yFoldBot, yFoldBot_arc: yFoldBot_arc, yBot: yBot,
    /* 플랩 대각 */
    sideL_diagOffsetL: sideL_diagOffsetL, sideL_diagOffsetR: sideL_diagOffsetR,
    sideR_diagOffsetL: sideR_diagOffsetL, sideR_diagOffsetR: sideR_diagOffsetR,
    sideR_arcL: sideR_arcL,
    /* Glue 사선 */
    glueTop_dy: glueTop_dy, glueTopEndY: glueTopEndY,
    glueBot_dy: glueBot_dy, glueBotEndY: glueBotEndY,
    /* 하단 대각 */
    botDiagOff: botDiagOff,
  };
}
