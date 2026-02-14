import * as THREE from "three";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { modelLoader } from "./components/modelLoader";

//create scene for our project
const scene = new THREE.Scene();

//constants for player position and physics
const floorLevel = 0;
const playerHeight = 1.6;
const gravity = 28;

//create camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.01,
  1000,
);
camera.position.x = 0;
camera.position.y = floorLevel + playerHeight; //set camera height to average human eye level for better first-person experience
camera.position.z = 20;
scene.add(camera);

//create renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding; //needed for accurate color representation of textures and materials
renderer.toneMapping = THREE.ACESFilmicToneMapping; //needed for accurate rendering of HDR textures and realistic lighting effects
renderer.toneMappingExposure = 1.25; //adjusts overall brightness of the scene to ensure HDR textures and lighting look correct without being too dark or washed out
renderer.setAnimationLoop(animate);

document.body.appendChild(renderer.domElement);

//add first-person pointer lock controls
const controls = new PointerLockControls(camera, document.body);
const pointerHint = document.createElement("div");
pointerHint.textContent =
  "Click for first-person POV controls (WASD + mouse, space to jump, ESC to Release)";
pointerHint.style.position = "absolute";
pointerHint.style.top = "16px";
document.body.appendChild(pointerHint);

renderer.domElement.addEventListener("click", () => {
  if (!controls.isLocked) {
    controls.lock();
  }
});

//Track continuous input booleans so movement integrates smoothly each frame
const moveState = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  sprint: false,
  jump: false,
};

//Cached vectors store velocity integration and the intended strafing direction
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let isGrounded = true;

//movement constants for tuning the feel of the controls
const walkSpeed = 200;
const sprintSpeed = 450;
const movement_damping = 12;
const jumpSpeed = 12;

//Map keyboard events into the shared moveState and trigger once-off jump impulse
function handleKey(event, isPressed) {
  switch (event.code) {
    case "KeyW":
      moveState.forward = isPressed;
      break;
    case "KeyS":
      moveState.backward = isPressed;
      break;
    case "KeyA":
      moveState.left = isPressed;
      break;
    case "KeyD":
      moveState.right = isPressed;
      break;
    case "ShiftLeft":
      moveState.sprint = isPressed;
      break;
    case "Space":
      moveState.jump = isPressed;
      if (isPressed && isGrounded) {
        velocity.y = jumpSpeed;
        isGrounded = false;
      }
      break;
    default:
      break;
  }
}

document.addEventListener("keydown", (event) => {
  handleKey(event, true);
});
document.addEventListener("keyup", (event) => {
  handleKey(event, false);
});

//clock for animation timing
const clock = new THREE.Clock();

//make canvas responsive to window resizing
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

//create sky background with HDR
new HDRLoader().load("/textures/docklands.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping; //set mapping for sky texture to create realistic reflections
  scene.background = texture; //set background of scene to sky texture
  scene.environment = texture; //set environment of scene to sky texture for accurate lighting and reflections on objects
});

//create floor with rocky terrain texture
let tex = new THREE.TextureLoader().load("/textures/grad.png");
tex.repeat.set(20, 20);
tex.wrapT = THREE.RepeatWrapping;
tex.wrapS = THREE.RepeatWrapping;

let plane = new THREE.PlaneGeometry(1000, 1000);
let mat = new THREE.MeshStandardMaterial({
  map: tex,
  metalness: 0,
  roughness: 1,
});

let mesh = new THREE.Mesh(plane, mat);
mesh.position.set(0, 0, 0);
mesh.rotation.set(Math.PI / -2, 0, 0); //rotate plane to be horizontal like a floor
scene.add(mesh);

//////////////import object + animation config///////////////
const loader = new GLTFLoader();

let activeAction = null;
const ANIMATION_PLAYBACK_RATE = 0.5; // 1 preserves source speed; lower slows animation

// .load() syntax: .load(url, onLoad, onProgress, onError)
// - loads a glTF model from the specified URL and calls the provided
// callback functions for success, progress, and error handling.
let pathToModel = "/models/radial.glb";
let pos = { x: 5, y: 10, z: 0 };
modelLoader(loader, pathToModel, scene, pos);

pathToModel = "/models/un.gltf";
pos = { x: 15, y: 10, z: 0 };
modelLoader(loader, pathToModel, scene, pos);

//animation loop for rendering scene
function animate() {
  const delta = clock.getDelta(); // Get time elapsed since last frame for time-based animation
  // if (mixer) mixer.update(delta); // Update animation

  //Handle player movement based on input state and apply physics
  if (controls.isLocked) {
    //apply damping to ease velocity off when key is no longer pressed
    velocity.x -= velocity.x * movement_damping * delta;
    velocity.z -= velocity.z * movement_damping * delta;

    direction.x = Number(moveState.right) - Number(moveState.left);
    direction.z = Number(moveState.forward) - Number(moveState.backward);
    if (direction.lengthSq() > 0) {
      direction.normalize();
    }

    const acceleration = moveState.sprint ? sprintSpeed : walkSpeed;

    if (moveState.forward || moveState.backward) {
      velocity.z -= direction.z * acceleration * delta;
    }

    if (moveState.left || moveState.right) {
      velocity.x -= direction.x * acceleration * delta;
    }

    velocity.y -= gravity * delta;

    controls.moveForward(-velocity.z * delta);
    controls.moveRight(-velocity.x * delta);
    camera.position.y += velocity.y * delta;
  } else {
    velocity.set(0, 0, 0);
  }

  const minY = floorLevel + playerHeight;
  if (camera.position.y <= minY) {
    camera.position.y = minY;
    velocity.y = 0;
    isGrounded = true;
  } else {
    isGrounded = false;
  }

  renderer.render(scene, camera);
}
