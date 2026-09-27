/* ============================================================
   CONTENEDOR 3D DE LA CALCULADORA — solo index.html
   Dibuja un contenedor real (20GP, 40GP o 40HQ) con el costado
   cercano abierto y lo llena con cajas según los m³ del cliente.
   En consolidado, el resto del espacio se muestra como carga de
   otros importadores. Recibe los datos por el evento "chelme:fill"
   que emite home-interactive.js. Three.js se carga solo cuando la
   calculadora está cerca de verse. Sin WebGL, queda la barra 2D.
   ============================================================ */
(function () {
  "use strict";
  var slot = document.getElementById("miniFill3d");
  var fillBox = document.getElementById("miniFill");
  if (!slot || !fillBox) return;

  function webglOk() {
    try {
      var c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (e) { return false; }
  }
  if (!webglOk()) return;

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var CONFIG = window.CHELME_CONFIG || {};
  var caps = (CONFIG.fcl && CONFIG.fcl.capacityCbm) || { "20GP": 28, "40GP": 58, "40HQ": 68 };
  // Medidas interiores aproximadas en metros.
  var DIMS = {
    "20GP": { L: 5.9, W: 2.35, H: 2.39 },
    "40GP": { L: 12.03, W: 2.35, H: 2.39 },
    "40HQ": { L: 12.03, W: 2.35, H: 2.69 }
  };

  var api = null, lastDetail = null, loading = false;
  window.addEventListener("chelme:fill", function (e) {
    lastDetail = e.detail;
    if (api) api.set(lastDetail);
  });

  function load() {
    if (loading) return;
    loading = true;
    if (window.THREE) { init(); return; }
    var s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    s.async = true;
    s.onload = init;
    document.head.appendChild(s);
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (en) { return en.isIntersecting; })) { io.disconnect(); load(); }
    }, { rootMargin: "400px" });
    io.observe(fillBox);
  } else {
    load();
  }

  function init() {
    var T = window.THREE;
    if (!T) return;
    var renderer;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    var canvas = renderer.domElement;
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", "Contenedor que se llena según el volumen de tu carga");
    slot.insertBefore(canvas, slot.firstChild);

    var scene = new T.Scene();
    var camera = new T.PerspectiveCamera(26, 2.6, 0.1, 300);
    scene.add(new T.HemisphereLight(0xffffff, 0x8fa4a9, 0.95));
    var sun = new T.DirectionalLight(0xffffff, 0.7);
    sun.position.set(8, 14, 10);
    scene.add(sun);

    var root = new T.Group();
    scene.add(root);
    var shell = new T.Group();
    root.add(shell);

    /* ---------- Texturas dibujadas en canvas ---------- */
    function corrugation(base, dark) {
      var c = document.createElement("canvas"); c.width = 256; c.height = 32;
      var g = c.getContext("2d");
      for (var i = 0; i < 256; i += 16) {
        var gr = g.createLinearGradient(i, 0, i + 16, 0);
        gr.addColorStop(0, dark); gr.addColorStop(0.5, base); gr.addColorStop(1, dark);
        g.fillStyle = gr; g.fillRect(i, 0, 16, 32);
      }
      var t = new T.CanvasTexture(c);
      t.wrapS = t.wrapT = T.RepeatWrapping;
      return t;
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
    function hazard() {
      var c = document.createElement("canvas"); c.width = 128; c.height = 16;
      var g = c.getContext("2d");
      g.fillStyle = "#1b1b1b"; g.fillRect(0, 0, 128, 16);
      g.fillStyle = "#DAAD2B";
      for (var i = -16; i < 144; i += 16) { g.beginPath(); g.moveTo(i, 16); g.lineTo(i + 8, 16); g.lineTo(i + 16, 0); g.lineTo(i + 8, 0); g.fill(); }
      var t = new T.CanvasTexture(c); t.wrapS = T.RepeatWrapping; return t;
    }

    var wallTex = corrugation("#2f6472", "#1d4550");
    var wallMat = new T.MeshLambertMaterial({ map: wallTex, side: T.DoubleSide });
    var frameMat = new T.MeshLambertMaterial({ color: 0x17363f });
    var floorMat = new T.MeshLambertMaterial({ color: 0x6a5440 });
    var hazardTex = hazard();
    var hazardMat = new T.MeshLambertMaterial({ map: hazardTex });
    var boxMat = new T.MeshLambertMaterial({ map: kraft() });
    var ghostMat = new T.MeshLambertMaterial({ color: 0xd9e4e6, transparent: true, opacity: 0.32, depthWrite: false });

    var MAX = 200;
    var unit = new T.BoxGeometry(1, 1, 1);
    var boxes = new T.InstancedMesh(unit, boxMat, MAX);
    var ghosts = new T.InstancedMesh(unit, ghostMat, MAX);
    boxes.count = 0; ghosts.count = 0;
    root.add(ghosts); root.add(boxes);

    var scan = new T.Group();
    var scanPlane = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ color: 0x3ddc97, transparent: true, opacity: 0.28, side: T.DoubleSide, blending: T.AdditiveBlending, depthWrite: false }));
    var scanEdge = new T.LineSegments(new T.EdgesGeometry(new T.PlaneGeometry(1, 1)), new T.LineBasicMaterial({ color: 0x5dfcb0 }));
    scan.add(scanPlane); scan.add(scanEdge);
    scan.rotation.y = Math.PI / 2;
    scan.visible = false;
    root.add(scan);

    var dims = DIMS["40HQ"], grid = null;

    function add(geo, mat, x, y, z) {
      var m = new T.Mesh(geo, mat); m.position.set(x, y, z); shell.add(m); return m;
    }
    function buildShell(d) {
      while (shell.children.length) shell.remove(shell.children[0]);
      var L = d.L, W = d.W, H = d.H, t = 0.06, r = 0.13;
      wallTex.repeat.set(L * 2.4, 1);
      add(new T.BoxGeometry(L, 0.1, W), floorMat, 0, -0.05, 0);
      add(new T.BoxGeometry(L, H, t), wallMat, 0, H / 2, -W / 2 - t / 2);
      add(new T.BoxGeometry(t, H, W), wallMat, -L / 2 - t / 2, H / 2, 0);
      // Marco: rieles, postes y cabezal de puertas con franja de seguridad.
      [[-W / 2 - t], [W / 2]].forEach(function (zz) {
        add(new T.BoxGeometry(L + 2 * r, r, r), frameMat, 0, -r / 2, zz[0] + (zz[0] > 0 ? r / 2 : 0));
        add(new T.BoxGeometry(L + 2 * r, r, r), frameMat, 0, H + r / 2, zz[0] + (zz[0] > 0 ? r / 2 : 0));
      });
      [-L / 2 - r / 2, L / 2 + r / 2].forEach(function (xx) {
        [-W / 2 - r / 2, W / 2 + r / 2].forEach(function (zz) { add(new T.BoxGeometry(r, H + 2 * r, r), frameMat, xx, H / 2, zz); });
      });
      add(new T.BoxGeometry(r, r, W + 2 * r), frameMat, -L / 2 - r / 2, H + r / 2, 0);
      var head = add(new T.BoxGeometry(r * 1.2, r * 1.4, W + 2 * r), hazardMat, L / 2 + r / 2, H + r * 0.7, 0);
      hazardTex.repeat.set(4, 1);
      head.rotation.x = 0;
      // Puerta del fondo abierta.
      var pivot = new T.Group();
      pivot.position.set(L / 2 + r, H / 2, -W / 2 - r / 2);
      var leaf = new T.Mesh(new T.BoxGeometry(0.05, H, W / 2), wallMat);
      leaf.position.set(0, 0, W / 4);
      pivot.add(leaf);
      pivot.rotation.y = Math.PI * 0.62;
      shell.add(pivot);
      // Grilla de posiciones para las cajas: se carga desde el fondo, de piso a techo.
      var nx = Math.max(4, Math.round(L / 1.0)), ny = 3, nz = 3;
      var sx = L / nx, sy = H / ny, sz = W / nz;
      var slots = [];
      for (var ix = 0; ix < nx; ix++) for (var iy = 0; iy < ny; iy++) for (var iz = 0; iz < nz; iz++) {
        slots.push({ x: -L / 2 + sx * (ix + 0.5), y: sy * (iy + 0.5), z: -W / 2 + sz * (iz + 0.5), j: 0.9 + ((ix * 7 + iy * 3 + iz * 5) % 5) * 0.02 });
      }
      var interior = L * W * H;
      grid = { slots: slots, sx: sx, sy: sy, sz: sz, usable: Math.min(slots.length, Math.round(slots.length * Math.min(1, (caps[d.key] || interior) / interior))) };
      scanPlane.scale.set(W + 0.3, H + 0.3, 1);
      scanEdge.scale.set(W + 0.3, H + 0.3, 1);
      scanPlane.position.y = scanEdge.position.y = H / 2;
    }

    /* ---------- Estado y animación ---------- */
    var mode = "lcl", key = "40HQ", target = 0, shown = 0, appearAt = [], scanStart = -1;
    var m4 = new T.Matrix4(), q = new T.Quaternion(), v = new T.Vector3(), sc = new T.Vector3();
    var rotY = -0.22, dragging = false, dragX = 0, dragBase = 0, running = false;

    function fitCamera() {
      var w = slot.clientWidth || 600;
      var h = Math.round(Math.max(190, Math.min(320, w * 0.4)));
      renderer.setSize(w, h, false);
      canvas.style.width = "100%"; canvas.style.height = h + "px";
      camera.aspect = w / h;
      // Encuadre pensado para un 40 pies; un 20 pies se ve más corto a propósito.
      var fitW = 16.2, fitH = 6.2;
      var vfov = camera.fov * Math.PI / 180;
      var distH = (fitH / 2) / Math.tan(vfov / 2);
      var distW = (fitW / 2) / (Math.tan(vfov / 2) * camera.aspect);
      var dist = Math.max(distH, distW) * 1.02;
      camera.position.set(0, dist * 0.55, dist);
      camera.lookAt(0, 1.0, 0);
      camera.updateProjectionMatrix();
    }

    function place(mesh, i, s, yOff, scale) {
      v.set(s.x, s.y + yOff, s.z);
      sc.set(grid.sx * s.j * scale, grid.sy * 0.94 * scale, grid.sz * 0.94 * scale);
      m4.compose(v, q, sc);
      mesh.setMatrixAt(i, m4);
    }

    function draw(now) {
      var busy = false;
      boxes.count = target;
      for (var i = 0; i < target; i++) {
        var t0 = appearAt[i], k = 1;
        if (t0 != null) {
          k = Math.min(1, Math.max(0, (now - t0) / 420));
          if (k < 1) busy = true;
        }
        var e = 1 - Math.pow(1 - k, 3);
        place(boxes, i, grid.slots[i], (1 - e) * 1.6, k === 0 ? 0.0001 : 1);
      }
      boxes.instanceMatrix.needsUpdate = true;
      var g = 0;
      if (mode === "lcl") {
        for (var j = target; j < grid.usable; j++) { place(ghosts, g, grid.slots[j], 0, 1); g++; }
      }
      ghosts.count = g;
      ghosts.instanceMatrix.needsUpdate = true;
      if (scanStart >= 0) {
        var p = (now - scanStart) / 1100;
        if (p >= 1) { scan.visible = false; scanStart = -1; }
        else { scan.visible = true; scan.position.x = -dims.L / 2 + dims.L * p; busy = true; }
      }
      root.rotation.y = rotY;
      renderer.render(scene, camera);
      return busy || dragging;
    }
    function loop() {
      if (running) return;
      running = true;
      (function frame(now) {
        if (draw(now || performance.now())) requestAnimationFrame(frame);
        else running = false;
      })(performance.now());
    }

    function set(detail) {
      if (!detail) return;
      var nextKey = DIMS[detail.container] ? detail.container : "40HQ";
      if (nextKey !== key || !grid) {
        key = nextKey; dims = DIMS[key]; dims.key = key;
        buildShell(dims);
        shown = 0; appearAt = [];
      }
      mode = detail.service === "fcl" ? "fcl" : "lcl";
      slot.classList.toggle("is-fcl", mode === "fcl");
      var share = Math.max(0, Math.min(1, Number(detail.share) || 0));
      var n = Math.round(share * grid.usable);
      if (share > 0 && n === 0) n = 1;
      n = Math.min(n, grid.usable, MAX);
      var now = performance.now();
      if (n > shown) {
        var stagger = reduced ? 0 : Math.max(6, Math.min(45, 700 / (n - shown)));
        for (var i = shown; i < n; i++) appearAt[i] = reduced ? null : now + (i - shown) * stagger;
      }
      target = n; shown = n;
      if (!reduced && n > 0) scanStart = now + Math.min(500, n * 8);
      loop();
    }

    // Girar con el mouse o el dedo (en horizontal; el scroll vertical sigue libre).
    canvas.style.touchAction = "pan-y";
    canvas.addEventListener("pointerdown", function (e) { dragging = true; dragX = e.clientX; dragBase = rotY; canvas.setPointerCapture(e.pointerId); loop(); });
    canvas.addEventListener("pointermove", function (e) { if (!dragging) return; rotY = Math.max(-1.1, Math.min(0.5, dragBase + (e.clientX - dragX) * 0.006)); });
    function end() { dragging = false; }
    canvas.addEventListener("pointerup", end);
    canvas.addEventListener("pointercancel", end);

    dims = DIMS["40HQ"]; dims.key = "40HQ";
    buildShell(dims);
    fitCamera();
    if ("ResizeObserver" in window) new ResizeObserver(function () { fitCamera(); loop(); }).observe(slot);
    else window.addEventListener("resize", function () { fitCamera(); loop(); });

    slot.hidden = false;
    fillBox.classList.add("has-3d");
    api = { set: set };
    if (lastDetail) set(lastDetail);
    else if (typeof window.chelmeFillRefresh === "function") window.chelmeFillRefresh();
    else loop();
  }
})();
