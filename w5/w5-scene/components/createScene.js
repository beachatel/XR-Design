import * as THREE from "three";

export async function createScene(floorLevel, playerHeight) {
  const scene = new THREE.Scene();

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

  document.body.appendChild(renderer.domElement);
  return { scene, camera, renderer };
}
