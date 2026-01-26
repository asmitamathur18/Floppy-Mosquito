const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

resize();
window.addEventListener("resize", resize);

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

/* ---------------- GAME STATE ---------------- */
let bird;
let pipes = [];
let frame = 0;
let running = false;
let score = 0;
let revives = 3;
let crashed = false;

/* ---------------- UI ---------------- */
const overlay = document.getElementById("overlay");
const title = document.getElementById("title");
const reviveInfo = document.getElementById("reviveInfo");
const reviveBtn = document.getElementById("reviveBtn");
const startBtn = document.getElementById("startBtn");

/* ---------------- MOSQUITO ---------------- */
function resetBird() {
  bird = {
    x: canvas.width * 0.2,
    y: canvas.height / 2,
    vy: 0,
    r: 12
  };
}

/* ---------------- START ---------------- */
function startGame() {
  overlay.style.display = "none";
  resetBird();
  pipes = [];
  frame = 0;
  score = 0;
  crashed = false;
  running = true;
  loop();
}

/* ---------------- SPAWN HANDS ---------------- */
function spawnPipe() {
  const gapSize = 200;
  const gapCenter =
    Math.random() * (canvas.height - gapSize - 200) + 100;

  pipes.push({
    x: canvas.width,
    width: 80,
    gapCenter,
    gapSize,
    offset: 0,
    dir: 1,
    speed: 0.4,
    passed: false
  });
}

/* ---------------- UPDATE ---------------- */
function update() {
  bird.vy += 0.6;
  bird.y += bird.vy;

  if (bird.y < bird.r || bird.y > canvas.height - bird.r) crash();

  if (frame % 120 === 0) spawnPipe();

  pipes.forEach(p => {
    p.x -= 3;

    // clapping motion
    p.offset += p.dir * p.speed;
    if (Math.abs(p.offset) > 35) p.dir *= -1;

    const gapHalf = p.gapSize / 2;
    const topBottom = p.gapCenter - gapHalf + p.offset;
    const bottomTop = p.gapCenter + gapHalf - p.offset;

    const hit =
      bird.x + bird.r > p.x &&
      bird.x - bird.r < p.x + p.width &&
      (bird.y - bird.r < topBottom ||
       bird.y + bird.r > bottomTop);

    if (hit) crash();

    if (!p.passed && p.x + p.width < bird.x) {
      p.passed = true;
      score++;
    }
  });

  pipes = pipes.filter(p => p.x + p.width > 0);
}

/* ---------------- GARDEN BACKGROUND ---------------- */
function drawGardenBackground() {
  // sky
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#87CEEB");
  sky.addColorStop(0.6, "#BFEFFF");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // distant trees
  ctx.fillStyle = "#6B8E23";
  for (let i = 0; i < canvas.width; i += 120) {
    ctx.beginPath();
    ctx.arc(i + 60, canvas.height * 0.55, 70, 0, Math.PI * 2);
    ctx.fill();
  }

  // bushes
  ctx.fillStyle = "#3E7C17";
  for (let i = 0; i < canvas.width; i += 80) {
    ctx.beginPath();
    ctx.arc(i, canvas.height * 0.65, 50, 0, Math.PI * 2);
    ctx.fill();
  }

  // grass
  ctx.fillStyle = "#2E8B57";
  ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);
}

/* ---------------- HAND DRAW ---------------- */
function drawHand(x, y, width, height, isTop) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#f1c27d";

  // palm
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, 25);
  ctx.fill();

  // fingers
  const fingerCount = 4;
  const fingerW = width / (fingerCount + 1);
  const fingerH = 22;

  for (let i = 0; i < fingerCount; i++) {
    const fx = fingerW * (i + 0.7);
    const fy = isTop ? -fingerH : height;

    ctx.beginPath();
    ctx.roundRect(fx, fy, fingerW * 0.8, fingerH, 8);
    ctx.fill();
  }

  ctx.restore();
}

/* ---------------- DRAW ---------------- */
function draw() {
  drawGardenBackground();

  // mosquito
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2);
  ctx.fill();

  // hands
  pipes.forEach(p => {
    const gapHalf = p.gapSize / 2;
    const topBottom = p.gapCenter - gapHalf + p.offset;
    const bottomTop = p.gapCenter + gapHalf - p.offset;

    drawHand(p.x, 0, p.width, topBottom, true);
    drawHand(
      p.x,
      bottomTop,
      p.width,
      canvas.height - bottomTop,
      false
    );
  });

  // HUD
  ctx.fillStyle = "#000";
  ctx.font = "18px Arial";
  ctx.fillText(`Score: ${score}`, 20, 30);
  ctx.fillText(`Revives: ${revives}`, 20, 55);
}

/* ---------------- LOOP ---------------- */
function loop() {
  if (!running) return;
  update();
  draw();
  frame++;
  requestAnimationFrame(loop);
}

/* ---------------- CRASH / REVIVE ---------------- */
function crash() {
  if (crashed) return;
  crashed = true;
  running = false;

  overlay.style.display = "block";
  title.innerText = "You Crashed";

  if (revives > 0) {
    reviveInfo.innerText = `Revives left: ${revives}`;
    reviveBtn.style.display = "inline-block";
    startBtn.style.display = "none";
  } else {
    reviveInfo.innerText = "Game Over";
    reviveBtn.style.display = "none";
    startBtn.style.display = "inline-block";
  }
}

function revive() {
  revives--;
  resetBird();
  pipes = [];
  crashed = false;
  overlay.style.display = "none";
  running = true;
  loop();
}

/* ---------------- CONTROLS ---------------- */
document.addEventListener("keydown", e => {
  if (e.code === "Space" && running) bird.vy = -10;
});

canvas.addEventListener("click", () => {
  if (running) bird.vy = -10;
});
