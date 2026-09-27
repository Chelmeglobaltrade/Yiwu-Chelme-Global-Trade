/* ============================================================
   ESCENA "ASÍ CARGAMOS TU CONTENEDOR" — solo index.html
   Un contenedor con la marca Chelme baja de la grúa, se abre, se
   llena de carga, se escanea y zarpa, avanzando con el scroll.
   Es una ilustración (no una operación real). Three.js se carga
   solo cuando la sección está cerca; sin WebGL o con movimiento
   reducido se muestra la foto y los pasos en forma estática.
   ============================================================ */
(function () {
  "use strict";
  var section = document.getElementById("carga");
  var stage = document.getElementById("storyStage");
  if (!section || !stage) return;
  var steps = section.querySelectorAll("[data-step]");
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function webglOk() {
    try { var c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl"))); }
    catch (e) { return false; }
  }
  // Rangos de cada paso dentro del progreso 0..1.
  var RANGES = [[0, 0.22], [0.22, 0.56], [0.56, 0.76], [0.76, 1.01]];
  function markStep(p) {
    var idx = 0;
    RANGES.forEach(function (r, i) { if (p >= r[0]) idx = i; });
    steps.forEach(function (li, i) { li.classList.toggle("is-on", i === idx); li.classList.toggle("is-done", i < idx); });
  }
  if (reduced || !webglOk()) { section.classList.add("is-static"); steps.forEach(function (li) { li.classList.add("is-on"); }); return; }

  // Carga compartida de Three.js (una sola descarga aunque la pidan varias escenas).
  function loadThree(cb, onErr) {
    if (window.THREE) { cb(); return; }
    var w = window;
    if (!w.__chelmeThreeCbs) {
      w.__chelmeThreeCbs = [];
      w.__chelmeThreeErrs = [];
      var s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
      s.async = true;
      s.onload = function () { var l = w.__chelmeThreeCbs; w.__chelmeThreeCbs = null; l.forEach(function (f) { f(); }); };
      s.onerror = function () { (w.__chelmeThreeErrs || []).forEach(function (f) { f(); }); };
      document.head.appendChild(s);
    }
    if (w.__chelmeThreeCbs) { w.__chelmeThreeCbs.push(cb); if (onErr) w.__chelmeThreeErrs.push(onErr); }
    else if (window.THREE) cb();
  }

  var started = false;
  function load() {
    if (started) return; started = true;
    loadThree(init, function () { section.classList.add("is-static"); });
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (en) { if (en.some(function (e) { return e.isIntersecting; })) { io.disconnect(); load(); } }, { rootMargin: "600px" });
    io.observe(section);
  } else load();

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function seg(p, a, b) { return clamp((p - a) / (b - a), 0, 1); }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function init() {
    var T = window.THREE; if (!T) return;
    var renderer;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { section.classList.add("is-static"); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    var canvas = renderer.domElement;
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", "Ilustración: un contenedor Chelme se carga, se revisa y zarpa");
    stage.appendChild(canvas);
    section.classList.add("has-3d");

    var scene = new T.Scene();
    var camera = new T.PerspectiveCamera(30, 1.4, 0.1, 400);
    scene.add(new T.HemisphereLight(0xffffff, 0x8ea3a8, 0.95));
    var sun = new T.DirectionalLight(0xffffff, 0.75); sun.position.set(10, 16, 12); scene.add(sun);

    var L = 12.03, W = 2.35, H = 2.69, r = 0.13;

    /* ---------- Texturas ---------- */
    function stripes(c, g, w, h, base, dark, step) {
      for (var i = 0; i < w; i += step) {
        var gr = g.createLinearGradient(i, 0, i + step, 0);
        gr.addColorStop(0, dark); gr.addColorStop(0.5, base); gr.addColorStop(1, dark);
        g.fillStyle = gr; g.fillRect(i, 0, step, h);
      }
    }
    function corrugation() {
      var c = document.createElement("canvas"); c.width = 256; c.height = 32;
      stripes(c, c.getContext("2d"), 256, 32, "#2f6472", "#1d4550", 16);
      var t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(L * 2.4, 1); return t;
    }
    var sideCanvas = document.createElement("canvas"); sideCanvas.width = 2048; sideCanvas.height = 458;
    var sideTex = new T.CanvasTexture(sideCanvas);
    function paintSide(logo) {
      var g = sideCanvas.getContext("2d");
      stripes(sideCanvas, g, 2048, 458, "#23505c", "#163a43", 34);
      g.fillStyle = "#DAAD2B"; g.fillRect(0, 392, 2048, 26);
      if (logo) { var lh = 300, lw = lh * logo.width / logo.height; g.drawImage(logo, 90, 50, lw, lh); }
      g.fillStyle = "rgba(255,255,255,.92)";
      g.font = "600 44px 'IBM Plex Mono', Menlo, monospace"; g.textAlign = "right";
      g.fillText("CHLM 041226 2", 1990, 92);
      g.font = "600 34px 'IBM Plex Mono', Menlo, monospace";
      g.fillText("45G1", 1990, 140);
      sideTex.needsUpdate = true;
    }
    paintSide(null);
    var logoImg = new Image();
    logoImg.onload = function () { paintSide(logoImg); requestRender(); };
    logoImg.src = "logo-light.png";
    function hazard() {
      var c = document.createElement("canvas"); c.width = 128; c.height = 16;
      var g = c.getContext("2d"); g.fillStyle = "#1b1b1b"; g.fillRect(0, 0, 128, 16); g.fillStyle = "#DAAD2B";
      for (var i = -16; i < 144; i += 16) { g.beginPath(); g.moveTo(i, 16); g.lineTo(i + 8, 16); g.lineTo(i + 16, 0); g.lineTo(i + 8, 0); g.fill(); }
      var t = new T.CanvasTexture(c); t.wrapS = T.RepeatWrapping; t.repeat.set(4, 1); return t;
    }
    function kraft() {
      var c = document.createElement("canvas"); c.width = c.height = 128;
      var g = c.getContext("2d");
      g.fillStyle = "#c9a26a"; g.fillRect(0, 0, 128, 128);
      g.fillStyle = "#b8904f"; g.fillRect(56, 0, 16, 128);
      g.fillStyle = "#f3eee2"; g.fillRect(14, 84, 30, 18);
      g.strokeStyle = "rgba(74,52,20,.5)"; g.lineWidth = 4; g.strokeRect(2, 2, 124, 124);
      return new T.CanvasTexture(c);
    }

    var wallMat = new T.MeshLambertMaterial({ map: corrugation(), side: T.DoubleSide });
    var frameMat = new T.MeshLambertMaterial({ color: 0x17363f });
    var floorMat = new T.MeshLambertMaterial({ color: 0x6a5440 });
    // Costado cercano (con la marca) y techo: se vuelven transparentes para ver adentro.
    var nearSideMat = new T.MeshLambertMaterial({ map: sideTex, transparent: true });
    var nearPlainMat = new T.MeshLambertMaterial({ color: 0x1d4550, transparent: true });
    var roofMat = new T.MeshLambertMaterial({ color: 0x23505c, transparent: true });

    var world = new T.Group(); scene.add(world);
    var cont = new T.Group(); world.add(cont);

    var ground = new T.Mesh(new T.PlaneGeometry(80, 40), new T.MeshLambertMaterial({ color: 0xd3dadb }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -0.14; world.add(ground);
    var lineMat = new T.MeshBasicMaterial({ color: 0xDAAD2B });
    [-3.2, 3.2].forEach(function (z) { var ln = new T.Mesh(new T.PlaneGeometry(40, 0.12), lineMat); ln.rotation.x = -Math.PI / 2; ln.position.set(0, -0.13, z); world.add(ln); });
    var shadow = new T.Mesh(new T.PlaneGeometry(L + 1, W + 1), new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = -0.125; world.add(shadow);

    function add(parent, geo, mat, x, y, z) { var m = new T.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; }
    add(cont, new T.BoxGeometry(L, 0.1, W), floorMat, 0, -0.05, 0);
    add(cont, new T.BoxGeometry(L, H, 0.06), wallMat, 0, H / 2, -W / 2 - 0.03);
    add(cont, new T.BoxGeometry(0.06, H, W), wallMat, -L / 2 - 0.03, H / 2, 0);
    var near = add(cont, new T.BoxGeometry(L, H, 0.06), [nearPlainMat, nearPlainMat, nearPlainMat, nearPlainMat, nearSideMat, nearPlainMat], 0, H / 2, W / 2 + 0.03);
    var roof = add(cont, new T.BoxGeometry(L + 2 * r, 0.08, W + 2 * r), roofMat, 0, H + 0.04, 0);
    [-W / 2 - r / 2, W / 2 + r / 2].forEach(function (z) {
      add(cont, new T.BoxGeometry(L + 2 * r, r, r), frameMat, 0, -r / 2, z);
      add(cont, new T.BoxGeometry(L + 2 * r, r, r), frameMat, 0, H + r / 2, z);
    });
    [-L / 2 - r / 2, L / 2 + r / 2].forEach(function (x) {
      [-W / 2 - r / 2, W / 2 + r / 2].forEach(function (z) { add(cont, new T.BoxGeometry(r, H + 2 * r, r), frameMat, x, H / 2, z); });
    });
    add(cont, new T.BoxGeometry(r * 1.2, r * 1.4, W + 2 * r), new T.MeshLambertMaterial({ map: hazard() }), L / 2 + r / 2, H + r * 0.7, 0);
    function door(sign) {
      var pivot = new T.Group(); pivot.position.set(L / 2 + r, H / 2, sign * (W / 2 + r / 2));
      var leaf = new T.Mesh(new T.BoxGeometry(0.05, H, W / 2), wallMat); leaf.position.set(0, 0, -sign * W / 4);
      pivot.add(leaf); cont.add(pivot); return pivot;
    }
    var doorFar = door(-1), doorNear = door(1);

    // Grúa: cables desde las esquinas hasta un gancho alto.
    var hook = new T.Group(); cont.add(hook);
    var hookY = H + 7;
    var cableGeo = new T.BufferGeometry();
    var cablePts = new Float32Array(8 * 3);
    cableGeo.setAttribute("position", new T.BufferAttribute(cablePts, 3));
    var cables = new T.LineSegments(cableGeo, new T.LineBasicMaterial({ color: 0x33413f, transparent: true }));
    cont.add(cables);
    var hookMesh = new T.Mesh(new T.BoxGeometry(0.5, 0.7, 0.5), new T.MeshLambertMaterial({ color: 0xDAAD2B }));
    hook.add(hookMesh);
    function setCables(y, opacity) {
      var corners = [[-L / 2, -W / 2], [-L / 2, W / 2], [L / 2, -W / 2], [L / 2, W / 2]];
      corners.forEach(function (c, i) {
        cablePts.set([c[0], H + 0.1, c[1], 0, y, 0], i * 6);
      });
      cableGeo.attributes.position.needsUpdate = true;
      cables.material.opacity = opacity; cables.visible = opacity > 0.02;
      hook.position.set(0, y + 0.35, 0); hookMesh.visible = opacity > 0.02;
    }

    // Carga
    var nx = 12, ny = 3, nz = 3, sx = L / nx, sy = H / ny, sz = W / nz;
    var slots = [];
    for (var ix = 0; ix < nx; ix++) for (var iy = 0; iy < ny; iy++) for (var iz = 0; iz < nz; iz++) {
      slots.push({ x: -L / 2 + sx * (ix + 0.5), y: sy * (iy + 0.5), z: -W / 2 + sz * (iz + 0.5), j: 0.9 + ((ix * 7 + iy * 3 + iz * 5) % 5) * 0.02, sz: (iz - 1) * 1.6, spin: ((ix + iy * 2 + iz) % 4) - 1.5 });
    }
    var USABLE = 97;
    var boxes = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), new T.MeshLambertMaterial({ map: kraft() }), USABLE);
    cont.add(boxes);
    var m4 = new T.Matrix4(), q = new T.Quaternion(), e3 = new T.Euler(), v = new T.Vector3(), s3 = new T.Vector3();

    // Escaneo: plano que recorre y grilla verde en piso y pared del fondo.
    var scanMat = new T.MeshBasicMaterial({ color: 0x3ddc97, transparent: true, opacity: 0.5, side: T.DoubleSide, blending: T.AdditiveBlending, depthWrite: false });
    var scanPlane = new T.Mesh(new T.PlaneGeometry(W + 0.3, H + 0.3), scanMat);
    scanPlane.rotation.y = Math.PI / 2; scanPlane.position.y = H / 2; cont.add(scanPlane);
    // Grilla de escaneo con barras delgadas (las líneas WebGL miden siempre 1 px).
    var gridMat = new T.MeshBasicMaterial({ color: 0x1fd67f, transparent: true, opacity: 0, depthWrite: false, side: T.DoubleSide });
    var grid = new T.Group(); cont.add(grid);
    var bar = 0.045, zn = W / 2 + 0.05;
    function barAt(w, h, d, x, y, z, rz) { var m = new T.Mesh(new T.BoxGeometry(w, h, d), gridMat); m.position.set(x, y, z); if (rz) m.rotation.z = rz; grid.add(m); }
    for (var gx = 0; gx <= nx; gx++) { var x = -L / 2 + gx * sx; barAt(bar, H, bar, x, H / 2, zn); barAt(bar, bar, W, x, 0.03, 0); barAt(bar, H, bar, x, H / 2, -W / 2 + 0.03); }
    for (var gy = 0; gy <= ny; gy++) { var yy = Math.min(H - 0.02, gy * sy + 0.02); barAt(L, bar, bar, 0, yy, zn); barAt(L, bar, bar, 0, yy, -W / 2 + 0.03); }
    for (var gz = 0; gz <= nz; gz++) { barAt(L, bar, bar, 0, 0.03, -W / 2 + gz * sz); }
    var diag = Math.sqrt(L * L + H * H), ang = Math.atan2(H, L);
    barAt(diag, bar * 1.6, bar, 0, H / 2, zn + 0.02, ang);
    barAt(diag, bar * 1.6, bar, 0, H / 2, zn + 0.02, -ang);

    function fit() {
      var w = stage.clientWidth || 600, h = stage.clientHeight || 400;
      renderer.setSize(w, h, false);
      canvas.style.width = "100%"; canvas.style.height = "100%";
      camera.aspect = w / h;
      var vfov = camera.fov * Math.PI / 180;
      var fitW = 16.5, fitH = 9.5;
      var d = Math.max((fitH / 2) / Math.tan(vfov / 2), (fitW / 2) / (Math.tan(vfov / 2) * camera.aspect));
      camera.position.set(d * 0.42, d * 0.36, d * 0.9);
      camera.lookAt(0, 1.6, 0);
      camera.updateProjectionMatrix();
    }

    function render(p) {
      // 0) Baja colgando de la grúa y se abre.
      var drop = ease(seg(p, 0, 0.14));
      cont.position.y = (1 - drop) * 7;
      setCables(hookY + seg(p, 0.14, 0.22) * 6, 1 - seg(p, 0.15, 0.22));
      var open = ease(seg(p, 0.12, 0.22)) * (1 - ease(seg(p, 0.8, 0.88)));
      doorFar.rotation.y = open * Math.PI * 0.62;
      doorNear.rotation.y = -open * Math.PI * 0.62;
      var reveal = seg(p, 0.14, 0.22) * (1 - seg(p, 0.78, 0.86));
      var alpha = 1 - reveal * 0.94;
      nearSideMat.opacity = nearPlainMat.opacity = alpha;
      roofMat.opacity = 1 - reveal;
      near.visible = alpha > 0.03; roof.visible = roofMat.opacity > 0.03;
      nearSideMat.depthWrite = nearPlainMat.depthWrite = alpha > 0.9;
      // 1) Entra la carga volando y se acomoda desde el fondo.
      var load = seg(p, 0.22, 0.56), shown = 0;
      for (var i = 0; i < USABLE; i++) {
        var s = slots[i], start = (i / USABLE) * 0.82, t = clamp((load - start) / 0.18, 0, 1);
        if (t <= 0) { m4.makeScale(0.0001, 0.0001, 0.0001); boxes.setMatrixAt(i, m4); continue; }
        shown++;
        var k = ease(t);
        v.set(L / 2 + 5 + (s.x - (L / 2 + 5)) * k, 4.5 + (s.y - 4.5) * k + Math.sin(Math.PI * k) * 1.4, W / 2 + 3 + s.sz + (s.z - (W / 2 + 3 + s.sz)) * k);
        e3.set(s.spin * (1 - k) * 0.8, s.spin * (1 - k), 0); q.setFromEuler(e3);
        s3.set(sx * s.j * 0.97, sy * 0.94, sz * 0.94);
        m4.compose(v, q, s3); boxes.setMatrixAt(i, m4);
      }
      boxes.instanceMatrix.needsUpdate = true;
      // 2) Escaneo verde.
      var sc = seg(p, 0.56, 0.76);
      scanPlane.visible = sc > 0 && sc < 1;
      scanPlane.position.x = -L / 2 + L * sc;
      gridMat.opacity = Math.min(1, Math.sin(Math.PI * sc) * 1.4);
      // 3) Se cierra y zarpa hacia la derecha.
      var go = ease(seg(p, 0.9, 1));
      cont.position.x = go * 4.5;
      shadow.position.x = cont.position.x;
      shadow.material.opacity = 0.18 * drop * (1 - go);
      renderer.render(scene, camera);
      markStep(p);
    }

    var lastP = -1, queued = false;
    function progress() {
      var rect = section.getBoundingClientRect();
      var span = section.offsetHeight - window.innerHeight;
      return span > 0 ? clamp(-rect.top / span, 0, 1) : 0;
    }
    function requestRender() {
      if (queued) return; queued = true;
      requestAnimationFrame(function () { queued = false; var p = progress(); lastP = p; render(p); });
    }
    window.addEventListener("scroll", requestRender, { passive: true });
    if ("ResizeObserver" in window) new ResizeObserver(function () { fit(); requestRender(); }).observe(stage);
    else window.addEventListener("resize", function () { fit(); requestRender(); });
    fit();
    requestRender();
  }
})();
