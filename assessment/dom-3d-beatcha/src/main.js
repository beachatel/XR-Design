/* ── CSS3D renderer ── */
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
    obj.element.style.cssText +=
      "position:absolute;left:50%;top:50%;margin-left:-95px;margin-top:-38px;";
    this.domElement.appendChild(obj.element);
  }
  render(cam) {
    const fov =
      this.h / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov * 0.5)));
    for (const obj of this.objects) {
      const p = obj.position.clone().applyMatrix4(cam.matrixWorldInverse);
      const dx = obj.position.x - cam.position.x;
      const dz = obj.position.z - cam.position.z;
      const yaw = Math.atan2(dx, dz);
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      obj.element.style.transform = `translateZ(${fov}px) matrix3d(${c},0,${s},0, 0,1,0,0, ${-s},0,${c},0, ${p.x},${-p.y},${p.z},1)`;
    }
  }
  clear() {
    this.objects = [];
    this.domElement.innerHTML = "";
  }
}

/* ── data ── */
const PROJECTS = [
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

/* ── state ── */
let _on = false,
  _ready = false,
  _frame = null;
let _cam, _ren, _css, _cards, _pts;
let _drag = false,
  _lx = 0,
  _ly = 0;
let _tRY = 0,
  _rY = 0,
  _tRX = 0,
  _rX = 0,
  _tZ = 1600,
  _z = 1600;
let _aRY = 0,
  _moved = false;
let _tt = 1,
  _lay = "sphere";
const _F = [],
  _T = [];
let _lt = {};

/* ── layouts ── */
const _gens = {
  sphere: (n) =>
    Array.from({ length: n }, (_, i) => {
      const phi = Math.acos(-1 + (2 * i) / n),
        theta = Math.sqrt(n * Math.PI) * phi;
      return {
        pos: new THREE.Vector3().setFromSphericalCoords(700, phi, theta),
      };
    }),
  helix: (n) =>
    Array.from({ length: n }, (_, i) => {
      const a = i * 0.52 + Math.PI;
      return {
        pos: new THREE.Vector3(
          Math.cos(a) * 600,
          -(i * 100) + n * 50,
          Math.sin(a) * 600,
        ),
      };
    }),
  grid: (n) => {
    const cols = 4;
    return Array.from({ length: n }, (_, i) => ({
      pos: new THREE.Vector3(
        ((i % cols) - (cols - 1) / 2) * 230,
        -(Math.floor(i / cols) - 1) * 140,
        0,
      ),
    }));
  },
  scatter: (n) =>
    Array.from({ length: n }, () => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 1400,
        (Math.random() - 0.5) * 900,
        (Math.random() - 0.5) * 700,
      ),
    })),
};

function _buildLT() {
  const n = PROJECTS.length;
  Object.keys(_gens).forEach((k) => {
    _lt[k] = _gens[k](n);
  });
}

function _ease(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/* ── init scene (once) ── */
function _init() {
  const W = window.innerWidth,
    H = window.innerHeight;

  const canvas = document.getElementById("crazy-canvas");
  _ren = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  _ren.setPixelRatio(Math.min(devicePixelRatio, 2));
  _ren.setSize(W, H);
  _ren.setClearColor(0, 0);

  _cam = new THREE.PerspectiveCamera(40, W / H, 1, 10000);
  _cam.position.set(0, 0, _z);

  const sc = new THREE.Scene();
  const geo = new THREE.BufferGeometry();
  const pa = new Float32Array(400 * 3);
  for (let i = 0; i < 400; i++) {
    pa[i * 3] = (Math.random() - 0.5) * 6000;
    pa[i * 3 + 1] = (Math.random() - 0.5) * 4000;
    pa[i * 3 + 2] = (Math.random() - 0.5) * 4000;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pa, 3));
  _pts = new THREE.Points(
    geo,
    new THREE.PointsMaterial({ color: 0x333330, size: 1.5 }),
  );
  sc.add(_pts);
  _ren._sc = sc;

  _css = new CSS3DRenderer(document.getElementById("css3d-layer"));
  _css.setSize(W, H);

  _buildLT();
  _cards = PROJECTS.map((p, i) => {
    const el = document.createElement("a");
    el.className = "c3d-card";
    el.href = p.url;
    el.innerHTML = `<div class="c3d-cat">${p.category}</div><div class="c3d-title">${p.title}</div>`;
    el.addEventListener("click", (e) => e.stopPropagation());
    const obj = new CSS3DObject(el);
    obj.position.copy(_lt.sphere[i].pos);
    _css.addObject(obj);
    _F[i] = { pos: obj.position.clone() };
    _T[i] = { pos: _lt.sphere[i].pos.clone() };
    return obj;
  });
  _tt = 1;

  /* drag / zoom */
  const ov = document.getElementById("crazy-scene");
  ov.addEventListener("mousedown", (e) => {
    _drag = true;
    _lx = e.clientX;
    _ly = e.clientY;
    _moved = true;
  });
  window.addEventListener("mouseup", () => (_drag = false));
  window.addEventListener("mousemove", (e) => {
    if (!_drag) return;
    _tRY += (e.clientX - _lx) * 0.005;
    _tRX += (e.clientY - _ly) * 0.005;
    _lx = e.clientX;
    _ly = e.clientY;
  });
  ov.addEventListener(
    "wheel",
    (e) => {
      _tZ = Math.max(600, Math.min(3000, _tZ + e.deltaY * 1.2));
      _moved = true;
    },
    { passive: true },
  );
  let ptx = 0,
    pty = 0,
    ppd = 0;
  ov.addEventListener("touchstart", (e) => {
    _moved = true;
    if (e.touches.length === 1) {
      ptx = e.touches[0].clientX;
      pty = e.touches[0].clientY;
    }
    if (e.touches.length === 2)
      ppd = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
  });
  ov.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        _tRY += (e.touches[0].clientX - ptx) * 0.006;
        _tRX += (e.touches[0].clientY - pty) * 0.006;
        ptx = e.touches[0].clientX;
        pty = e.touches[0].clientY;
      }
      if (e.touches.length === 2) {
        const d = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        _tZ = Math.max(600, Math.min(3000, _tZ - (d - ppd) * 3));
        ppd = d;
      }
    },
    { passive: false },
  );

  document.querySelectorAll(".crazy-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      document
        .querySelectorAll(".crazy-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      _sw(btn.dataset.layout);
    });
  });

  window.addEventListener("resize", () => {
    if (!_ready) return;
    const W = window.innerWidth,
      H = window.innerHeight;
    _cam.aspect = W / H;
    _cam.updateProjectionMatrix();
    _ren.setSize(W, H);
    _css.setSize(W, H);
    _buildLT();
  });
}

function _animIn() {
  /* use visibility:hidden so elements still have layout for getBoundingClientRect */
  const links = [
    ...document.getElementById("projects-container").querySelectorAll("a"),
  ];
  const W = window.innerWidth,
    H = window.innerHeight,
    cx = W / 2,
    cy = H / 2;
  _cards.forEach((obj, i) => {
    const lk = links[i];
    if (lk) {
      const r = lk.getBoundingClientRect();
      const sx = (r.left + r.width / 2 - cx) * (_z / (H / 2 + _z));
      const sy = -(r.top + r.height / 2 - cy) * (_z / (H / 2 + _z));
      _F[i] = { pos: new THREE.Vector3(sx, sy, 0) };
    } else {
      _F[i] = { pos: new THREE.Vector3(0, 0, 0) };
    }
    _T[i] = { pos: _lt.sphere[i].pos.clone() };
    obj.position.copy(_F[i].pos);
  });
  _tt = 0;
  _lay = "sphere";
  document
    .querySelectorAll(".crazy-btn")
    .forEach((b) =>
      b.classList.toggle("active", b.dataset.layout === "sphere"),
    );
}

function _sw(name) {
  if (name === _lay && _tt >= 1) return;
  _lay = name;
  _cards.forEach((obj, i) => {
    _F[i] = { pos: obj.position.clone() };
    _T[i] = { pos: _lt[name][i].pos.clone() };
  });
  _tt = 0;
}

function _loop() {
  _frame = requestAnimationFrame(_loop);
  if (!_moved) _aRY += 0.0012;
  _rY += (_tRY + _aRY - _rY) * 0.05;
  _rX += (_tRX - _rX) * 0.05;
  _rX = Math.max(-1.1, Math.min(1.1, _rX));
  _z += (_tZ - _z) * 0.07;
  _cam.position.set(
    Math.sin(_rY) * Math.cos(_rX) * _z,
    Math.sin(_rX) * _z,
    Math.cos(_rY) * Math.cos(_rX) * _z,
  );
  _cam.lookAt(0, 0, 0);
  _cam.updateMatrixWorld();
  _cam.matrixWorldInverse.copy(_cam.matrixWorld).invert();
  if (_tt < 1) {
    _tt = Math.min(1, _tt + 0.013);
    const t = _ease(_tt);
    _cards.forEach((obj, i) =>
      obj.position.lerpVectors(_F[i].pos, _T[i].pos, t),
    );
  }
  if (_tt >= 1) {
    const time = Date.now() * 0.0004;
    _cards.forEach((obj, i) => {
      obj.position.y += Math.sin(time + i * 0.7) * 0.1;
    });
  }
  _pts.rotation.y += 0.00007;
  _ren.render(_ren._sc, _cam);
  _css.render(_cam);
}

/* ── public toggle ── */
function crazy3D_toggle() {
  _on = !_on;
  const ov = document.getElementById("crazy-scene");
  const proj = document.getElementById("projects-container");
  if (_on) {
    if (!_ready) {
      _init();
      _ready = true;
    }
    _rY = _tRY = 0;
    _rX = _tRX = 0;
    _z = _tZ = 1600;
    _aRY = 0;
    _moved = false;
    /* hide original links but keep them in layout flow */
    proj.style.visibility = "hidden";
    ov.classList.add("active");
    _animIn();
    if (!_frame) _loop();
  } else {
    ov.classList.remove("active");
    proj.style.visibility = "";
    if (_frame) {
      cancelAnimationFrame(_frame);
      _frame = null;
    }
  }
}

// /* safety net — if toggleCrazyMode.js is absent this keeps the button working */
// window.toggleCrazyMode = crazy3D_toggle;
