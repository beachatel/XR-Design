import * as THREE from "three";

export function modelLoader(loader, pathtoModel, scene, pos) {
  let model = null;
  let mixer = null;
  loader.load(
    pathtoModel,
    (gltf) => {
      model = gltf.scene;
      console.log("model loaded:", gltf);
      scene.add(gltf.scene);
      const nodes = [];
      gltf.scene.traverse((child) => {
        nodes.push({ name: child.name, type: child.type });
      });
      console.table(nodes);
      model.position.set(pos.x, pos.y, pos.z);

      const bounds = new THREE.Box3().setFromObject(model);
      const size = bounds.getSize(new THREE.Vector3());
      const maxAxis = Math.max(size.x, size.y, size.z);
      if (maxAxis > 0) {
        const targetSize = 17;
        const scaleFactor = targetSize / maxAxis;
        model.scale.multiplyScalar(scaleFactor);
        model.updateWorldMatrix(true, true);
        bounds.setFromObject(model);
        bounds.getSize(size);
      } else {
        model.updateWorldMatrix(true, true);
      }

      // Set up animation
      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);
        const clip = gltf.animations[0]; // Play first animation
        activeAction = mixer.clipAction(clip);
        activeAction.reset();
        activeAction.setEffectiveTimeScale(ANIMATION_PLAYBACK_RATE);
        activeAction.play();
        console.log(
          "Playing animation:",
          clip.name,
          "(duration:",
          clip.duration,
          "seconds)",
        );
      }
    },
    (progress) =>
      console.log(
        "Loading model:",
        ((progress.loaded / progress.total) * 100).toFixed(2) + "%",
      ),
    (error) => {
      console.error("Model load error:", error);
    },
  );
}
