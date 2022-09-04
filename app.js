import * as THREE from 'three';
import { RoomEnvironment } from './node_modules/three/examples/jsm/environments/RoomEnvironment.js';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';
import { Dcel } from './Dcel.js';
import * as BufferGeometryUtils from './node_modules/three/examples/jsm/utils/BufferGeometryUtils.js';
import { GUI } from './node_modules/three/examples/jsm/libs/lil-gui.module.min.js';

class App {
    go() {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(2.5, 5, 35);

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
        const controls = new OrbitControls(camera, renderer.domElement);
        scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment()).texture;
        scene.background = new THREE.Color(0x888888);

        // let geometry = new THREE.TetrahedronGeometry(10);
        let geometry = new THREE.TorusKnotGeometry(10, 2, 200, 32, 3, 5);
        Object.keys(geometry.attributes).filter(x => x !== 'position').forEach(x => {
            geometry.deleteAttribute(x);
        });
        geometry = BufferGeometryUtils.mergeVertices(geometry);
        this.dcel = new Dcel(geometry);
        geometry.computeVertexNormals();
        this.mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 'green' }));
        scene.add(this.mesh);

        var adjMesh = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ vertexColors: true }));
        scene.add(adjMesh);

        const params = {
            distance: 20
        };
        const gui = new GUI();
        gui.add(params, 'distance').min(1).max(40).step(1);

        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        window.addEventListener('pointermove', (event) => {
            pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(pointer, camera);

            const colorForLevel = Array.from({ length: params.distance }).map((_, i, arr) => new THREE.Color().setHSL(i / arr.length, 1, 0.5));
            const facesForLevel = colorForLevel.map(_ => []);
            const facesIncluded = this.dcel.faces.map(_ => false);
            const inter = raycaster.intersectObject(this.mesh);
            if (inter.length) {
                facesForLevel[0].push(inter[0].faceIndex);
                facesIncluded[inter[0].faceIndex] = true;
            }

            for (let i = 1; i < facesForLevel.length; ++i) {
                facesForLevel[i - 1].forEach((faceIndex) => {
                    this.dcel.forAdjacentFaces(faceIndex, adjFaceIndex => {
                        if (!facesIncluded[adjFaceIndex]) {
                            facesForLevel[i].push(adjFaceIndex);
                            facesIncluded[adjFaceIndex] = true;
                        }
                    });
                });
            }

            const points = [];
            const colors = [];
            facesForLevel.forEach((faces, level) => {
                faces.forEach(f => this.dcel.forFaceVertices(f, v => {
                    points.push(new THREE.Vector3().fromBufferAttribute(geometry.attributes.position, v));
                    colors.push(colorForLevel[level].r, colorForLevel[level].g, colorForLevel[level].b);
                }));
            });
            adjMesh.geometry.setFromPoints(points);
            adjMesh.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
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