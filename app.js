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
        let geometry = new THREE.TorusKnotGeometry(10, 2);
        Object.keys(geometry.attributes).filter(x => x !== 'position').forEach(x => {
            geometry.deleteAttribute(x);
        });
        geometry = BufferGeometryUtils.mergeVertices(geometry);
        this.dcel = new Dcel(geometry);
        geometry.computeVertexNormals();
        this.mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 'green' }));
        scene.add(this.mesh);

        const currFace = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ color: 'red' }));
        scene.add(currFace);
        const adjFaces = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ color: 'blue' }));
        scene.add(adjFaces);

        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        window.addEventListener('pointermove', (event) => {
            pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(pointer, camera);
            const pointsCurr = [];
            const pointsAdj = [];
            for (const inter of raycaster.intersectObjects([this.mesh])) {
                pointsCurr.push(
                    new THREE.Vector3().fromBufferAttribute(geometry.attributes.position, inter.face.a),
                    new THREE.Vector3().fromBufferAttribute(geometry.attributes.position, inter.face.b),
                    new THREE.Vector3().fromBufferAttribute(geometry.attributes.position, inter.face.c),
                );
                const adj = this.dcel.adjacentFaces(inter.faceIndex);
                for (const face of adj) {
                    const vertices = this.dcel.faceVertices(face.index);
                    for (const v of vertices) {
                        pointsAdj.push(new THREE.Vector3().fromBufferAttribute(geometry.attributes.position, v));
                    }
                }
            }
            currFace.geometry.setFromPoints(pointsCurr);
            adjFaces.geometry.setFromPoints(pointsAdj);
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