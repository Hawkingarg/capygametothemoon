const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;

const startScreen = document.getElementById("startScreen");
const playButton = document.getElementById("playButton");

const GRAVEDAD = 0.2;
const SALTO = -12;
const BASE_HEIGHT = 40;
const CAMERA_TOP = canvas.height / 3;
const FULL_BG_HEIGHT = 13000;

let capy = { x:0, y:0, width:50, height:50, vy:0 };
let mouseX = 0;
let cameraY = 0;
let deathCount = 0;
let dinero = 0;

let platforms = [];
let coins = [];
let fallingCoins = [];

let gameWon = false;

// Beep simple
const beepAudio = new Audio();
beepAudio.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YQgAAA==";

// Imágenes
const fondoCompleto = new Image();
fondoCompleto.src = "img/fondoCompleto.png";

const capyImage = new Image();
capyImage.src = "img/capybara.png";

const baseImage = new Image();
baseImage.src = "img/basedesalto.png";

const moonImage = new Image();
moonImage.src = "img/moon.png";

// Nueva música que se reproducirá cuando inicie el juego
const musica1 = new Audio("audio/musica1.mp3");
musica1.loop = true;

// Luna
let moon = {
  x: canvas.width / 2 - 60,
  y: 60,
  width: 120,
  height: 120,
  vy: 2,
  minY: 50,
  maxY: 150
};

// Reinicio
function reiniciarJuego() {
  capy.width = 50;
  capy.height = 50;
  capy.x = canvas.width / 2 - capy.width / 2;
  capy.y = FULL_BG_HEIGHT - BASE_HEIGHT - capy.height;
  capy.vy = 0;
  mouseX = capy.x;
  cameraY = FULL_BG_HEIGHT - canvas.height;

  deathCount = 0;
  dinero = 0;
  gameWon = false;

  platforms = [];
  platforms.push({
    x: 0,
    y: FULL_BG_HEIGHT - BASE_HEIGHT,
    width: canvas.width,
    height: BASE_HEIGHT,
    speedX: 0
  });

  let ultimaY = FULL_BG_HEIGHT - BASE_HEIGHT;
  const minDY = 100, maxDY = 140;

  while (ultimaY > 0) {
    const dy = minDY + Math.random() * (maxDY - minDY);
    const newY = ultimaY - dy;
    if (newY < 0) break;

    const w = 100 + Math.random() * 80;
    const x = Math.random() * (canvas.width - w);
    const speedX = (Math.random() < 0.5) ? ((Math.random() < 0.5 ? -1 : 1) * (0.7 + Math.random() * 1.3)) : 0;

    platforms.push({ x, y: newY, width: w, height: 20, speedX });
    ultimaY = newY;
  }

  coins = [];
  fallingCoins = [];

  moon.y = 60;
  moon.vy = 2;
}

// Movimiento
canvas.addEventListener("mousemove", e => {
  mouseX = e.clientX - capy.width / 2;
});

// Update
function update() {
  if (gameWon) return; // Parar update si ganaste

  capy.x += (mouseX - capy.x) * 0.15;
  capy.x = Math.max(0, Math.min(capy.x, canvas.width - capy.width));
  capy.vy += GRAVEDAD;
  capy.y += capy.vy;

  for (let p of platforms) {
    if (p.speedX !== 0) {
      p.x += p.speedX;
      if (p.x < 0 || p.x + p.width > canvas.width) {
        p.speedX *= -1;
        p.x = Math.max(0, Math.min(p.x, canvas.width - p.width));
      }
    }
  }

  for (let p of platforms) {
    if (
      capy.x + capy.width > p.x &&
      capy.x < p.x + p.width &&
      capy.y + capy.height >= p.y &&
      capy.y + capy.height <= p.y + p.height + 10 &&
      capy.vy >= 0
    ) {
      capy.y = p.y - capy.height;
      capy.vy = SALTO;
      break;
    }
  }

  if (capy.y < cameraY + CAMERA_TOP) {
    cameraY = capy.y - CAMERA_TOP;
    cameraY = Math.max(0, Math.min(cameraY, FULL_BG_HEIGHT - canvas.height));
  }

  if ((capy.y - cameraY) > canvas.height) {
    deathCount++;
    reiniciarJuego();
  }

  // Luna rebota vertical
  moon.y += moon.vy;
  if (moon.y < moon.minY || moon.y > moon.maxY) {
    moon.vy *= -1;
  }

  // Colisión con la luna
  if (
    capy.x + capy.width > moon.x &&
    capy.x < moon.x + moon.width &&
    capy.y + capy.height > moon.y &&
    capy.y < moon.y + moon.height
  ) {
    gameWon = true;
    musica1.pause();
    alert("¡Ganaste! ¡Llegaste a la Luna! 🚀🌕");
    reiniciarJuego();
  }
}

// Dibujar
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(fondoCompleto, 0, cameraY, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);

  for (let p of platforms) {
    ctx.drawImage(baseImage, p.x, p.y - cameraY, p.width, p.height);
  }

  ctx.drawImage(capyImage, capy.x, capy.y - cameraY, capy.width, capy.height);

  // Dibuja la luna con ajuste de cámara
  ctx.drawImage(moonImage, moon.x, moon.y - cameraY, moon.width, moon.height);

  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.fillText(`Dinero: $${dinero}`, 20, 90);
  ctx.fillText(`Altura: ${Math.floor((FULL_BG_HEIGHT - BASE_HEIGHT) - capy.y)} m`, 20, 30);
  ctx.fillText(`Muertes: ${deathCount}`, 20, 60);

  if (gameWon) {
    ctx.fillStyle = "#0f0";
    ctx.font = "48px Arial";
    ctx.fillText("¡Ganaste! 🎉", canvas.width / 2 - 100, canvas.height / 2);
  }
}

// Loop
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// Iniciar juego
function iniciarJuego() {
  const video = document.getElementById("backgroundVideo");
  video.pause();
  startScreen.style.display = "none";
  musica1.play();
  reiniciarJuego();
  loop();
}

playButton.addEventListener("click", iniciarJuego);

// Ajustar canvas al cambiar tamaño
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

