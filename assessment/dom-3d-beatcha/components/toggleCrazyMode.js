let PROJECTS = [];
let on,
  ready,
  drag,
  moved = false,
  frame = null;
let cam, ren, css, cards, lx, ly;
let tRY = 0,
  rY = 0,
  tRX = 0,
  rX = 0,
  tZ = 1600,
  z = 1600,
  aRY = 0,
  tt = 1;
const F = [],
  T = [];
let isClosing = false;

async function loadProjectData() {
  PROJECTS = await fetch("../projects.json").then((r) => r.json());
}

class CSS3DRenderer {
  constructor(el) {
    this.dom = el;
    this.objs = [];
  }
  addObject(obj) {
    Object.assign(obj.style, { position: "absolute", left: "50%", top: "50%" });
    this.dom.appendChild(obj);
    this.objs.push(obj);
  }
  render(cam) {
    const fov =
      this.dom.clientHeight /
      (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)));
    this.objs.forEach((el) => {
      const p = el.pos.clone().applyMatrix4(cam.matrixWorldInverse);
      if (p.z > 0) return (el.style.display = "none");
      el.style.display = "";
      const s = fov / -p.z;
      el.style.transform = `translate(-50%,-50%) translate3d(${p.x * s}px,${-p.y * s}px,0) scale(${s})`;
      el.style.zIndex = Math.round(-p.z);
    });
  }
}

function init() {
  const [W, H] = [window.innerWidth, window.innerHeight];
  ren = new THREE.WebGLRenderer({
    canvas: document.getElementById("crazy-canvas"),
    alpha: true,
  });
  ren.setSize(W, H);
  cam = new THREE.PerspectiveCamera(40, W / H, 1, 10000);
  css = new CSS3DRenderer(document.getElementById("css3d-layer"));

  cards = PROJECTS.map((p, i) => {
    const el = document.createElement("a");
    el.className = "c3d-card";
    el.href = p.url;
    el.innerHTML = `<div class="c3d-cat">${p.category}</div><div class="c3d-title">${p.title}</div>`;

    const phi = Math.acos(-1 + (2 * i) / PROJECTS.length);
    const theta = Math.sqrt(PROJECTS.length * Math.PI) * phi;

    el.pos = new THREE.Vector3().setFromSphericalCoords(700, phi, theta);
    css.addObject(el);
    T[i] = el.pos.clone();
    F[i] = new THREE.Vector3();
    return el;
  });

  const scene = document.getElementById("crazy-scene");
  scene.onmousedown = (e) => {
    if (e.target.closest("a, button")) return;
    drag = moved = true;
    [lx, ly] = [e.clientX, e.clientY];
  };
  window.onmouseup = () => (drag = false);
  window.onmousemove = (e) => {
    if (!drag) return;
    tRY += (e.clientX - lx) * 0.005;
    tRX += (e.clientY - ly) * 0.005;
    [lx, ly] = [e.clientX, e.clientY];
  };
}

function loop() {
  frame = requestAnimationFrame(loop);

  if (!moved && !isClosing) aRY += 0.0012;

  if (isClosing) {
    tRY = rY = tRX = rX = 0;
  }

  rY += (tRY + aRY - rY) * 0.05;
  rX = Math.max(-1.1, Math.min(1.1, rX + (tRX - rX) * 0.05));
  z += (tZ - z) * 0.07;

  cam.position.set(
    Math.sin(rY) * Math.cos(rX) * z,
    Math.sin(rX) * z,
    Math.cos(rY) * Math.cos(rX) * z,
  );
  cam.lookAt(0, 0, 0);
  cam.updateMatrixWorld();
  cam.matrixWorldInverse.copy(cam.matrixWorld).invert();

  if (tt < 1) {
    tt = Math.min(1, tt + 0.025);
    cards.forEach((el, i) => el.pos.lerpVectors(F[i], T[i], tt));

    if (tt >= 1 && isClosing) {
      exitScene();
    }
  }

  css.render(cam);
}

function exitScene() {
  on = false;
  isClosing = false;
  const container = document.getElementById("projects-container");
  const scene = document.getElementById("crazy-scene");

  document.body.classList.remove("crazy-mode-active");
  container.style.visibility = "visible";
  scene.classList.remove("active");

  if (frame) {
    cancelAnimationFrame(frame);
    frame = null;
  }

  cards.forEach((el, i) => {
    const phi = Math.acos(-1 + (2 * i) / PROJECTS.length);
    const theta = Math.sqrt(PROJECTS.length * Math.PI) * phi;
    T[i].setFromSphericalCoords(700, phi, theta);
  });
}

window.toggleCrazyMode = async function () {
  const container = document.getElementById("projects-container");
  const scene = document.getElementById("crazy-scene");
  const btn = document.getElementById("crazyModeToggle");

  const W = window.innerWidth,
    H = window.innerHeight;

  if (!on) {
    on = true;
    if (PROJECTS.length === 0) await loadProjectData();
    if (!ready) {
      init();
      ready = true;
    }

    tRY = rY = tRX = rX = aRY = 0;
    z = tZ;
    moved = false;
    tt = 0;
    isClosing = false;

    cam.position.set(0, 0, z);
    cam.lookAt(0, 0, 0);
    cam.updateMatrixWorld();

    const vFOV = THREE.MathUtils.degToRad(cam.fov);
    const visibleHeightAtOrigin = 2 * Math.tan(vFOV / 2) * z;
    const pixelToUnit = visibleHeightAtOrigin / H;

    const staticLinks = document.querySelectorAll(
      "#projects-container .projects a",
    );

    cards.forEach((el, i) => {
      let startX = 0,
        startY = 0;

      const domLink = staticLinks[i];
      if (domLink) {
        const rect = domLink.getBoundingClientRect();

        const screenCenterX = rect.left + rect.width / 2 - W / 2;
        const screenCenterY = rect.top + rect.height / 2 - H / 2;

        startX = screenCenterX * pixelToUnit;
        startY = -screenCenterY * pixelToUnit;
      }

      F[i].set(startX, startY, 0);
      el.pos.copy(F[i]);
    });

    document.body.classList.add("crazy-mode-active");
    btn.textContent = "toggleNormalMode()";
    container.style.visibility = "hidden";
    scene.classList.add("active");
    if (!frame) loop();
  } else {
    isClosing = true;
    tt = 0;
    cards.forEach((el, i) => {
      T[i].copy(F[i]);
      F[i].copy(el.pos);
    });
    btn.textContent = "toggleCrazyMode()";
  }
};
