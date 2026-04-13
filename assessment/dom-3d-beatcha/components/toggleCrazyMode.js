let PROJECTS = [
  {
    title: "SuperFormulaSubdivider",
    category: "Interactive Tools",
    url: "Projects/Interactive-Tools/Super-Formula-Sub-Divider/",
  },
  {
    title: "Gradienter",
    category: "Interactive Tools",
    url: "Projects/Interactive-Tools/Gradienter/",
  },
  {
    title: "Aizawa Attractor Visualiser",
    category: "Interactive Tools",
    url: "Projects/Interactive-Tools/Aizawa-Attractor-Visualiser/",
  },
  {
    title: "Hand Tracking Point Cloud",
    category: "Interactive Tools",
    url: "Projects/Interactive-Tools/Hand-Tracking-Point-Cloud-Destruction/",
  },
  {
    title: "Hand Tracking Ascii Noise",
    category: "Interactive Tools",
    url: "Projects/Interactive-Tools/Hand-Tracking-Ascii-Noise/",
  },
  {
    title: "John Glacier",
    category: "Visual Programming",
    url: "Projects/Visual-Programming/John-Glacier-VJ/",
  },
  {
    title: "Cobalt Studios",
    category: "Visual Programming",
    url: "Projects/Visual-Programming/Cobalt-Studios/",
  },
  {
    title: "John Glacier",
    category: "Motion",
    url: "Projects/Motion/John-Glacier-Motion/",
  },
  {
    title: "Shopayado",
    category: "Motion",
    url: "Projects/Motion/Shopayado/",
  },
  {
    title: "Balance NCL",
    category: "Motion",
    url: "Projects/Motion/Balance-NCL/",
  },
  {
    title: "Nova @ Salford Lightwaves",
    category: "Installation",
    url: "Projects/Installation/Nova/",
  },
];

let on = false,
  ready = false,
  frame = null;
let cam, ren, css, cards;
let drag = false,
  lx = 0,
  ly = 0;
let tRY = 0,
  rY = 0,
  tRX = 0,
  rX = 0,
  tZ = 1600,
  z = 1600;
let aRY = 0,
  moved = false,
  tt = 1;
const F = [],
  T = [],
  lt = {};

class CSS3DObject {
  constructor(el) {
    this.element = el;
    this.position = new THREE.Vector3();
  }
}

class CSS3DRenderer {
  constructor(container) {
    this.domElement = container;
    this.objects = [];
  }
  setSize(w, h) {
    this.w = w;
    this.h = h;
  }
  addObject(obj) {
    this.objects.push(obj);
    obj.element.style.position = "absolute";
    obj.element.style.left = "50%";
    obj.element.style.top = "50%";
    obj.element.style.pointerEvents = "auto";
    this.domElement.appendChild(obj.element);
  }
  render(cam) {
    const fov =
      this.h / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov * 0.75)));
    for (const obj of this.objects) {
      const p = obj.position.clone().applyMatrix4(cam.matrixWorldInverse);
      if (p.z > 0) {
        obj.element.style.display = "none";
        continue;
      } else {
        obj.element.style.display = "";
      }
      const scale = fov / -p.z;

      obj.element.style.transform = `translate(-50%, -50%) translate3d(${p.x * scale}px, ${-p.y * scale}px, 0px) scale(${scale})`;
      obj.element.style.zIndex = Math.round(-p.z);
    }
  }
}

function _init() {
  const W = window.innerWidth,
    H = window.innerHeight;
  const canvas = document.getElementById("crazy-canvas");
  ren = new THREE.WebGLRenderer({ canvas, alpha: true });
  ren.setSize(W, H);
  cam = new THREE.PerspectiveCamera(40, W / H, 1, 10000);

  const layer = document.getElementById("css3d-layer");
  css = new CSS3DRenderer(layer);
  css.setSize(W, H);

  const n = PROJECTS.length;
  lt.sphere = Array.from({ length: n }, (_, i) => {
    const phi = Math.acos(-1 + (2 * i) / n),
      theta = Math.sqrt(n * Math.PI) * phi;
    return { pos: new THREE.Vector3().setFromSphericalCoords(700, phi, theta) };
  });

  cards = PROJECTS.map((p, i) => {
    const el = document.createElement("a");
    el.className = "c3d-card";
    el.href = p.url;
    el.innerHTML = `<div class="c3d-cat">${p.category}</div><div class="c3d-title">${p.title}</div>`;
    const obj = new CSS3DObject(el);
    obj.position.copy(lt.sphere[i].pos);
    css.addObject(obj);
    F[i] = { pos: obj.position.clone() };
    T[i] = { pos: lt.sphere[i].pos.clone() };
    return obj;
  });

  const ov = document.getElementById("crazy-scene");
  ov.addEventListener("mousedown", (e) => {
    if (e.target.closest("button") || e.target.closest("a")) return;
    drag = true;
    lx = e.clientX;
    ly = e.clientY;
    moved = true;
  });
  window.addEventListener("mouseup", () => (drag = false));
  window.addEventListener("mousemove", (e) => {
    if (!drag) return;
    tRY += (e.clientX - lx) * 0.005;
    tRX += (e.clientY - ly) * 0.005;
    lx = e.clientX;
    ly = e.clientY;
  });
}

function _loop() {
  frame = requestAnimationFrame(_loop);
  if (!moved) aRY += 0.0012;
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
    tt = Math.min(1, tt + 0.013);
    cards.forEach((obj, i) => obj.position.lerpVectors(F[i].pos, T[i].pos, tt));
  }
  css.render(cam);
}

window.crazy3DToggle = function () {
  on = !on;
  const ov = document.getElementById("crazy-scene");
  const proj = document.getElementById("projects-container");

  if (on) {
    if (!ready) {
      _init();
      ready = true;
    }
    proj.style.visibility = "hidden";
    ov.classList.add("active");
    if (!frame) _loop();
  } else {
    ov.classList.remove("active");
    proj.style.visibility = "visible";
    if (frame) {
      cancelAnimationFrame(frame);
      frame = null;
    }
  }
};

window.toggleCrazyMode = function () {
  const body = document.body;
  const button = document.getElementById("crazyModeToggle");
  body.classList.toggle("dark-mode");
  button.textContent = body.classList.contains("dark-mode")
    ? "toggleNormalMode()"
    : "toggleCrazyMode()";
  crazy3DToggle();
};

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("crazyModeToggle");
  if (btn) btn.textContent = "toggleCrazyMode()";
});
