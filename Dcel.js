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

    forEdges(face, callback) {
        const start = face.edge;
        let e = start;
        while (true) {
            callback(e, face, this);
            e = e.next;
            if (e === start) {
                break;
            }
        }
    }

    computeTwins() {
        this.faces.forEach(face => {
            this.forEdges(face, e => {
                if(!e.twin) {
                    for (const other of e.head().edges) {
                        // if (e.tail() === other.head()) { // TODO: check if ok to use shorter if
                        if (e.head() === other.tail() && e.tail() === other.head()) {
                            e.setTwin(other);
                            break;
                        }
                    }
                }
                e.head().edges.push(e); // TODO: check if ok to remove this push
                e.tail().edges.push(e);
            });
        });
    }

    forAdjacentFaces(faceIndex, callback) {
        this.forEdges(this.faces[faceIndex], e => {
            callback(e.twin.face.index);
        });
    }

    forFaceVertices(faceIndex, callback) {
        this.forEdges(this.faces[faceIndex], e => {
            callback(e.head().index);
        });
    }
}

