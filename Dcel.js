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

        _triangle.set(a.point, b.point, c.point);

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

            return tail.point.distanceTo(head.point);

        }

        return - 1;

    }

    lengthSquared() {

        const head = this.head();
        const tail = this.tail();

        if (tail !== null) {

            return tail.point.distanceToSquared(head.point);

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
            return {
                point: new THREE.Vector3().fromBufferAttribute(geometry.attributes.position, i),
                edges: []
            };
        });
        this.faces = Array.from({ length: geometry.index.count / 3 }, (_, i) => {
            _faceIndices.fromArray(geometry.index.array, i * 3);
            const face = Face.create(this.vertices[_faceIndices.x], this.vertices[_faceIndices.y], this.vertices[_faceIndices.z]);
            let e = face.edge;
            for (let j = 0; j < 3; ++j, e = e.next) {
                const a0 = e.head();
                const b0 = e.tail();
                if (!e.twin) {
                    a0.edges.forEach(other => {
                        const a1 = other.head();
                        const b1 = other.tail();
                        if (a0 == b1 && b0 == a1) {
                            e.setTwin(other);
                        }
                    });
                }
                a0.edges.push(e);
                b0.edges.push(e);
            }
            return face;
        });
    }
}

