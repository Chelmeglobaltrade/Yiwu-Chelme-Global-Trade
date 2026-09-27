/* ============================================================
   PORTADA — contenedor Chelme en 3D colgando de la grúa.
   Primero se ve la imagen fija (hero-contenedor-chelme.webp); cuando
   la página terminó de cargar, Three.js la reemplaza por el modelo,
   que se mece suave y se puede girar arrastrando. Sin WebGL o con
   movimiento reducido queda la imagen fija.
   ============================================================ */
(function () {
  "use strict";
  var stage = document.getElementById("heroStage");
  if (!stage) return;
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function webglOk() {
    try { var c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl"))); }
    catch (e) { return false; }
  }
  if (reduced || !webglOk()) return;

  // Misma carga compartida de Three.js que usan las otras escenas de la portada.
  function loadThree(cb) {
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
    if (w.__chelmeThreeCbs) w.__chelmeThreeCbs.push(cb);
    else if (window.THREE) cb();
  }
  function start() {
    var idle = window.requestIdleCallback || function (f) { return setTimeout(f, 300); };
    idle(function () { loadThree(init); });
  }
  if (document.readyState === "complete") start(); else window.addEventListener("load", start);

  function init() {
    var T = window.THREE; if (!T) return;
    var renderer;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    var canvas = renderer.domElement;
    canvas.className = "rd3-hero-canvas";
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", "Contenedor 40HQ con la marca Chelme colgando de la grúa. Arrastra para girarlo.");
    stage.appendChild(canvas);

    var scene = new T.Scene();
    var camera = new T.PerspectiveCamera(28, 1.5, 0.1, 200);
    scene.add(new T.HemisphereLight(0xffffff, 0x8ea3a8, 0.95));
    var sun = new T.DirectionalLight(0xffffff, 0.75); sun.position.set(8, 14, 12); scene.add(sun);

    var L = 12.03, W = 2.35, H = 2.69, r = 0.13;

    function stripes(g, w, h, base, dark, step) {
      for (var i = 0; i < w; i += step) {
        var gr = g.createLinearGradient(i, 0, i + step, 0);
        gr.addColorStop(0, dark); gr.addColorStop(0.5, base); gr.addColorStop(1, dark);
        g.fillStyle = gr; g.fillRect(i, 0, step, h);
      }
    }
    function corrugation(rep) {
      var c = document.createElement("canvas"); c.width = 256; c.height = 32;
      stripes(c.getContext("2d"), 256, 32, "#2f6472", "#1d4550", 16);
      var t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rep, 1); return t;
    }
    var sideCanvas = document.createElement("canvas"); sideCanvas.width = 2048; sideCanvas.height = 458;
    var sideTex = new T.CanvasTexture(sideCanvas);
    function paintSide(logo) {
      var g = sideCanvas.getContext("2d");
      stripes(g, 2048, 458, "#23505c", "#163a43", 34);
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
    logoImg.onload = function () { paintSide(logoImg); };
    logoImg.src = "logo-light.png";
    // Frente con puertas: dos hojas con barras de cierre.
    var endCanvas = document.createElement("canvas"); endCanvas.width = 256; endCanvas.height = 290;
    (function () {
      var g = endCanvas.getContext("2d");
      stripes(g, 256, 290, "#2a5c69", "#1b424c", 16);
      g.fillStyle = "#163a43"; g.fillRect(126, 0, 4, 290);
      g.fillStyle = "#9fb4b8";
      [34, 84, 172, 222].forEach(function (x) { g.fillRect(x, 8, 5, 274); g.fillRect(x - 6, 120, 17, 10); });
    })();
    var endTex = new T.CanvasTexture(endCanvas);

    var backMat = new T.MeshLambertMaterial({ map: corrugation(2.5) });
    var sideMat = new T.MeshLambertMaterial({ map: sideTex });
    var endMat = new T.MeshLambertMaterial({ map: endTex });
    var roofMat = new T.MeshLambertMaterial({ color: 0x2c6170 });
    var frameMat = new T.MeshLambertMaterial({ color: 0x17363f });

    var rig = new T.Group(); scene.add(rig);       // se mece
    var cont = new T.Group(); rig.add(cont);       // gira con el arrastre
    function add(geo, mat, x, y, z) { var m = new T.Mesh(geo, mat); m.position.set(x, y, z); cont.add(m); return m; }
    // Caja: +x frente (puertas), -x fondo, ±z costados con la marca.
    add(new T.BoxGeometry(L, H, W), [endMat, backMat, roofMat, frameMat, sideMat, sideMat], 0, 0, 0);
    [-1, 1].forEach(function (sy) {
      [-1, 1].forEach(function (sz) { add(new T.BoxGeometry(L + 2 * r, r, r), frameMat, 0, sy * (H / 2 + r / 2), sz * (W / 2 + r / 2)); });
      [-1, 1].forEach(function (sx) { add(new T.BoxGeometry(r, r, W + 2 * r), frameMat, sx * (L / 2 + r / 2), sy * (H / 2 + r / 2), 0); });
    });
    [-1, 1].forEach(function (sx) { [-1, 1].forEach(function (sz) { add(new T.BoxGeometry(r, H + 2 * r, r), frameMat, sx * (L / 2 + r / 2), 0, sz * (W / 2 + r / 2)); }); });

    // Cables a un gancho alto (fuera de cuadro).
    var hookY = H / 2 + 9;
    var pts = [];
    [[-L / 2 + 0.2, -W / 2], [-L / 2 + 0.2, W / 2], [L / 2 - 0.2, -W / 2], [L / 2 - 0.2, W / 2]].forEach(function (c) { pts.push(c[0], H / 2 + r, c[1], 0, hookY, 0); });
    var cg = new T.BufferGeometry(); cg.setAttribute("position", new T.BufferAttribute(new Float32Array(pts), 3));
    rig.add(new T.LineSegments(cg, new T.LineBasicMaterial({ color: 0x33413f })));
    rig.position.y = 0.4;

    // Sombra suave en el piso.
    var sh = document.createElement("canvas"); sh.width = sh.height = 128;
    (function () { var g = sh.getContext("2d"), gr = g.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, "rgba(23,54,63,.28)"); gr.addColorStop(1, "rgba(23,54,63,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); })();
    var shadow = new T.Mesh(new T.PlaneGeometry(L * 1.3, W * 2.6), new T.MeshBasicMaterial({ map: new T.CanvasTexture(sh), transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = -H / 2 - 1.3; scene.add(shadow);

    var BASE_YAW = -0.32, yaw = BASE_YAW, target = BASE_YAW, dragging = false, lastX = 0, lastUser = 0;
    function resize() {
      var w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // Encuadre: el contenedor entra completo a lo ancho, con margen.
      var tv = Math.tan(camera.fov * Math.PI / 360);
      var dist = Math.max((L * 0.58) / (tv * camera.aspect), (H * 1.9) / tv);
      camera.position.set(0, dist * 0.36, dist);
      camera.lookAt(0, 0.6, 0);
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    canvas.addEventListener("pointerdown", function (e) { dragging = true; lastX = e.clientX; canvas.setPointerCapture(e.pointerId); stage.classList.add("is-dragging"); });
    canvas.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      target += (e.clientX - lastX) * 0.008; lastX = e.clientX; lastUser = performance.now();
    });
    function end() { dragging = false; stage.classList.remove("is-dragging"); }
    canvas.addEventListener("pointerup", end); canvas.addEventListener("pointercancel", end);

    var visible = true, running = false;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) loop(); }).observe(stage);
    }
    document.addEventListener("visibilitychange", function () { if (!document.hidden) loop(); });

    var t0 = performance.now();
    function frame(now) {
      var t = (now - t0) / 1000;
      // Sin interacción por 2,5 s, vuelve despacio a su ángulo con un leve vaivén.
      if (!dragging && now - lastUser > 2500) target += (BASE_YAW + Math.sin(t * 0.35) * 0.12 - target) * 0.02;
      yaw += (target - yaw) * 0.12;
      cont.rotation.y = yaw;
      rig.rotation.z = Math.sin(t * 0.9) * 0.012;
      rig.position.y = 0.4 + Math.sin(t * 0.7) * 0.06;
      renderer.render(scene, camera);
    }
    function loop() {
      if (running) return; running = true;
      (function tick(now) {
        if (!visible || document.hidden) { running = false; return; }
        frame(now || performance.now());
        requestAnimationFrame(tick);
      })();
    }
    renderer.render(scene, camera);
    requestAnimationFrame(function () { stage.classList.add("has-3d"); loop(); });
  }
})();
