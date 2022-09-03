import * as THREE from 'three';

/**
 * Doubly Connected Edge List - DCEL
 * For each face in the geometry, contains its half-edges.
 * A half-edge has two vertices and its twin half-edge on the adjacent face.
 */


const Visible = 0;
const Deleted = 1;
const _triangle = new THREE.Triangle();
const _faceIndices = new THREE.Vector3();

class Face {

    constructor() {

        this.normal = new THREE.Vector3();
        this.midpoint = new THREE.Vector3();
        this.area = 0;

        this.constant = 0; // signed distance from face to the origin
        this.outside = null; // reference to a vertex in a vertex list this face can see
        this.mark = Visible;
        this.edge = null;

    }

    static create(a, b, c) {

        const face = new Face();

        const e0 = new HalfEdge(a, face);
        const e1 = new HalfEdge(b, face);
        const e2 = new HalfEdge(c, face);

        // join edges

        e0.next = e2.prev = e1;
        e1.next = e0.prev = e2;
        e2.next = e1.prev = e0;

        // main half edge reference

        face.edge = e0;

        return face.compute();

    }

    getEdge(i) {

        let edge = this.edge;

        while (i > 0) {

            edge = edge.next;
            i--;

        }

        while (i < 0) {

            edge = edge.prev;
            i++;

        }

        return edge;

    }

    compute() {

        const a = this.edge.tail();
        const b = this.edge.head();
        const c = this.edge.next.head();

        _triangle.set(a, b, c);

        _triangle.getNormal(this.normal);
        _triangle.getMidpoint(this.midpoint);
        this.area = _triangle.getArea();

        this.constant = this.normal.dot(this.midpoint);

        return this;

    }

    distanceToPoint(point) {

        return this.normal.dot(point) - this.constant;

    }

}

// Entity for a Doubly-Connected Edge List (DCEL).

class HalfEdge {


    constructor(vertex, face) {

        this.vertex = vertex;
        this.prev = null;
        this.next = null;
        this.twin = null;
        this.face = face;

    }

    head() {

        return this.vertex;

    }

    tail() {

        return this.prev ? this.prev.vertex : null;

    }

    length() {

        const head = this.head();
        const tail = this.tail();

        if (tail !== null) {

            return tail.distanceTo(head);

        }

        return - 1;

    }

    lengthSquared() {

        const head = this.head();
        const tail = this.tail();

        if (tail !== null) {

            return tail.distanceToSquared(head);

        }

        return - 1;

    }

    setTwin(edge) {

        this.twin = edge;
        edge.twin = this;

        return this;

    }

}

export class Dcel {
    constructor(geometry) {
        this.vertices = Array.from({ length: geometry.attributes.position.count }, (_, i) => {
            return new THREE.Vector3().fromBufferAttribute(geometry.attributes.position, i);
        });
        this.faces = Array.from({ length: geometry.index.count / 3 }, (_, i) => {
            _faceIndices.fromArray(geometry.index.array, i * 3);
            return Face.create(this.vertices[_faceIndices.x], this.vertices[_faceIndices.y], this.vertices[_faceIndices.z]);
        });
    }

    // this.halfedges = [];
    // for (let i = 0, faceIndex = 0, il = this.faces.length; i < il; i += 3, ++faceIndex) {
    //     // const face = new Face(faceIndex, facesArray.slice(i, i + 3));
    //     const [a, b, c] = this.faces.slice(i, i + 3);
    //     const start = this.halfedges.length;
    //     this.halfedges.push(a, b, -1, b, c, -1, c, a, -1);
    //     for (let h0 = start; h0 < this.halfedges.length; ++h0) {
    //         const h0v = this.halfedges[h0];
    //         for (let h1 = start - 1; h1 >= 0; --h1) {
    //             const h1v = this.halfedges[h1];
    //             if (h0v[0] === h1v[1] && h0v[1] === h1v[0]) {
    //                 h0v.push(h1);
    //                 h1v.push(h0);
    //                 break;
    //             }
    //         }
    //     }
    // }
}

