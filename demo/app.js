import * as THREE from 'three';
import { RoomEnvironment } from 'three/addon/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/addon/controls/OrbitControls.js';
import { Dcel } from '../Dcel.js';
import * as BufferGeometryUtils from 'three/addon/utils/BufferGeometryUtils.js';
import { GUI } from 'three/addon/libs/lil-gui.module.min.js';

class App {
    go() {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(2.5, 5, 35);

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enabled = false;
        scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment()).texture;
        scene.background = new THREE.Color(0x888888);

        let geometry = new THREE.TorusKnotGeometry(10, 2, 200, 32, 3, 5);
        const start = Date.now();
        this.dcel = new Dcel(geometry);
        console.log('build dcel took:', Date.now() - start, 'ms for ', this.dcel.faces.length, 'faces');
        this.mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 'green' }));
        scene.add(this.mesh);

        var adjMesh = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ vertexColors: true }));
        scene.add(adjMesh);

        const params = {
            distance: 20,
            moveModel: false
        };
        const gui = new GUI();
        gui.add(params, 'distance').min(1).max(40).step(1);
        gui.add(params, 'moveModel').onChange(v => controls.enabled = v);

        const colorForLevel = Array.from({ length: params.distance }).map((_, i, arr) => new THREE.Color().setHSL(i / arr.length, 1, 0.5));
        const facesIncluded = this.dcel.faces.map(_ => false);
        const faceIndices = new THREE.Vector3();

        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        window.addEventListener('pointermove', (event) => {
            pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(pointer, camera);


            const inter = raycaster.intersectObject(this.mesh);
            if (!inter.length) {
                adjMesh.visible = false;
            } else {
                adjMesh.visible = true;
                const faceIndex = inter[0].faceIndex;
                const facesForLevel = colorForLevel.map(_ => []);
                facesForLevel[0].push(faceIndex);
                facesIncluded.fill(false);
                facesIncluded[faceIndex] = true;

                const points = [];
                const colors = [];

                geometry.index.array.slice(faceIndex * 3, faceIndex * 3 + 3).forEach(v => {
                    points.push(new THREE.Vector3().fromBufferAttribute(geometry.attributes.position, v));
                    colorForLevel[0].toArray(colors, colors.length);
                });

                for (let i = 1; i < facesForLevel.length; ++i) {
                    facesForLevel[i - 1].forEach((faceIndex) => {
                        this.dcel.forAdjacentFaces(faceIndex, adjFaceIndex => {
                            if (!facesIncluded[adjFaceIndex]) {
                                facesForLevel[i].push(adjFaceIndex);
                                facesIncluded[adjFaceIndex] = true;

                                geometry.index.array.slice(adjFaceIndex * 3, adjFaceIndex * 3 + 3).forEach(v => {
                                    points.push(new THREE.Vector3().fromBufferAttribute(geometry.attributes.position, v));
                                    colorForLevel[i].toArray(colors, colors.length);
                                });
                            }
                        });
                    });
                }

                adjMesh.geometry.setFromPoints(points);
                adjMesh.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            }

        });

        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };

        animate();

        return this;
    }
}

window.app = new App().go();