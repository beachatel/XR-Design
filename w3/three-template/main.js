import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
//////////////scene config///////////////
const scene = new THREE.Scene();

//////////////camera config///////////////
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

camera.position.y = 40;
camera.position.z = 50;

//////////////renderer config///////////////
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

//////////////orbit controls///////////////
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

//////////////responsive canvas///////////////
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
//make sure to involve this in set up//
//use poly haven for textures/models//
////////////////load HDRI/////////////
const loader = new HDRLoader();
const envMap = await loader.loadAsync("textures/sky.hdr");
envMap.mapping = THREE.EquirectangularReflectionMapping;
scene.background = envMap;
scene.environment = envMap;

////////////////create floor/////////////
let texture = new THREE.TextureLoader().load(
  "textures/rocky_terrain_02_diff_2k.jpg",
);
texture.repeat.set(2, 2);
texture.wrapT = THREE.RepeatWrapping;
texture.wrapS = THREE.RepeatWrapping;

let plane = new THREE.PlaneGeometry(1000, 1000);
let material = new THREE.MeshStandardMaterial({
  map: texture,
  metalness: 0,
  roughness: 3,
});
let floorMesh = new THREE.Mesh(plane, material);
floorMesh.position.set(0, 0, 0);
floorMesh.rotation.set(Math.PI / -2, 0, 0);
scene.add(floorMesh);

//////////////load a 3D model/////////////
let model = null;
let animationMixer = null;
let followDelta = new THREE.Vector3();
let animationRate = 0.6;
let activeAnimation = null;

const modelLoader = new GLTFLoader();
const url = "models/rex.glb";

modelLoader.load(
  url,
  (gltf) => {
    model = gltf.scene;
    model.scale.set(5, 5, 5);
    scene.add(model);

    if (gltf.animations && gltf.animations.length > 0) {
      animationMixer = new THREE.AnimationMixer(model);
      const clip = gltf.animations[0];
      activeAnimation = animationMixer.clipAction(clip);
      activeAnimation.setEffectiveTimeScale(animationRate);
      activeAnimation.play();
    }
  },
  (progress) => {
    console.log(
      "loading model:",
      ((progress.loaded / progress.total) * 100).toFixed(2 + "%"),
    );
  },
  (error) => {
    console.error("model load error:", error);
  },
);

const clock = new THREE.Clock();
renderer.setAnimationLoop(render);

//animation loop for rendering scene
function render() {
  const delta = clock.getDelta();
  if (animationMixer) {
    animationMixer.update(delta);
  }

  if (model) {
    model.position.z += 0.25;
  }
  renderer.render(scene, camera);
  controls.update();
}
//three.js load tgf file low ploy city by antonmoek
//webgl animation
//glen fox
//sketch fab
