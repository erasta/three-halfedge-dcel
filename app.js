import * as THREE from 'three';
import { RoomEnvironment } from './node_modules/three/examples/jsm/environments/RoomEnvironment.js';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';
import { Dcel } from './Dcel.js';
import * as BufferGeometryUtils from './node_modules/three/examples/jsm/utils/BufferGeometryUtils.js';

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

        var colors = ['red', 'yellow', 'cyan', 'blue', 'black', 'purple'];
        var adjMeshes = colors.map(c => new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ color: c })));
        adjMeshes.forEach(m => scene.add(m));

        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        window.addEventListener('pointermove', (event) => {
            pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(pointer, camera);

            const facesForLevel = adjMeshes.map(_ => []);
            const inter = raycaster.intersectObject(this.mesh);
            if (inter.length) {
                facesForLevel[0].push(inter[0].faceIndex);
            }

            for (let i = 1; i < facesForLevel.length; ++i) {
                facesForLevel[i - 1].forEach((faceIndex) => {
                    this.dcel.forAdjacentFaces(faceIndex, adjFaceIndex => {
                        if (!facesForLevel.some(faces => faces.includes(adjFaceIndex))) {
                            facesForLevel[i].push(adjFaceIndex);
                        }
                    });
                });
            }

            facesForLevel.forEach((faces, level) => {
                const points = [];
                faces.forEach(f => this.dcel.forFaceVertices(f, v => {
                    points.push(new THREE.Vector3().fromBufferAttribute(geometry.attributes.position, v));
                }));
                adjMeshes[level].geometry.setFromPoints(points);
            });
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