import * as THREE from 'three';
import { RoomEnvironment } from './node_modules/three/examples/jsm/environments/RoomEnvironment.js';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';
import { GUI } from './node_modules/three/examples/jsm/libs/lil-gui.module.min.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(2.5, 5, 35);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment()).texture;
scene.background = new THREE.Color(0x888888);

const gui = new GUI();

const params = {
    numberOfPoints: 5,
    wireframe: true,
};

gui.add(params, 'numberOfPoints').min(2).max(10).step(1).onChange(() => {});
gui.add(params, 'wireframe').onChange(() => {});

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
};

animate();
