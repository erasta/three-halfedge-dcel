# three-halfedge-dcel
Doubly-Connected-Edge-List (DCEL) or Half-Edge data structure implementation for three.js

[![npm](https://img.shields.io/npm/v/three-halfedge-dcel?style=plastic)](https://www.npmjs.com/package/three-halfedge-dcel)

The Doubly-Connected-Edge-List (DCEL) or Half-Edge data structure is a compact and efficient representation of all faces, edges and vertices in a mesh, allowing fast spatial travel and queries.  
Contains a list of all faces in the geometry, each holding a cyclic linked-list of half-edges.  
A half-edge is composed of two vertices and its twin half-edge on the adjacent face.  
For more information [wikipedia](https://en.wikipedia.org/wiki/Doubly_connected_edge_list). Illustration:

<a title="Accountalive, CC BY-SA 3.0 &lt;https://creativecommons.org/licenses/by-sa/3.0&gt;, via Wikimedia Commons" href="https://commons.wikimedia.org/wiki/File:Dcel-halfedge-connectivity.svg"><img width="256" alt="Dcel-halfedge-connectivity" src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Dcel-halfedge-connectivity.svg/256px-Dcel-halfedge-connectivity.svg.png"></a>

## Install
```sh
npm install --save three-halfedge-dcel
```

## Usage
```js
import { Dcel } from 'three-halfedge-dcel';
const mesh = new THREE.Mesh(...); // get your mesh from somewhere
const dcel = new Dcel(mesh.geometry);
dcel.forAdjacentFaces(faceIndex, (adjacentFaceIndex) => {
    ... // do something with adjacent faces
})
```

## Note
Some meshes and geometries are generated or loaded as non-indexed, meaning their faces do not share vertices, and there for cannot be indexed as adjacent. This can be solved by reconnecting them with:
```js
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
geometry = BufferGeometryUtils.mergeVertices(geometry);
```