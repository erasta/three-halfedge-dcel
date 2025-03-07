import { BufferGeometry, Vector3 } from 'three';
import { Face, HalfEdge, VertexNode } from 'three/examples/jsm/math/ConvexHull';

type DcelVertexNode = VertexNode & { index: number };
type DcelFaceNode = Face & { index: number };

/**
 * Doubly Connected Edge List - DCEL
 * For each face in the geometry, contains its half-edges.
 * A half-edge has two vertices and its twin half-edge on the adjacent face.
 */

export class Dcel {
    readonly vertices: DcelVertexNode[];
    readonly faces: DcelFaceNode[];

    constructor(
        geometry: BufferGeometry,
        options?: { mergeVerticesThreshold: number; },
    ) {
        const num = geometry.attributes.position.count;
        this.vertices = Array.from({ length: num }, (_, i) => {
            const point = new Vector3().fromBufferAttribute(geometry.attributes.position, i);
            const node = new VertexNode(point) as DcelVertexNode;
            node.index = i
            return node;
        });

        const threshold = !options ? 1e-4 : options.mergeVerticesThreshold;
        if (threshold) {
            const hashToVertex: { [key: string]: number } = {}
            this.vertices.forEach(v => {
                const hash = `${~~(v.point.x / threshold)},${~~(v.point.y / threshold)},${~~(v.point.z / threshold)}`;
                if (hash in hashToVertex) {
                    v.index = hashToVertex[hash];
                } else {
                    hashToVertex[hash] = v.index;
                }
            });
        }

        const faceIndices = new Vector3();
        this.faces = Array.from({ length: geometry.index!.count / 3 }, (_, i) => {
            faceIndices.fromArray(geometry.index!.array, i * 3);
            const face = Face.create(this.vertices[faceIndices.x], this.vertices[faceIndices.y], this.vertices[faceIndices.z]) as DcelFaceNode;
            face.index = i;
            return face;
        });

        const hashToEdge = new Map();
        this.faces.forEach(face => {
            this.forEdges(face, e => {
                if (!e.twin) {
                    const hashInv = (e.tail() as DcelVertexNode).index * num + (e.head() as DcelVertexNode).index;
                    const other = hashToEdge.get(hashInv);
                    if (other) {
                        e.setTwin(other);
                    } else {
                        const hash = (e.head() as DcelVertexNode).index * num + (e.tail() as DcelVertexNode).index;
                        hashToEdge.set(hash, e);
                    }
                }
            });
        });

    }

    forEdges(face: DcelFaceNode, callback: (edge: HalfEdge, face: DcelFaceNode) => void) {
        const start = face.edge;
        let e = start;
        while (true) {
            callback(e, face);
            e = e.next;
            if (e === start) {
                break;
            }
        }
    }

    forAdjacentFaces(faceIndex: number, callback: (adjFaceIndex: number) => void) {
        this.forEdges(this.faces[faceIndex], e => {
            callback((e.twin.face as DcelFaceNode).index);
        });
    }
}

