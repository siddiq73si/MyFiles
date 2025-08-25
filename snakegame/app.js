/* Friendsy Snake — canvas game with obstacles, power-ups, speed boosts, PWA ready */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').then(reg => {
      const el = document.getElementById('pwaStatus');
      if (el) el.textContent = 'Offline-ready ✓';
    }).catch(() => {
      const el = document.getElementById('pwaStatus');
      if (el) el.textContent = 'Offline disabled';
    });
  });
}

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const speedEl = document.getElementById('speed');
const statusEl = document.getElementById('status');

const bgm = document.getElementById('bgm');
const sfxEat = document.getElementById('sfxEat');
const sfxPower = document.getElementById('sfxPower');
const sfxCrash = document.getElementById('sfxCrash');

// Audio controls (autoplay policies)
const musicBtn = document.getElementById('musicBtn');
musicBtn.addEventListener('click', async () => {
  if (bgm.paused) {
    try {
      await bgm.play();
      musicBtn.textContent = 'Music: On';
      musicBtn.setAttribute('aria-pressed', 'true');
    } catch (e) {}
  } else {
    bgm.pause();
    musicBtn.textContent = 'Music: Off';
    musicBtn.setAttribute('aria-pressed', 'false');
  }
});

// Game constants
const GRID = 32;            // pixels per cell
const COLS = canvas.width / GRID;
const ROWS = canvas.height / GRID;

const COLORS = {
  bg: '#242424',
  grid1: '#2a2a2a',
  grid2: '#2c2c2c',
  snake: '#9ef7c3',
  snakeHead: '#7bffb1',
  food: '#ffd36b',
  obstacle: '#ff6b6b',
  power: '#7bb6ff',
  shield: '#d19bff'
};

// Game state
let snake, dir, nextDir, food, obstacles, power, shieldTimer, speedBoostTimer, doubleScoreTimer, score, speed, gameOver, paused, tickAccumulator;

function resetGame() {
  snake = [{x: Math.floor(COLS/2), y: Math.floor(ROWS/2)}];
  dir = {x: 1, y: 0};
  nextDir = {x: 1, y: 0};
  placeFood();
  obstacles = genObstacles(10);
  power = null;
  shieldTimer = 0;
  speedBoostTimer = 0;
  doubleScoreTimer = 0;
  score = 0;
  speed = 8; // tiles per second
  gameOver = false;
  paused = false;
  tickAccumulator = 0;
  updateHUD();
}
resetGame();

function updateHUD() {
  scoreEl.textContent = `Score: ${score}`;
  speedEl.textContent = `Speed: ${Math.round(speed)}`;
  statusEl.textContent = gameOver ? 'Game Over' : (paused ? 'Paused' : 'Playing');
}

function randInt(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
function randCell(){ return {x: randInt(0, COLS-1), y: randInt(0, ROWS-1)}; }
function cellsEqual(a,b){ return a.x === b.x && a.y === b.y; }
function occupiedBySnake(cell){ return snake.some(s => cellsEqual(s, cell)); }
function occupied(cell){ 
  return occupiedBySnake(cell) || obstacles.some(o => cellsEqual(o, cell)); 
}

function placeFood() {
  do { food = randCell(); } while (occupied(food));
}

function genObstacles(count) {
  const list = [];
  for (let i=0; i<count; i++) {
    let c;
    do { c = randCell(); } while (occupiedBySnake(c) || (food && cellsEqual(c, food)));
    list.push(c);
  }
  return list;
}

function placePowerUp() {
  // Randomly choose between speed boost, shield, or double score
  const types = ['speed', 'shield', 'double'];
  const type = types[randInt(0, types.length-1)];
  let c;
  do { c = randCell(); } while (occupied(c) || (food && cellsEqual(c, food)));
  power = { ...c, type, ttl: 10 + randInt(0,5) }; // stays ~10-15 seconds
}

function drawCell(cell, color) {
  const x = cell.x * GRID;
  const y = cell.y * GRID;
  ctx.fillStyle = color;
  ctx.fillRect(x+2, y+2, GRID-4, GRID-4);
}

function draw() {
  // background coffeehouse grid handled via CSS, here draw dynamic items
  ctx.clearRect(0,0,canvas.width, canvas.height);

  // Draw obstacles
  obstacles.forEach(o => drawCell(o, COLORS.obstacle));

  // Draw food
  drawCell(food, COLORS.food);

  // Draw power-up
  if (power) {
    const c = power.type === 'speed' ? COLORS.power
      : power.type === 'shield' ? COLORS.shield : '#7bffb1';
    drawCell(power, c);
  }

  // Snake
  snake.forEach((s, i) => drawCell(s, i === 0 ? COLORS.snakeHead : COLORS.snake));

  // Active effects border glow
  if (shieldTimer > 0) {
    ctx.strokeStyle = COLORS.shield;
    ctx.lineWidth = 4;
    ctx.strokeRect(2,2,canvas.width-4, canvas.height-4);
  } else if (speedBoostTimer > 0 || doubleScoreTimer > 0) {
    ctx.strokeStyle = '#5aa0ff';
    ctx.lineWidth = 3;
    ctx.strokeRect(3,3,canvas.width-6, canvas.height-6);
  }
}

function step(dt) {
  if (gameOver || paused) return;
  const tps = speed; // tiles per second
  const spf = 1 / tps;
  tickAccumulator += dt;

  // Spawn power-ups sometimes
  if (!power && Math.random() < 0.003) {
    placePowerUp();
  }
  if (power) {
    power.ttl -= dt;
    if (power.ttl <= 0) power = null;
  }

  // Timers
  shieldTimer = Math.max(0, shieldTimer - dt);
  speedBoostTimer = Math.max(0, speedBoostTimer - dt);
  if (speedBoostTimer <= 0) speed = Math.max(6, speed - 4); // restore
  doubleScoreTimer = Math.max(0, doubleScoreTimer - dt);

  while (tickAccumulator >= spf) {
    tickAccumulator -= spf;
    // update direction atomically
    dir = nextDir;

    const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};

    // wrap-around walls
    if (head.x < 0) head.x = COLS-1;
    if (head.y < 0) head.y = ROWS-1;
    if (head.x >= COLS) head.x = 0;
    if (head.y >= ROWS) head.y = 0;

    // collisions
    const hitSelf = snake.slice(1).some(s => cellsEqual(s, head));
    const hitObstacle = obstacles.some(o => cellsEqual(o, head));
    if ((hitSelf || hitObstacle) && shieldTimer <= 0) {
      gameOver = true;
      statusEl.textContent = 'Game Over';
      try { sfxCrash.currentTime = 0; sfxCrash.play(); } catch(e){}
      break;
    }

    // move
    snake.unshift(head);

    // food eat?
    if (cellsEqual(head, food)) {
      let points = 10;
      if (doubleScoreTimer > 0) points *= 2;
      score += points;
      try { sfxEat.currentTime = 0; sfxEat.play(); } catch(e){}
      placeFood();
      // sometimes add an obstacle
      if (Math.random() < 0.25) {
        obstacles.push(randCell());
      }
      // slight natural speed up
      speed = Math.min(20, speed + 0.2);
    } else {
      snake.pop();
    }

    // power-up pickup
    if (power && cellsEqual(head, power)) {
      try { sfxPower.currentTime = 0; sfxPower.play(); } catch(e){}
      if (power.type === 'speed') {
        speed = Math.min(24, speed + 4);
        speedBoostTimer = 8;
      } else if (power.type === 'shield') {
        shieldTimer = 8;
      } else if (power.type === 'double') {
        doubleScoreTimer = 10;
      }
      power = null;
    }
  }

  updateHUD();
  draw();
}

let last = performance.now();
function loop(now) {
  const dt = (now - last)/1000;
  last = now;
  step(dt);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// Input handling
window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (k === 'arrowup' || k === 'w') { if (dir.y !== 1) nextDir = {x:0,y:-1}; }
  if (k === 'arrowdown' || k === 's') { if (dir.y !== -1) nextDir = {x:0,y:1}; }
  if (k === 'arrowleft' || k === 'a') { if (dir.x !== 1) nextDir = {x:-1,y:0}; }
  if (k === 'arrowright' || k === 'd') { if (dir.x !== -1) nextDir = {x:1,y:0}; }
});

// Pause & restart
document.getElementById('pauseBtn').addEventListener('click', () => {
  paused = !paused;
  updateHUD();
});
document.getElementById('restartBtn').addEventListener('click', () => {
  resetGame();
});

// Try to start music on first interaction to satisfy autoplay policies
window.addEventListener('click', async () => {
  if (bgm.paused) {
    try { await bgm.play(); } catch(e) {}
  }
}, { once: true });
