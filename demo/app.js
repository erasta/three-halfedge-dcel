import { RoomEnvironment } from 'three/addon/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/addon/controls/OrbitControls.js';
import { Dcel } from '../Dcel.js';
import {
    BufferGeometry,
    Color,
    Float32BufferAttribute,
    Mesh,
    MeshBasicMaterial,
    MeshStandardMaterial,
    PerspectiveCamera,
    PMREMGenerator,
    Raycaster,
    Scene,
    TorusKnotGeometry,
    Vector2,
    Vector3,
    WebGLRenderer,
} from 'three';

class App {
    go() {
        const scene = new Scene();
        const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(2.5, 5, 35);

        const renderer = new WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
        const controls = new OrbitControls(camera, renderer.domElement);
        scene.environment = new PMREMGenerator(renderer).fromScene(new RoomEnvironment()).texture;
        scene.background = new Color(0x888888);

        const geometry = new TorusKnotGeometry(10, 2, 200, 32, 3, 5);
        this.mesh = new Mesh(geometry, new MeshStandardMaterial({ vertexColors: true }));
        this.color = new Color('green');
        this.mesh.geometry.setAttribute('color', new Float32BufferAttribute(this.mesh.geometry.attributes.position.array, 3));
        for (let index = 0; index < this.mesh.geometry.attributes.position.count; index++) {
            this.color.toArray(this.mesh.geometry.attributes.color.array, index * 3)
        }
        scene.add(this.mesh);

        const start = Date.now();
        this.dcel = new Dcel(geometry);
        console.log('build dcel took:', Date.now() - start, 'ms for ', this.dcel.faces.length, 'faces');

        this.colorForLevel = Array.from({ length: 20 }).map((_, i, arr) => new Color().setHSL(i / arr.length, 1, 0.5));
        this.facesIncluded = this.dcel.faces.map(_ => false);
        this.facesForLevel = this.colorForLevel.map(_ => []);

        const raycaster = new Raycaster();
        const pointer = new Vector2();
        window.addEventListener('pointermove', (event) => {
            pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(pointer, camera);
            const inter = raycaster.intersectObject(this.mesh);
            this.calcColorsByIntersection(inter);
        });

        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };

        animate();

        return this;
    }

    calcColorsByIntersection(inter) {
        for (let i = 0; i < this.facesForLevel.length; ++i) {
            for (const faceIndex of this.facesForLevel[i]) {
                this.mesh.geometry.index.array.slice(faceIndex * 3, faceIndex * 3 + 3).forEach(v => {
                    this.color.toArray(this.mesh.geometry.attributes.color.array, v * 3)
                });
            }
            this.facesForLevel[i] = [];
        }

        if (inter.length) {
            const faceIndex = inter[0].faceIndex;
            this.facesForLevel[0].push(faceIndex);
            this.facesIncluded.fill(false);
            this.facesIncluded[faceIndex] = true;

            for (let i = 1; i < this.facesForLevel.length; ++i) {
                this.facesForLevel[i - 1].forEach((faceIndex) => {
                    this.dcel.forAdjacentFaces(faceIndex, adjFaceIndex => {
                        if (!this.facesIncluded[adjFaceIndex]) {
                            this.facesForLevel[i].push(adjFaceIndex);
                            this.facesIncluded[adjFaceIndex] = true;
                        }
                    });
                });
            }

            // Color faces by levels, a.k.a distance from intersection point
            for (let i = 0; i < this.facesForLevel.length; ++i) {
                for (const faceIndex of this.facesForLevel[i]) {
                    this.mesh.geometry.index.array.slice(faceIndex * 3, faceIndex * 3 + 3).forEach(v => {
                        this.colorForLevel[i].toArray(this.mesh.geometry.attributes.color.array, v * 3);
                    });
                }
            }
        }
        this.mesh.geometry.attributes.color.needsUpdate = true;
    }
}

new App().go();