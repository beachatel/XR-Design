import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { loadModel } from "./components/modelLoader.js";
import { createScene } from "./components/createScene.js";
import { createEnviroment } from "./components/createEnvironment.js";
//create scene for our project

//constants for player position and physics
const floorLevel = 0;
const playerHeight = 1.6;
const gravity = 28;
//clock for animation timing
const clock = new THREE.Clock();

let scene, camera, renderer;

init();

async function init() {
  ({ scene, camera, renderer } = await createScene(floorLevel, playerHeight));

  const textName = "rocks";
  const hdrPath = "/textures/hdr/sky2.hdr";
  // const floorTextures = "/textures/floor/rocks/rocks_diff.jpg";
  const texturePath = {
    aoMap: `/textures/floor/${textName}/${textName}_ao.jpg`,
    armMap: `/textures/floor/${textName}/${textName}_arm.jpg`,
    diffMap: `/textures/floor/${textName}/${textName}_diff.jpg`,
    dispMap: `/textures/floor/${textName}/${textName}_disp.jpg`,
    normMap: `/textures/floor/${textName}/${textName}_nor.jpg`,
    roughMap: `/textures/floor/${textName}/${textName}_rough.jpg`,
  };

  await createEnviroment(scene, hdrPath, texturePath, {
    textureRepeat: 20,
    planeSize: 50,
  });

  //////////

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
  const walkSpeed = 50;
  const sprintSpeed = 150;
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

  //make canvas responsive to window resizing
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  //////////////import object + animation config///////////////
  const loader = new GLTFLoader();

  let activeAction = null;
  const ANIMATION_PLAYBACK_RATE = 0.5; // 1 preserves source speed; lower slows animation

  // .load() syntax: .load(url, onLoad, onProgress, onError)
  // - loads a glTF model from the specified URL and calls the provided
  // callback functions for success, progress, and error handling.
  let pathtoModel = "/models/house.glb";
  let pos = { x: -15, y: -4.4, z: 0 };
  loadModel(loader, pathtoModel, scene, pos);

  pos = { x: 15, y: -0.1, z: 0 };
  pathtoModel = "/models/hut.glb";
  loadModel(loader, pathtoModel, scene, pos);

  renderer.setAnimationLoop(animate);
}

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
