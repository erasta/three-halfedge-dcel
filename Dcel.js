import * as THREE from 'three';
import { Face } from './ConvexHull.js'; // TODO after r145 import from three

/**
 * Doubly Connected Edge List - DCEL
 * For each face in the geometry, contains its half-edges.
 * A half-edge has two vertices and its twin half-edge on the adjacent face.
 */

export class Dcel {
    constructor(geometry) {
        this.vertices = Array.from({ length: geometry.attributes.position.count }, (_, i) => {
            return {
                point: new THREE.Vector3().fromBufferAttribute(geometry.attributes.position, i),
                edges: [],
                index: i
            };
        });
        const faceIndices = new THREE.Vector3();
        this.faces = Array.from({ length: geometry.index.count / 3 }, (_, i) => {
            faceIndices.fromArray(geometry.index.array, i * 3);
            const face = Face.create(this.vertices[faceIndices.x], this.vertices[faceIndices.y], this.vertices[faceIndices.z]);
            face.index = i;
            return face;
        });
        this.computeTwins();
    }

    computeTwins() {
        this.faces.forEach(face => {
            let e = face.edge;
            for (let j = 0; j < 3; ++j, e = e.next) {
                const a0 = e.head();
                const b0 = e.tail();
                if (!e.twin) {
                    for (const other of a0.edges) {
                        const a1 = other.head();
                        const b1 = other.tail();
                        if (a0 == b1 && b0 == a1) {
                            e.setTwin(other);
                            break;
                        }
                    }
                }
                a0.edges.push(e);
                b0.edges.push(e);
            }
            return face;
        });
    }

    adjacentFaces(faceIndex) {
        const face = this.faces[faceIndex];
        const adj = [];
        const start = face.edge;
        let e = start;
        while (true) {
            adj.push(e.twin.face);
            e = e.next;
            if (e === start) {
                break;
            }
        }
        return adj;
    }

    faceVertices(faceIndex) {
        const face = this.faces[faceIndex];
        const vertices = [];
        const start = face.edge;
        let e = start;
        while (true) {
            vertices.push(e.head().index);
            e = e.next;
            if (e === start) {
                break;
            }
        }
        return vertices;
    }
}

