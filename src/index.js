import Vertex from './lib/vertex';
import Edge from './lib/edge';
import Graph from './lib/graph';

let g = new Graph();
let v0 = new Vertex(0);
let v1 = new Vertex(1);
let v2 = new Vertex(2);
let v3 = new Vertex(3);
let v4 = new Vertex(4);
let v5 = new Vertex(5);

let e01 = new Edge(v0, v1, 8);
let e02 = new Edge(v0, v2, 5);
let e12 = new Edge(v1, v2, 5);
let e13 = new Edge(v1, v3, 5);
let e24 = new Edge(v2, v4, 8);
let e34 = new Edge(v3, v4, 5);
let e35 = new Edge(v3, v5, 11);
let e43 = new Edge(v4, v3, 3);
let e45 = new Edge(v4, v5, 2);

g.addEdge(e01);
g.addEdge(e02);
g.addEdge(e12);
g.addEdge(e13);
g.addEdge(e24);
g.addEdge(e34);
g.addEdge(e35);
g.addEdge(e43);
g.addEdge(e45);

g.setSource(v0);
g.setSink(v5);

let flow_increase = g.bfs();

console.log('flow', flow_increase);
console.log('flow_path', g.flow_path);