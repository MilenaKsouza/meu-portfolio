const $ = (s, root=document) => root.querySelector(s);

// Menu mobile
const menuToggle = $("#menuToggle");
const nav = $("#nav");
menuToggle.addEventListener("click", () => {
  const opened = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(opened));
});
nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}));

// Ano automático
$("#year").textContent = new Date().getFullYear();

// Barra de progresso da página
const progress = $("#scrollProgress");
function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
}
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

// Animação de entrada das seções
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

// Efeito 3D da fotografia com o mouse
const stage = $("#portraitStage");
const portrait = $("#portrait");
const canvas = $("#particleCanvas");
const ctx = canvas.getContext("2d");
let particles = [];
let dissolve = 0;
let canvasW = 0, canvasH = 0;

function resizeCanvas() {
  const rect = stage.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvasW = rect.width; canvasH = rect.height;
  canvas.width = Math.round(canvasW * dpr);
  canvas.height = Math.round(canvasH * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

stage.addEventListener("mousemove", event => {
  const r = stage.getBoundingClientRect();
  const x = (event.clientX - r.left) / r.width - .5;
  const y = (event.clientY - r.top) / r.height - .5;
  stage.style.setProperty("--mx", `${x * 13}deg`);
  stage.style.setProperty("--my", `${-y * 10}deg`);
});
stage.addEventListener("mouseleave", () => {
  stage.style.setProperty("--mx", "0deg");
  stage.style.setProperty("--my", "0deg");
});

// Partículas decorativas que se espalham enquanto a pessoa rola para baixo.
// A foto continua sendo a fotografia original; o efeito é aplicado visualmente.
function makeParticles() {
  particles = [];
  const count = 115;
  for (let i=0; i<count; i++) {
    particles.push({
      x: Math.random() * canvasW,
      y: canvasH * (.2 + Math.random() * .75),
      size: 1 + Math.random() * 2.3,
      angle: Math.random() * Math.PI * 2,
      speed: 20 + Math.random() * 95,
      drift: (Math.random() - .5) * 60,
      alpha: .25 + Math.random() * .65,
      hue: Math.random() > .5 ? 325 : 25
    });
  }
}
makeParticles();

function drawParticles() {
  ctx.clearRect(0, 0, canvasW, canvasH);
  if (dissolve > .01) {
    particles.forEach(p => {
      const distance = dissolve * p.speed;
      const x = p.x + Math.cos(p.angle) * distance + p.drift * dissolve;
      const y = p.y + Math.sin(p.angle) * distance - dissolve * 45;
      const alpha = Math.max(0, p.alpha * dissolve * (1 - dissolve * .25));
      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${alpha})`;
      ctx.shadowBlur = 12;
      ctx.shadowColor = p.hue === 325 ? "#ff4fa3" : "#ff914d";
      ctx.arc(x, y, p.size * (.7 + dissolve), 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;
  }
  requestAnimationFrame(drawParticles);
}
drawParticles();

function updateDissolve() {
  const rect = stage.getBoundingClientRect();
  const travel = Math.max(1, window.innerHeight * .8);
  // O efeito começa quando a área da foto se aproxima do topo da janela.
  dissolve = Math.min(1, Math.max(0, (window.innerHeight * .35 - rect.top) / travel));
  portrait.style.opacity = String(Math.max(.12, 1 - dissolve * .92));
  portrait.style.filter = `saturate(${.9 - dissolve * .35}) brightness(${1 - dissolve * .12})`;
}
window.addEventListener("scroll", updateDissolve, { passive: true });
window.addEventListener("resize", updateDissolve);
updateDissolve();
