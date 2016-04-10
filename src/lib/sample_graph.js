import Vertex from '../lib/vertex';
import Edge from '../lib/edge';
import Graph from '../lib/graph';

let sample_graph = new Graph();
let v0 = new Vertex(0);
let v1 = new Vertex(1);
let v2 = new Vertex(2);
let v3 = new Vertex(3);
let v4 = new Vertex(4);
let v5 = new Vertex(5);

// SAMPLE GRAPH 1

let e01 = new Edge(v0, v1, 8);
let e02 = new Edge(v0, v2, 5);
let e12 = new Edge(v1, v2, 5);
let e13 = new Edge(v1, v3, 5);
let e24 = new Edge(v2, v4, 8);
let e34 = new Edge(v3, v4, 5);
let e35 = new Edge(v3, v5, 11);
let e43 = new Edge(v4, v3, 3);
let e45 = new Edge(v4, v5, 2);

sample_graph.addEdge(e01);
sample_graph.addEdge(e02);
sample_graph.addEdge(e12);
sample_graph.addEdge(e13);
sample_graph.addEdge(e24);
sample_graph.addEdge(e34);
sample_graph.addEdge(e35);
sample_graph.addEdge(e43);
sample_graph.addEdge(e45);

sample_graph.setSource(v0);
sample_graph.setSink(v5);


// SAMPLE GRAPH 2
//let e01 = new Edge(v0, v1, 8);
//let e10 = new Edge(v1, v0, 5);
//
//sample_graph.addEdge(e01);
//sample_graph.addEdge(e10);
//
//sample_graph.setSource(v0);
//sample_graph.setSink(v1);

export default sample_graph;