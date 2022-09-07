# three-halfedge-dcel
Doubly-Connected-Edge-List (DCEL) or Half-Edge data structure implementation for three.js

[![npm](https://img.shields.io/npm/v/three-halfedge-dcel?style=plastic)](https://www.npmjs.com/package/three-halfedge-dcel)

The Doubly-Connected-Edge-List (DCEL) or Half-Edge data structure is a compact and efficient representation of all faces, edges and vertices in a mesh, allowing fast spatial travel and queries.  
Contains a list of all faces in the geometry, each holding a cyclic linked-list of half-edges.  
A half-edge is composed of two vertices and its twin half-edge on the adjacent face.  
For more information [wikipedia](https://en.wikipedia.org/wiki/Doubly_connected_edge_list). Illustration:

<a title="Accountalive, CC BY-SA 3.0 &lt;https://creativecommons.org/licenses/by-sa/3.0&gt;, via Wikimedia Commons" href="https://commons.wikimedia.org/wiki/File:Dcel-halfedge-connectivity.svg"><img width="256" alt="Dcel-halfedge-connectivity" src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Dcel-halfedge-connectivity.svg/256px-Dcel-halfedge-connectivity.svg.png"></a>
