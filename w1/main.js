import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 0.1, 1000 );

const light = new THREE.DirectionalLight( "red", 3 );
				light.position.set( 0,0,0 ).normalize();
			

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );

renderer.setAnimationLoop( animate );
const controls = new OrbitControls( camera, renderer.domElement );
camera.position.set( 1, 1, 1 );
  
const geometry = new THREE.TorusKnotGeometry();
const material = new THREE.MeshBasicMaterial();

// const cube = new THREE.Mesh( geometry, material );

for (let i = 0; i < 1; i++){


const object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial())

object.position.x = 0.1
object.position.y = 0.1
object.position.z = 0.1

object.scale.x = 0.1
object.scale.y = 0.1
object.scale.z = 0.1

object.material = (material)
scene.add(object);

}

document.body.appendChild( renderer.domElement );

function animate(){
controls.update();
	renderer.render( scene, camera );
  	scene.add( light );
}


// controls.update() must be called after any manual changes to the camera's transform






	// required if controls.enableDamping or controls.autoRotate are set to true






// function animate() {

//   object.rotation.x += 0.01;
//   object.rotation.y += 0.01;

//   if(object.rotation.x > 1){
//     object.rotation.x = 1;
//   }
  

//  
// camera.position.z = object.rotation.x * 2;

// }