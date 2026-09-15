/* Праздничные фейерверки на фоне страницы (классический скрипт, canvas). */
(function () {
  "use strict";

  var canvas = document.getElementById("fireworks");
  if (!canvas || typeof canvas.getContext !== "function") return;

  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);

  var rockets = [];   // поднимающиеся ракеты
  var sparks = [];    // осколки взрыва
  var colors = [
    "#ffd36b", "#F1E5AC", "#EEBC1D", "#FFD700",
  //  "#8ee06a", "#6bd6ff", "#fff6d8", "#ff8fb0"
  ];

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener("resize", resize);
  resize();

  function rand(min, max) { return min + Math.random() * (max - min); }
  function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }

  function launch() {
    var x = rand(W * 0.15, W * 0.85);
    var y = H;
    var targetY = rand(H * 0.14, H * 0.46);
    rockets.push({
      x: x, y: y,
      vx: rand(-0.6, 0.6),
      vy: -(H / rand(0.9, 1.3) + rand(40, 120)),
      targetY: targetY,
      trail: [],
      color: pick(colors)
    });
  }

  function explode(r) {
    var big = Math.random() < 0.85;   // большинство — крупные, как у салюта
    var n = big ? Math.floor(rand(150, 240)) : Math.floor(rand(40, 70));
    var base = r.color;
    var layers = big && Math.random() < 0.7 ? 2 : 1;

    for (var i = 0; i < n; i++) {
      var angle = Math.random() * Math.PI * 2;
      var layer = Math.random() < (layers === 2 ? 0.5 : 0) ? 1.6 : 1;
      var speed = rand(0.6, 3.2) * layer * (Math.random() < 0.85 ? 1 : 0.4);
      var fading = Math.random() < 0.3;
      sparks.push({
        x: r.x, y: r.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: rand(60, 130),
        maxLife: 130,
        size: rand(1, 2.6) * (layer === 1.6 ? 1.2 : 1),
        color: fading ? base : pick(colors),
        flicker: Math.random() < 0.35
      });
    }

    // Вторичный всплеск в центре — «взрыв внутри взрыва»
    if (layers === 2) {
      for (var c = 0; c < 34; c++) {
        var a2 = Math.random() * Math.PI * 2;
        var s2 = rand(0.3, 2.0);
        sparks.push({
          x: r.x, y: r.y,
          vx: Math.cos(a2) * s2,
          vy: Math.sin(a2) * s2,
          life: rand(70, 150),
          maxLife: 150,
          size: rand(1, 2.2),
          color: base,
          flicker: true
        });
      }
    }
  }

  function step() {
    // Ракеты
    for (var i = rockets.length - 1; i >= 0; i--) {
      var r = rockets[i];
      r.trail.push({ x: r.x, y: r.y });
      if (r.trail.length > 22) r.trail.shift();
      r.vy += 0.35;             // лёгкая гравитация для дуги
      r.x += r.vx;
      r.y += r.vy;
      if (r.vy > -0.4 || r.y <= r.targetY) {
        explode(r);
        rockets.splice(i, 1);
      }
    }

    // Осколки
    for (var k = sparks.length - 1; k >= 0; k--) {
      var s = sparks[k];
      s.vx *= 0.985;
      s.vy = s.vy * 0.985 + 0.10;   // гравитация
      s.x += s.vx;
      s.y += s.vy;
      s.life--;
      if (s.life <= 0 || s.y > H + 10) sparks.splice(k, 1);
    }

    // Праздничный салют: ракеты летят практически непрерывно, сериями
    if (Math.random() < 0.28) launch();
    if (Math.random() < 0.12) launch();
    if (Math.random() < 0.05) launch();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";

    // Хвосты ракет
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    for (var i = 0; i < rockets.length; i++) {
      var r = rockets[i];
      var t = r.trail;
      for (var j = t.length - 1; j >= 1; j--) {
        ctx.globalAlpha = (j / t.length) * 0.8;
        ctx.strokeStyle = r.color;
        ctx.beginPath();
        ctx.moveTo(t[j].x, t[j].y);
        ctx.lineTo(t[j - 1].x, t[j - 1].y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = "#fff8e0";
      ctx.beginPath();
      ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Осколки
    for (var k = 0; k < sparks.length; k++) {
      var s = sparks[k];
      var a = Math.max(0, s.life / s.maxLife);
      ctx.globalAlpha = a;
      var size = s.size * (s.flicker ? (0.5 + Math.random() * 0.6) : 1);
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Мерцающие звёзды для нарядности
    var twinkle = (Math.sin(Date.now() / 900)) * 0.5 + 0.5;
    ctx.globalAlpha = 0.25 + 0.35 * twinkle;
    for (var z = 0; z < 26; z++) {
      ctx.fillStyle = "#fff6da";
      ctx.beginPath();
      var sx = ((z * 137.5) % W);
      var sy = ((z * 61.8) % H) * 0.5 + 30;
      ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  // Открывающий праздничный залп
  for (var first = 0; first < 6; first++) launch();

  // Синхронный залп «салюта» — несколько ракет почти одновременно
  function volley() {
    var count = Math.floor(rand(2, 5));
    for (var i = 0; i < count; i++) launch();
  }

  setInterval(volley, rand(2600, 4600));

  function loop() {
    step();
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
