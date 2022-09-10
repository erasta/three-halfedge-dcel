# three-halfedge-dcel
Doubly-Connected-Edge-List (DCEL) or Half-Edge data structure implementation for three.js

[![npm](https://img.shields.io/npm/v/three-halfedge-dcel?style=plastic)](https://www.npmjs.com/package/three-halfedge-dcel)

The Doubly-Connected-Edge-List (DCEL) or Half-Edge data structure is a compact and efficient representation of all faces, edges and vertices in a mesh, allowing fast spatial travel and queries.  
DCEL Contains a list of faces in a geometry, each holding a cyclic linked-list of half-edges. Each half-edge is composed of two vertices and its twin half-edge on the adjacent face.  
For more information [wikipedia](https://en.wikipedia.org/wiki/Doubly_connected_edge_list). Illustration:

<a title="Accountalive, CC BY-SA 3.0 &lt;https://creativecommons.org/licenses/by-sa/3.0&gt;, via Wikimedia Commons" href="https://commons.wikimedia.org/wiki/File:Dcel-halfedge-connectivity.svg"><img width="256" alt="Dcel-halfedge-connectivity" src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Dcel-halfedge-connectivity.svg/256px-Dcel-halfedge-connectivity.svg.png"></a>

## Demo
This demo color the face pointed by the user, and color all its adjacent faces and their adjacent faces, upto the k-th steps distance, with color according to its adjacency steps distance from the pointed face.  
https://erasta.github.io/three-halfedge-dcel  
![Preview of the demo](files/halfedge-small.gif)


## Install
```sh
npm install --save three-halfedge-dcel
```

## Usage
```js
import { Dcel } from 'three-halfedge-dcel';
const mesh = new THREE.Mesh(...); // get your mesh from somewhere
const dcel = new Dcel(mesh.geometry, {
    mergeVerticesThreshold: identical_vertices_max_dist // default: 1e-4
});
dcel.forAdjacentFaces(faceIndex, (adjacentFaceIndex) => {
    ... // do something with adjacent faces
})
```

