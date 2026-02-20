import * as THREE from "three";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";

export async function createEnviroment(
  scene,
  hdrPath,
  texturePath = {},
  options = {},
) {
  //create sky background with HDR
  new HDRLoader().load(hdrPath, (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping; //set mapping for sky texture to create realistic reflections
    scene.background = texture; //set background of scene to sky texture
    scene.environment = texture; //set environment of scene to sky texture for accurate lighting and reflections on objects
  });

  const { textureRepeat = 20, planeSize = 500 } = options;

  const textureLoader = new THREE.TextureLoader();
  const textureConfig =
    typeof texturePath === "string" ? { difuseMap: texturePath } : texturePath;

  const { aoMap, armMap, diffMap, dispMap, normMap, roughMap } = textureConfig;

  const loadTexture = async (path, { isColor = false } = {}) => {
    if (!path) {
      return null;
    }
    const tex = await textureLoader.loadAsync(path);
    tex.repeat.set(textureRepeat, textureRepeat);
    tex.wrapT = THREE.RepeatWrapping;
    tex.wrapS = THREE.RepeatWrapping;

    if (isColor) {
      tex.encoding = THREE.sRGBEncoding;
    }
    return tex;
  };

  // load all textures parallel not using await
  const [
    baseTexture,
    aoTexture,
    armTexture,
    dispTexture,
    normTexture,
    roughTexture,
  ] = await Promise.all([
    loadTexture(diffMap, { isColor: true }),
    loadTexture(aoMap),
    loadTexture(armMap),
    loadTexture(dispMap),
    loadTexture(normMap),
    loadTexture(aoMap),
  ]);

  let plane = new THREE.PlaneGeometry(planeSize, planeSize);
  // If we have an ambient occlusion map, we need to duplicate plane uv array toplane uv2 property
  if (plane.attributes.uv) {
    plane.setAttribute(
      "uv2",
      new THREE.BufferAttribute(plane.attributes.uv, 2),
    );
  }

  //   Material params
  const materialParams = {
    map: baseTexture,
    aoMap: aoTexture,
    normMap: normTexture,
    roughMap: roughTexture,
    roughness: 1,
    metalness: armTexture,
  };

  let mat = new THREE.MeshStandardMaterial(materialParams);

  let mesh = new THREE.Mesh(plane, mat);
  mesh.position.set(0, 0, 0);
  mesh.rotation.set(Math.PI / -2, 0, 0); //rotate plane to be horizontal like a floor
  scene.add(mesh);
}
