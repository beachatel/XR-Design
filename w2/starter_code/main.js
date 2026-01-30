import * as THREE from "three";
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

//create scene for our project
const scene = new THREE.Scene();

//create camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

// White directional light at half intensity shining from the top.
const directionalLight = new THREE.AmbientLight( 0xffffff, 10 );
directionalLight.position.set(5,5,5)
scene.add( directionalLight );

//renderer config
const renderer = new THREE.WebGLRenderer({antialias: true});
const controls = new OrbitControls(camera, renderer.domElement)
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

renderer.domElement.addEventListener("mousemove" , (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  // console.log(mouse)
});

renderer.domElement.addEventListener('click', (e) => {
  if(intersectedObject != null){
    if(intersectedObject.scale.x <2) intersectedObject.scale.x = 20;
    else if (intersectedObject.scale.z >19) intersectedObject.scale.x = 1
  }
})


// set z cam position
camera.position.z = 5;


// raycaster config 
const rayCaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let intersectedObject = null;



const roomSize = 40;
const roomGeom = new THREE.BoxGeometry(roomSize,roomSize,roomSize);
const roomMaterial = new THREE.MeshPhongMaterial( { 
  color: 0xffffff,
  side: THREE.BackSide,
 })

const room = new THREE.Mesh(roomGeom,roomMaterial) 

scene.add(room);
scene.add(room);

function makeInstance(colour,x,y,z,w,h,d){

  //create box geometry
const geometry = new THREE.BoxGeometry(w, h, d);
//create material
const material = new THREE.MeshPhongMaterial({ color: colour });
//create mesh for our object
const cube = new THREE.Mesh(geometry,material);
cube.position.set(x,y,z);
return cube;
}




  const cubes = [];

for (let i = 0; i < 2000; i++){



const clr = Math.random() * 0xffffff;

const x = Math.random() * roomSize - roomSize/2;
const y = Math.random() * roomSize - roomSize/2;
const z = Math.random() * roomSize - roomSize/2;

const w = Math.random() * roomSize / 30;
const h = Math.random() * roomSize / 30
const d = Math.random() * roomSize / 30;



  const cubeObject = makeInstance(clr,x,y,z,w,h,d)
  const obj = {mesh:cubeObject, speed: Math.random() * 0.02 + 0.01}


  cubes.push(obj);
  scene.add(cubeObject)
}

function setHighlight(mesh,size, active){
  if(!mesh.userData.basecolor){
    mesh.userData.basecolor = mesh.material.color.clone();
  }
  mesh.material.color.set(active ? 0xff0000 : Math.random() * 0xffffff);
  // size.cube.w.set()
}




//animation loop for rendering scene
function animate() {

  controls.update();

  rayCaster.setFromCamera(mouse,camera);

  const intersects = rayCaster.intersectObjects(cubes.map(obj => obj.mesh));

  if(intersects.length > 0){
    if(intersectedObject != intersects[0].object){

      if(intersectedObject){
        setHighlight(intersectedObject,false);

      } else {}
      intersectedObject = intersects[0].object;
      
      setHighlight(intersectedObject,true)
    }
    }
  

  for(const cube of cubes){
    cube.mesh.rotation.x += cube.speed;
    cube.mesh.rotation.y += cube.speed;
  }


  

    renderer.render(scene, camera);
}
