/* ================================================================
   SPEKTR -- WEIRD POLYGON + SATELLITE CLUSTER
   Main blob: ~80 nodes, fibonacci sphere + trig noise distortion.
   Satellite: ~22 nodes anchored upper-left, bridged to main blob.
   Starfield background (pure dots, no glow). Galaxy rotation.
   ================================================================ */
(function neuralDiamond () {
  if (!window.SpektrEnv?.NEURAL_DIAMOND) return;
  if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const sec = document.querySelector('.neural-diamond');
  const cv  = sec?.querySelector('.nd-canvas');
  if (!sec || !cv || !window.gsap) return;
  const cx = cv.getContext('2d');
  let W, H, cx0, cy0;

  let nodes3d = [], edges = [], stars = [];
  let labeledNodes = [];  // { nodeIdx, label }
  let mouse = { x: -9999, y: -9999 };

  const LABELS = [
    'HERO', 'PRODUCT ALCOVES', 'THE CREED', '360 INSPECTION',
    'THE STANDARD', 'THE RANGE', 'WORN AND PROVEN',
    'IN THE WILD', 'PIT WALL CONTACT', 'SPEC TICKER',
  ];
  const LEFT_LABEL_SET   = new Set(['IN THE WILD', 'PIT WALL CONTACT', 'SPEC TICKER']);

  /* layered trig noise → roughly [-1, 1] */
  function noise (a, b, seed) {
    return Math.sin(a * 1.7 + seed)          * 0.50
         + Math.sin(b * 2.3 + seed * 1.4)   * 0.28
         + Math.sin((a+b) * 3.1 + seed*.7)  * 0.14
         + Math.sin(a * 5.9 - b*1.3 + seed*2.1) * 0.08;
  }

  /* proximity edges, shared de-dup set */
  function connectProximity (nodeList, allNodes, used, k, offset) {
    for (let ii = 0; ii < nodeList.length; ii++) {
      const i  = ii + offset;
      const ni = allNodes[i];
      const dists = allNodes
        .map((nj, j) => ({ j, d: Math.hypot(nj.x-ni.x, nj.y-ni.y, nj.z-ni.z) }))
        .filter(o => o.j !== i)
        .sort((a, b) => a.d - b.d);
      const valence = k + ((ii * 7 + 3) % 3);   // 3-4 or 4-5
      dists.slice(0, valence).forEach(({ j }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!used.has(key)) { used.add(key); edges.push({ a: i, b: j }); }
      });
    }
  }

  function buildGeometry () {
    W   = cv.width  = sec.offsetWidth;
    H   = cv.height = sec.offsetHeight;
    cx0 = W / 2;
    cy0 = H / 2;

    const R  = Math.min(W, H) * 0.60;   // wider
    const GA = 137.508 * Math.PI / 180;

    /* ---- main blob: 100 nodes ---- */
    const MAIN_N = 100;
    const mainNodes = [];
    for (let i = 0; i < MAIN_N; i++) {
      const phi   = Math.acos(1 - 2 * (i + 0.5) / MAIN_N);
      const theta = i * GA;

      const bx = Math.sin(phi) * Math.cos(theta);
      const by = Math.cos(phi);
      const bz = Math.sin(phi) * Math.sin(theta);

      const bump = 1.0
        + noise(phi, theta, i * 0.31) * 0.55
        + noise(phi, theta, i * 1.17) * 0.28
        + noise(phi, theta, i * 3.41) * 0.12;

      const dPhi   = noise(phi, theta, i * 0.77) * 0.45;
      const dTheta = noise(phi, theta, i * 1.53) * 0.60;
      const p2 = phi + dPhi, t2 = theta + dTheta;
      const wx = Math.sin(p2)*Math.cos(t2), wy = Math.cos(p2), wz = Math.sin(p2)*Math.sin(t2);

      const mix = 0.55;
      mainNodes.push({
        x: (bx*(1-mix) + wx*mix) * R * bump,
        y: (by*(1-mix) + wy*mix) * R * bump,
        z: (bz*(1-mix) + wz*mix) * R * bump,
      });
    }

    /* ---- satellite A: upper-left ---- */
    const SC_A = { x: -R * 0.82, y: -R * 0.70, z: R * 0.10 };
    /* ---- satellite B: lower-right ---- */
    const SC_B = { x:  R * 0.80, y:  R * 0.65, z: R * 0.05 };
    /* ---- satellite C: right ---- */
    const SC_C = { x:  R * 0.90, y: -R * 0.20, z:-R * 0.15 };

    function makeSat (SC, SR, N, seed) {
      const nodes = [];
      for (let i = 0; i < N; i++) {
        const a1 = i * 53.7  * Math.PI / 180 + noise(i+seed, 0, 1.1) * 1.4;
        const a2 = i * 137.5 * Math.PI / 180 + noise(i+seed, 0, 2.3) * 1.0;
        const r  = SR * (0.35 + 0.65 * Math.abs(noise(i+seed, i, i * 0.17)));
        nodes.push({
          x: SC.x + Math.sin(a1)*Math.cos(a2)*r*(1+noise(a1,a2,(i+seed)*0.4)*0.4),
          y: SC.y + Math.cos(a1)              *r*(1+noise(a2,a1,(i+seed)*0.6)*0.35),
          z: SC.z + Math.sin(a1)*Math.sin(a2)*r*(1+noise(a1,a2,(i+seed)*0.9)*0.45),
        });
      }
      return nodes;
    }

    const satA = makeSat(SC_A, R * 0.28, 18, 0);
    const satB = makeSat(SC_B, R * 0.26, 16, 50);
    const satC = makeSat(SC_C, R * 0.24, 14, 100);

    /* ---- inner cloud: 35 nodes at 15-40% R filling the centre ---- */
    const innerNodes = [];
    const GA2 = 137.508 * Math.PI / 180;
    for (let i = 0; i < 35; i++) {
      const phi   = Math.acos(1 - 2 * (i + 0.5) / 35);
      const theta = i * GA2 + noise(i, phi, 0.9) * 1.2;
      const r     = R * (0.28 + 0.32 * Math.abs(noise(phi, theta, i * 0.3)));
      innerNodes.push({
        x: Math.sin(phi)*Math.cos(theta)*r,
        y: Math.cos(phi)*r,
        z: Math.sin(phi)*Math.sin(theta)*r,
      });
    }

    nodes3d = [...mainNodes, ...satA, ...satB, ...satC, ...innerNodes];
    edges = [];
    const used = new Set();

    const SAT_A_START  = MAIN_N;
    const SAT_B_START  = MAIN_N + satA.length;
    const SAT_C_START  = SAT_B_START + satB.length;
    const INNER_START  = SAT_C_START + satC.length;

    connectProximity(mainNodes,  nodes3d, used, 3, 0);
    connectProximity(satA,       nodes3d, used, 3, SAT_A_START);
    connectProximity(satB,       nodes3d, used, 3, SAT_B_START);
    connectProximity(satC,       nodes3d, used, 3, SAT_C_START);
    /* inner cloud: higher valence (5-7) so the middle is dense */
    connectProximity(innerNodes, nodes3d, used, 5, INNER_START);

    /* bridge each satellite to main blob (5 shortest edges each) */
    function bridge (fromStart, fromEnd) {
      const br = [];
      for (let i = 0; i < MAIN_N; i++)
        for (let j = fromStart; j < fromEnd; j++) {
          const ni = nodes3d[i], nj = nodes3d[j];
          br.push({ a: i, b: j, d: Math.hypot(ni.x-nj.x, ni.y-nj.y, ni.z-nj.z) });
        }
      br.sort((a,b)=>a.d-b.d).slice(0,5).forEach(({a,b})=>{
        const key=a<b?`${a}-${b}`:`${b}-${a}`;
        if(!used.has(key)){used.add(key);edges.push({a,b});}
      });
    }
    bridge(SAT_A_START, SAT_B_START);
    bridge(SAT_B_START, SAT_C_START);
    bridge(SAT_C_START, INNER_START);
    /* also bridge inner cloud to main blob */
    bridge(INNER_START, nodes3d.length);

    /* NOTE: labeled nodes are picked AFTER this point, so we
       enforce the 5-connection minimum as a post-pick step below. */


    const minHalf = Math.min(W, H) * 0.67;
    const safeR   = minHalf * FOV / (FOV + minHalf);
    const bandR   = R * 0.950;   // exclude top/bottom 30% of height

    const safePool = nodes3d
      .map((n, i) => ({ i, r: Math.hypot(n.x, n.y, n.z) }))
      .filter(o => o.r <= safeR)
      .map(o => o.i);

    /* mid-band pool: within safeR AND not at top/bottom extremes */
    let midPool = safePool.filter(i => Math.abs(nodes3d[i].y) <= bandR);

    /* if mid-band is too small, inject internal ring nodes at 50% R */
    const NEED = LABELS.length;
    if (midPool.length < NEED) {
      const GA2   = 137.508 * Math.PI / 180;
      const extra = NEED - midPool.length + 6;   // a few spares
      const innerR = R * 0.50;
      for (let i = 0; i < extra; i++) {
        const phi   = Math.acos(1 - 2*(i+0.5)/extra);
        const theta = i * GA2;
        /* keep only nodes in the middle band */
        const y = Math.cos(phi) * innerR;
        if (Math.abs(y) > bandR) continue;
        const newNode = {
          x: Math.sin(phi)*Math.cos(theta)*innerR,
          y,
          z: Math.sin(phi)*Math.sin(theta)*innerR,
        };
        const newIdx = nodes3d.length;
        nodes3d.push(newNode);
        /* connect to 3 nearest existing nodes */
        const nearest = nodes3d
          .slice(0, newIdx)
          .map((n, j) => ({ j, d: Math.hypot(n.x-newNode.x, n.y-newNode.y, n.z-newNode.z) }))
          .sort((a,b)=>a.d-b.d)
          .slice(0, 3);
        nearest.forEach(({ j }) => {
          const key = j < newIdx ? `${j}-${newIdx}` : `${newIdx}-${j}`;
          if (!used.has(key)) { used.add(key); edges.push({ a: j, b: newIdx }); }
        });
        midPool.push(newIdx);
      }
    }

    /* farthest-point sampling on the safe subset */
    function farthestSample (pool, count, seeds = []) {
      if (pool.length === 0) return [];
      /* start selection with seeds so distances account for already-placed nodes */
      const sel = seeds.length ? [...seeds] : [pool[0]];
      const out = [];
      while (out.length < Math.min(count, pool.length)) {
        let bestIdx = -1, bestDist = -Infinity;
        for (const i of pool) {
          if (sel.includes(i)) continue;
          let minD = Infinity;
          for (const s of sel) {
            const d = Math.hypot(
              nodes3d[i].x - nodes3d[s].x,
              nodes3d[i].y - nodes3d[s].y,
              nodes3d[i].z - nodes3d[s].z);
            if (d < minD) minD = d;
          }
          if (minD > bestDist) { bestDist = minD; bestIdx = i; }
        }
        if (bestIdx < 0) break;
        sel.push(bestIdx);
        out.push(bestIdx);
      }
      return out;
    }

    /* split label groups */
    const leftLabels  = LABELS.filter(l =>  LEFT_LABEL_SET.has(l));
    const rightLabels = LABELS.filter(l => !LEFT_LABEL_SET.has(l));

    /* left-side: 3 most-negative-x nodes from mid-band */
    const leftPool = [...midPool]
      .sort((a, b) => nodes3d[a].x - nodes3d[b].x)
      .slice(0, leftLabels.length);
    const usedLeft = new Set(leftPool);

    /* all 7 right labels: single farthest-point pass from mid-band, seeded by left */
    const rightPool  = midPool.filter(i => !usedLeft.has(i));
    const rightNodes = farthestSample(rightPool, rightLabels.length, leftPool);

    labeledNodes = [
      ...leftLabels.map((label, i)  => ({ nodeIdx: leftPool[i]   ?? 0, label, smoothS: 1.0, side: 'left',  slx: null, sly: null })),
      ...rightLabels.map((label, i) => ({ nodeIdx: rightNodes[i] ?? 0, label, smoothS: 1.0, side: 'right', slx: null, sly: null })),
    ];

    /* ensure every labeled node has ≥5 connections */
    const MIN_CONN = 7;
    labeledNodes.forEach(ln => {
      const ni  = ln.nodeIdx;
      const deg = edges.filter(e => e.a === ni || e.b === ni).length;
      if (deg >= MIN_CONN) return;
      /* find nearest nodes not yet connected */
      const connected = new Set(
        edges.filter(e => e.a === ni || e.b === ni).map(e => e.a === ni ? e.b : e.a)
      );
      const candidates = nodes3d
        .map((n, j) => ({ j, d: Math.hypot(n.x-nodes3d[ni].x, n.y-nodes3d[ni].y, n.z-nodes3d[ni].z) }))
        .filter(o => o.j !== ni && !connected.has(o.j))
        .sort((a, b) => a.d - b.d);
      const need = MIN_CONN - deg;
      candidates.slice(0, need).forEach(({ j }) => {
        const key = ni < j ? `${ni}-${j}` : `${j}-${ni}`;
        if (!used.has(key)) { used.add(key); edges.push({ a: ni, b: j }); }
      });
    });

    /* assign a random birth threshold to every edge —
       edges appear in scattered order when revealed crosses their threshold */
    edges.forEach(e => { e.birthT = Math.pow(Math.random(), 0.6); });
  }

  /* ---- starfield: pure dots, no glow ---- */
  function buildStars () {
    const COLS = ['255,255,255','200,220,255','255,245,210','210,200,255'];
    const base = Array.from({ length: 1800 }, () => ({
      x: Math.random()*W, y: Math.random()*H,
      r: 0.1 + Math.random()*1.0,
      base: 0.08 + Math.random()*0.55,
      speed: 0.0003 + Math.random()*0.001,
      phase: Math.random()*Math.PI*2,
      col: COLS[~~(Math.random()*COLS.length)],
    }));

    const bCos = Math.cos(Math.PI*0.28), bSin = Math.sin(Math.PI*0.28);
    const band = Array.from({ length: 600 }, () => {
      const along = (Math.random()-.5)*Math.hypot(W,H);
      const perp  = (Math.random()-.5)*H*0.24*Math.pow(Math.random(),0.6);
      return {
        x: cx0+along*bCos-perp*bSin, y: cy0+along*bSin+perp*bCos,
        r: 0.1+Math.random()*0.55,
        base: 0.06+Math.random()*0.32,
        speed: 0.0002+Math.random()*0.0008,
        phase: Math.random()*Math.PI*2,
        col: COLS[~~(Math.random()*COLS.length)],
      };
    });
    stars = [...base, ...band];
  }

  /* ================================================================
     3D MATHS
  ================================================================ */
  function rotXY (x, y, z, rx, ry) {
    const cy=Math.cos(ry),sy=Math.sin(ry);
    const x1=x*cy+z*sy, z1=-x*sy+z*cy;
    const cx_=Math.cos(rx),sx=Math.sin(rx);
    return { x: x1, y: y*cx_-z1*sx, z: y*sx+z1*cx_ };
  }
  const FOV = 1200;
  const project = (x,y,z) => { const s=FOV/(FOV+z); return {sx:cx0+x*s,sy:cy0+y*s,s}; };

  /* ================================================================
     PULSES
  ================================================================ */
  const pulses = [];
  function spawnPulse () {
    if (!edges.length) return;
    pulses.push({ edge:edges[~~(Math.random()*edges.length)], t:0,
                  spd:0.003+Math.random()*0.006, big:Math.random()<0.22 });
  }

  /* ================================================================
     STATE
  ================================================================ */
  let rotY=0, rotX=0.22, scrollTilt=0, elapsed=0, revealed=0;
  let mouseVelX=0, mouseVelY=0, lastMouseMove=0;
  let scrollReveal=0;
  let maxScrollReveal=0;  /* one-way ratchet — phases never reverse */
  let vortexParts=[];
  let edgeBolts=[];     /* active strand bolts on highlighted edges */

  /* ---- bolt helpers (same algorithm as nav strand) ---- */
  function mkBolt (x1,y1,x2,y2,depth,segs) {
    if (depth<=0){segs.push([x1,y1,x2,y2]);return;}
    const len=Math.hypot(x2-x1,y2-y1);
    const mx=(x1+x2)/2+(Math.random()-0.5)*len*0.28;
    const my=(y1+y2)/2+(Math.random()-0.5)*len*0.28;
    mkBolt(x1,y1,mx,my,depth-1,segs);
    mkBolt(mx,my,x2,y2,depth-1,segs);
  }
  function buildBolt (ax,ay,bx,by) {
    const raw=[];
    mkBolt(ax,ay,bx,by,4,raw);
    let cum=0;
    const segs=raw.map(([x1,y1,x2,y2])=>{
      const l=Math.hypot(x2-x1,y2-y1);
      const s={ax:x1,ay:y1,bx:x2,by:y2,start:cum,end:cum+l};
      cum+=l; return s;
    });
    return {segs,totalLen:cum,phase:'grow',progress:0,life:1.0,
      growRate:1/(70+Math.random()*40),
      holdFrames:10+~~(Math.random()*8),heldFrames:0,
      decayRate:1/(40+Math.random()*24)};
  }
  function drawBoltSeg (seg,rev) {
    if (seg.start>=rev) return;
    cx.beginPath(); cx.moveTo(seg.ax,seg.ay);
    if (seg.end<=rev){ cx.lineTo(seg.bx,seg.by); }
    else { const t=(rev-seg.start)/(seg.end-seg.start); cx.lineTo(seg.ax+(seg.bx-seg.ax)*t,seg.ay+(seg.by-seg.ay)*t); }
    cx.stroke();
  }

  /* ================================================================
     DRAW
  ================================================================ */
  function drawScene (ts, dt) {
    cx.clearRect(0,0,W,H);

    /* all phase calculations use the highest sr ever reached — no reversal */
    maxScrollReveal = Math.max(maxScrollReveal, scrollReveal);
    const sr          = maxScrollReveal;
    const VORTEX_END  = 0.43;  /* whirlpool clears by here */
    const POLY_START  = 0.44;  /* polygon burst begins    */
    const POLY_END    = 0.82;  /* polygon fully formed    */
    const LABEL_START = 0.80;
    /* polygon hidden during whirlpool, one-way ratchet once formed */
    const newRevealed = sr < POLY_START ? 0
      : Math.max(0, Math.min(1, (sr - POLY_START) / (POLY_END - POLY_START)));
    revealed = Math.max(revealed, newRevealed);
    const labelsRevealed = Math.max(0, Math.min(1, (sr - LABEL_START) / (1 - LABEL_START)));
    const vortexFade  = Math.max(0, Math.min(1, 1 - sr / (VORTEX_END + 0.04)));

    /* stars — single blit from offscreen canvas, refreshed at ~10fps */
    if (ts - lastStarDraw > 100) drawStarsOffscreen(ts);
    if (starCanvas) cx.drawImage(starCanvas, 0, 0);

    /* ---- camera-shutter vortex (phase 0→0.45) ---- */
    if (vortexFade > 0.01) {
      /* half-diagonal of the canvas so blades fill the full section */
      const R0    = Math.hypot(W, H) * 0.52;
      /* shutter rotation: blades spin as they close inward */
      const shutterRot = elapsed * 0.18;          /* gentle ambient rotation */

      vortexParts.forEach(p => {
        /* each star collapses on its own schedule (inner first) */
        const localSR  = Math.max(0, sr - p.phaseOff);
        const collapse = Math.pow(Math.min(1, localSR / 0.44), 1.6);

        /* iris contraction: r shrinks toward 0, blades rotate inward */
        const curR   = R0 * p.r * (1 - collapse);
        /* shutter blade rotation accelerates as it collapses */
        const curAng = p.angle + shutterRot + collapse * Math.PI * 0.55;

        const x = cx0 + Math.cos(curAng) * curR;
        const y = cy0 + Math.sin(curAng) * curR;

        /* entry fade-in over first 8% + collapse fade-out */
        const entryFade = Math.min(1, localSR / 0.08);
        const a = p.opacity * vortexFade * entryFade;
        if (a < 0.008) return;

        cx.beginPath();
        cx.arc(x, y, p.size, 0, Math.PI * 2);
        cx.fillStyle = `rgba(${p.col},${a.toFixed(3)})`;
        cx.fill();
      });
    }

    if (!nodes3d.length) return;

    const rx = rotX + Math.sin(elapsed*0.9)*0.07 + scrollTilt;
    const ry = rotY + Math.sin(elapsed*0.55)*0.04;
    const pts = nodes3d.map(n => { const r=rotXY(n.x,n.y,n.z,rx,ry); return {...project(r.x,r.y,r.z),depth:r.z}; });

    /* depth-sort edges */
    const sortedE = [...edges].sort((a,b)=>
      (pts[a.a].depth+pts[a.b].depth)-(pts[b.a].depth+pts[b.b].depth));

    /* which labeled corners is the cursor over? 
       check node dot radius AND text bounding box (uses prev-frame bounds) */
    const hoveredNodes = new Set();
    for (const ln of labeledNodes) {
      const n = pts[ln.nodeIdx];
      if (!n) continue;
      let hit = false;
      if (Math.hypot(mouse.x-n.sx, mouse.y-n.sy) < 18) { hit = true; }
      else if (ln.slx !== null && ln.stw) {
        const lx1 = ln.side==='left' ? ln.slx-ln.stw : ln.slx;
        const lx2 = ln.side==='left' ? ln.slx        : ln.slx+ln.stw;
        if (mouse.x>=lx1-4 && mouse.x<=lx2+4 && mouse.y>=ln.sly-12 && mouse.y<=ln.sly+12) hit=true;
      }
      if (hit) { hoveredNodes.add(ln.nodeIdx); break; } /* first match only */
    }

    /* edges — burst-in via random birthT, depth-sorted for draw order */
    const hovEdgeList = [];
    sortedE.forEach(e => {
      const a=pts[e.a], b=pts[e.b];
      if (!a || !b) return;
      /* edge invisible until revealed passes its random birth threshold */
      if (revealed < e.birthT) return;
      /* fade-in window: 0.06 of revealed above birthT */
      const edgeProg = Math.min(1, (revealed - e.birthT) / 0.06);
      const avgZ   = (a.depth+b.depth)/2;
      const adjHov = hoveredNodes.has(e.a) || hoveredNodes.has(e.b);
      const alpha  = adjHov ? 0.85 : Math.max(0.03, Math.min(0.28, 0.18-avgZ/2800));
      const lw     = adjHov ? 0.8  : 0.18;
      cx.strokeStyle = `rgba(255,255,255,${(alpha*edgeProg).toFixed(3)})`;
      cx.lineWidth   = lw;
      cx.beginPath(); cx.moveTo(a.sx,a.sy); cx.lineTo(b.sx,b.sy); cx.stroke();
      if (adjHov) {
        const hovA = hoveredNodes.has(e.a);
        hovEdgeList.push({
          ax: hovA ? b.sx : a.sx, ay: hovA ? b.sy : a.sy,
          bx: hovA ? a.sx : b.sx, by: hovA ? a.sy : b.sy,
          key: `${e.a}-${e.b}`,
        });
      }
    });

    /* ---- strand bolts on highlighted edges ---- */
    if (hoveredNodes.size > 0 && hovEdgeList.length) {
      /* spawn up to 3 bolts on randomly chosen highlighted edges;
         respawn when a bolt finishes, keeping the effect alive while hovering */
      const activeKeys = new Set(edgeBolts.map(b=>b.edgeKey));
      const candidates = hovEdgeList.filter(e=>!activeKeys.has(e.key));
      /* shuffle candidates, pick at most 2 random edges */
      for (let i=candidates.length-1;i>0;i--){const j=~~(Math.random()*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]];}
      const slots = Math.max(0, 2 - edgeBolts.length);
      for (let i=0; i<Math.min(slots, candidates.length); i++) {
        const pick = candidates[i];
        const bolt = buildBolt(pick.ax,pick.ay,pick.bx,pick.by);
        bolt.edgeKey = pick.key;
        edgeBolts.push(bolt);
      }
    } else {
      edgeBolts = [];  /* clear instantly when hover ends */
    }

    /* tick + draw each active bolt */
    edgeBolts = edgeBolts.filter(b => {
      /* state machine */
      if (b.phase==='grow'){
        b.progress=Math.min(1,b.progress+b.growRate);
        if (b.progress>=1){b.phase='hold';b.heldFrames=0;}
      } else if (b.phase==='hold'){
        b.heldFrames++;
        if (b.heldFrames>=b.holdFrames) b.phase='fade';
      } else {
        b.life-=b.decayRate;
        if (b.life<=0) return false;   /* remove finished bolt */
      }
      /* draw — same 3-layer technique as nav strand */
      const rev   = b.progress*b.totalLen;
      const alpha = b.phase==='fade' ? b.life*b.life : 1.0;
      cx.shadowColor='#D72B2B'; cx.shadowBlur=18;
      cx.strokeStyle=`rgba(180,20,20,${(alpha*0.55).toFixed(3)})`; cx.lineWidth=2.2;
      b.segs.forEach(s=>drawBoltSeg(s,rev));
      cx.shadowColor='#FF3030'; cx.shadowBlur=10;
      cx.strokeStyle=`rgba(225,35,35,${(alpha*0.85).toFixed(3)})`; cx.lineWidth=0.8;
      b.segs.forEach(s=>drawBoltSeg(s,rev));
      cx.shadowColor='#FF6060'; cx.shadowBlur=4;
      cx.strokeStyle=`rgba(255,140,140,${(alpha*0.60).toFixed(3)})`; cx.lineWidth=0.35;
      b.segs.forEach(s=>drawBoltSeg(s,rev));
      cx.shadowBlur=0;
      return true;
    });

    /* nodes + labeled corners */
    if (revealed > 0.05) {
      const hovIdx = hoveredNodes.size ? [...hoveredNodes][0] : -1;

      /* pass 1: all nodes except the hovered one — no shadow active */
      [...pts].sort((a,b)=>a.depth-b.depth).forEach((n, ni) => {
        if (ni === hovIdx) return;   /* drawn last, isolated */
        const f = Math.max(0.10, Math.min(0.55, 0.38-n.depth/2200));
        cx.beginPath(); cx.arc(n.sx, n.sy, 1.8*n.s, 0, Math.PI*2);
        cx.fillStyle = `rgba(255,255,255,${f.toFixed(2)})`; cx.fill();
      });

      /* pass 2: hovered labeled corner on top — shadow cannot bleed onto other dots */
      if (hovIdx >= 0 && pts[hovIdx]) {
        const n = pts[hovIdx];
        cx.shadowColor='#D72B2B'; cx.shadowBlur=24;
        cx.beginPath(); cx.arc(n.sx, n.sy, 4.0*n.s, 0, Math.PI*2);
        cx.fillStyle='rgba(215,43,43,0.95)'; cx.fill();
        cx.shadowBlur=0;
      }

      /* labels: compute positions, separate overlaps, clamp, draw */
      if (revealed > 0.4 && labelsRevealed > 0.01) {
        cx.font         = '700 18px "Montserrat",sans-serif';
        cx.textBaseline = 'middle';
        cx.textAlign    = 'left';
        const LERP = 1 - Math.pow(0.9992, dt);
        const LH   = 22;   // line height for overlap test
        const PAD  = 14;

        /* build raw positions */
        const boxes = labeledNodes.map(ln => {
          const n  = pts[ln.nodeIdx];
          ln.smoothS += ((n?.s ?? 1) - ln.smoothS) * LERP;
          const tw   = cx.measureText(ln.label).width;
          ln.stw = tw;  // store for next-frame hover detection
          return { ln, n, tw, lx: (n?.sx ?? 0) + 14, ly: n?.sy ?? 0 };
        });

        /* iterative separation — push overlapping labels apart on Y */
        for (let iter = 0; iter < 8; iter++) {
          for (let i = 0; i < boxes.length; i++) {
            for (let j = i + 1; j < boxes.length; j++) {
              const a = boxes[i], b = boxes[j];
              const yGap = Math.abs(a.ly - b.ly);
              if (yGap < LH) {
                const push = (LH - yGap) / 2 + 1;
                if (a.ly <= b.ly) { a.ly -= push; b.ly += push; }
                else              { a.ly += push; b.ly -= push; }
              }
            }
          }
        }

        /* clamp to viewport + lerp toward target position */
        boxes.forEach(({ ln, n, tw, lx, ly }) => {
          if (!n) return;
          const hov   = hoveredNodes.has(ln.nodeIdx);
          const alpha = (hov
            ? 0.95
            : Math.max(0.08, Math.min(0.60, (ln.smoothS - 0.75) / 0.55))
          ) * labelsRevealed;
          let clx, align;
          if (ln.side === 'left') {
            align = 'right';
            clx   = Math.max(tw + PAD, Math.min(n.sx - 14, W - PAD));
          } else {
            align = 'left';
            clx   = Math.min(W - tw - PAD, Math.max(PAD, lx));
          }
          const cly = Math.min(H - PAD, Math.max(PAD, ly));
          if (ln.slx === null) { ln.slx = clx; ln.sly = cly; }
          ln.slx += (clx - ln.slx) * 0.06;
          ln.sly += (cly - ln.sly) * 0.06;
          /* slide up animation driven by labelsRevealed */
          const slideY = (1 - labelsRevealed) * 28;
          cx.textAlign = align;
          cx.fillStyle = hov
            ? `rgba(215,43,43,${alpha.toFixed(4)})`
            : `rgba(255,255,255,${alpha.toFixed(4)})`;
          if (hov) { cx.shadowColor='#D72B2B'; cx.shadowBlur=14; }
          cx.fillText(ln.label, ln.slx, ln.sly + slideY);
          cx.shadowBlur=0;

          /* red underline */
          ln.lineProgress += (hov ? 1 : 0 - ln.lineProgress) * 0.14;
          if (ln.lineProgress > 0.005) {
            const lineW = tw * ln.lineProgress;
            const lineX = ln.side === 'left' ? ln.slx - lineW : ln.slx;
            cx.fillStyle = '#D72B2B';
            cx.fillRect(lineX, ln.sly + slideY + 11, lineW, 1);
          }
        });
        cx.textAlign = 'left';
      }
    }

    /* pulses */
    pulses.forEach(p => {
      const a=pts[p.edge.a], b=pts[p.edge.b];
      const sc=a.s+(b.s-a.s)*p.t;
      cx.beginPath();
      cx.arc(a.sx+(b.sx-a.sx)*p.t, a.sy+(b.sy-a.sy)*p.t, (p.big?2.2:1.3)*sc, 0, Math.PI*2);
      cx.fillStyle=`rgba(255,255,255,${p.big?0.88:0.50})`;
      cx.fill();
    });

    /* nodes */
    if (revealed>0.05) {
      [...pts].sort((a,b)=>a.depth-b.depth).forEach(n=>{
        const f=Math.max(0.10,Math.min(0.55,0.38-n.depth/2200));
        cx.beginPath(); cx.arc(n.sx,n.sy,1.8*n.s,0,Math.PI*2);
        cx.fillStyle=`rgba(255,255,255,${f.toFixed(2)})`; cx.fill();
      });
    }
  }

  /* ---- camera-shutter vortex: 6 spiral blades covering the full section ---- */
  function buildVortex () {
    const BLADES    = 6;
    const PER_BLADE = 90;          /* 540 total — enough to fill the section */
    const COLS = ['255,255,255','210,225,255','255,215,215','225,240,255','255,245,200'];
    vortexParts = [];
    for (let b = 0; b < BLADES; b++) {
      const base = (b / BLADES) * Math.PI * 2;
      for (let j = 0; j < PER_BLADE; j++) {
        const t       = (j + Math.random()*0.8) / PER_BLADE;   /* 0→1 along blade */
        const r       = 0.06 + t * 0.96;                        /* fraction of half-diagonal */
        /* spiral twist: outer stars curl more, giving the blade its curve */
        const twist   = r * 2.2;
        /* blade width: widest in the middle, tapered at root + tip */
        const spread  = (0.5 - Math.abs(t - 0.5)) * 0.38;
        const angle   = base + twist + (Math.random() - 0.5) * spread;
        vortexParts.push({
          r,
          angle,
          size    : 0.4 + Math.random() * 1.9,
          opacity : Math.max(0.15, 0.90 - t * 0.35),
          col     : COLS[~~(Math.random() * COLS.length)],
          /* outer stars collapse later than inner — creates inward wave */
          phaseOff: t * 0.12 + Math.random() * 0.04,
        });
      }
    }
  }

  /* ---- offscreen star canvas (updated at ~10fps) ---- */
  let starCanvas = null, starCtx = null, lastStarDraw = 0;
  function buildStarCanvas () {
    starCanvas        = document.createElement('canvas');
    starCanvas.width  = W;
    starCanvas.height = H;
    starCtx           = starCanvas.getContext('2d');
  }
  function drawStarsOffscreen (ts) {
    if (!starCtx) return;
    starCtx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      const tw = 0.5 + 0.5*Math.sin(ts*s.speed+s.phase);
      starCtx.beginPath();
      starCtx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      starCtx.fillStyle = `rgba(${s.col},${(s.base*(0.35+0.65*tw)).toFixed(3)})`;
      starCtx.fill();
    });
    lastStarDraw = ts;
  }

  /* ================================================================
     LOOP  — capped at 30fps to keep scroll budget free
  ================================================================ */
  const FRAME_MS = 1000 / 30;
  let raf=null, last=0, lastFrame=0;
  function tick (ts) {
    raf = requestAnimationFrame(tick);
    const dt=Math.min((ts-last)/16.67,3); last=ts; lastFrame=ts;
    elapsed += 0.00028*dt;

    /* opposite-direction mouse drag rotation */
    const now = performance.now();
    const mouseMoving = mouse.x > -9000 && (now - lastMouseMove) < 500;
    if (mouseMoving) {
      rotY -= mouseVelX * 0.00045 * dt;
      rotX -= mouseVelY * 0.00032 * dt;
    } else {
      rotY += 0.00022 * dt;
    }
    mouseVelX *= Math.pow(0.97, dt);
    mouseVelY *= Math.pow(0.97, dt);
    for (let i=pulses.length-1;i>=0;i--) { pulses[i].t+=pulses[i].spd*dt; if(pulses[i].t>=1) pulses.splice(i,1); }
    if (Math.random()<0.09 && pulses.length<35) spawnPulse();
    drawScene(ts, dt);
  }

  /* ================================================================
     INIT
  ================================================================ */
  window.addEventListener('spektr:ready', () => {
    buildGeometry(); buildStars(); buildStarCanvas(); buildVortex();
    window.addEventListener('resize', () => { buildGeometry(); buildStars(); buildStarCanvas(); buildVortex(); }, {passive:true});

    /* mouse tracking relative to canvas */
    cv.addEventListener('mousemove', e => {
      const r  = cv.getBoundingClientRect();
      const nx = (e.clientX - r.left) * (W / r.width);
      const ny = (e.clientY - r.top)  * (H / r.height);
      if (mouse.x > -9000) {
        /* lerp toward new delta for smooth velocity */
        mouseVelX += (nx - mouse.x - mouseVelX) * 0.10;
        mouseVelY += (ny - mouse.y - mouseVelY) * 0.10;
      }
      mouse.x = nx; mouse.y = ny;
      lastMouseMove = performance.now();
    }, { passive: true });
    cv.addEventListener('mouseleave', () => {
      mouse.x = -9999; mouse.y = -9999; lastMouseMove = 0;
    }, { passive: true });

    if (window.ScrollTrigger) {
      /* tilt as section scrolls past (after pin releases) */
      ScrollTrigger.create({
        trigger:sec, start:'top bottom', end:'bottom top', scrub:true,
        onUpdate(self){ scrollTilt=(self.progress-0.5)*0.12; },
      });

      /* pinned reveal: whirlpool → diamond → labels */
      ScrollTrigger.create({
        trigger : sec,
        start   : 'top top',
        end     : '+=250%',
        pin     : true,
        scrub   : 0.6,
        onUpdate (self) { scrollReveal = self.progress; },
        onEnter () {
          last = performance.now(); lastFrame = 0;
          if (!raf) raf = requestAnimationFrame(tick);
        },
        onLeaveBack () { cancelAnimationFrame(raf); raf = null; },
      });
    } else {
      /* fallback: no ScrollTrigger — reveal immediately */
      scrollReveal = 1;
      new IntersectionObserver(([e])=>{
        if (e.isIntersecting) {
          last=performance.now(); lastFrame=0;
          if (!raf) raf=requestAnimationFrame(tick);
        } else { cancelAnimationFrame(raf); raf=null; }
      },{threshold:0.08}).observe(sec);
    }
  });
})();
