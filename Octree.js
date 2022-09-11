import * as THREE from 'three';

export class Octree {
    constructor(vertices) {
        this.bounds = new THREE.Box3().setFromPoints(vertices);
        this.subtree = new SubTree(this.bounds, vertices);

        const trees = [this.subtree];
        while (trees.length) {
            const curr = trees.at(-1);
            trees.pop();
            if (curr.vertices.length > 8) {
                curr.split();
                trees.push(...curr.subtrees);
            }
        }
    }

    search(position, radius) {
        const sphere = (position instanceof THREE.Sphere) ? position : new THREE.Sphere(position, radius);
        return this.subtree.search(sphere);
    }
}

class SubTree {
    constructor(box, vertices) {
        this.box = box;
        this.vertices = vertices;
        this.subtrees = [];
    }

    split() {
        const halfsize = this.box.getSize(new THREE.Vector3()).multiplyScalar(0.5);
        for (let x = 0; x < 2; x++) {
            for (let y = 0; y < 2; y++) {
                for (let z = 0; z < 2; z++) {
                    const curr = new THREE.Box3();
                    curr.min.set(x, y, z).multiply(halfsize).add(this.box.min);
                    curr.max.copy(curr.min).add(halfsize);
                    const currVertices = this.vertices.filter(v => curr.containsPoint(v));
                    const tree = new SubTree(curr, currVertices);
                    this.subtrees.push(tree);
                }
            }
        }
        this.vertices = [];
    }

    search(sphere) {
        if (!this.box.intersectsSphere(sphere)) {
            return [];
        }
        if (this.vertices.length) {
            return this.vertices.filter(v => sphere.containsPoint(v));
        }
        const ret = []
        for (const tree of this.subtrees) {
            const partial = tree.search(sphere);
            ret.push(...partial);
        }
        return ret;
    }
}
