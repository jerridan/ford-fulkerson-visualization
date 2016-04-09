import {expect} from 'chai';
import Vertex from '../vertex';
import Edge from '../edge';
import Graph from '../graph';

describe('Graph', function () {
  describe('#addVertex', function () {
    it('adds a vertex to the graph vertices', function () {
      let g = new Graph();
      let v = new Vertex(0);
      g.addVertex(v);
      expect(g.vertices).to.eql([v]);
    });
    it('does not add the same vertex to a graph twice', function () {
      let g = new Graph();
      let v = new Vertex(0);
      g.addVertex(v);
      g.addVertex(v);
      expect(g.vertices).to.eql([v]);
    });
    it('does not add a vertex to a graph if one with the same id already exists', function () {
      let g = new Graph();
      let v1 = new Vertex(0);
      let v2 = new Vertex(0);
      v2.visited = true;
      g.addVertex(v1);
      g.addVertex(v2);
      expect(g.vertices).to.eql([v1]);
    });
  });
  describe('#removeVertex', function () {
    it('removes a vertex from a graph', function () {
      let g = new Graph();
      let v = new Vertex(0);
      g.addVertex(v);
      g.removeVertex(v);
      expect(g.vertices).to.eql([]);
    });
    it('removes any edges associated with the removed vertex', function () {
      let g = new Graph();
      let v1 = new Vertex(0);
      let v2 = new Vertex(1);
      let e = new Edge(v1, v2);
      g.addEdge(e);
      g.removeVertex(v1);
      expect(g.vertices).to.eql([v2]);
      expect(g.edges).to.eql([]);
    });
  });
  describe('#addEdge', function () {
    it('adds an edge to the graph edges', function () {
      let g = new Graph();
      let e = new Edge();
      g.addEdge(e);
      expect(g.edges).to.eql([e]);
    });
    it('does not add the same edge to a graph twice', function () {
      let g = new Graph();
      let e = new Edge();
      g.addEdge(e);
      g.addEdge(e);
      expect(g.edges).to.eql([e]);
    });
    it('adds the source and target of an edge to a graph', function () {
      let g = new Graph();
      let v1 = new Vertex(0);
      let v2 = new Vertex(1);
      let e = new Edge(v1, v2);
      g.addEdge(e);
      expect(g.vertices).to.eql([v1, v2]);
    });
    it('does not add an edge if one already exists with the same source and target', function () {
      let g = new Graph();
      let v1 = new Vertex(0);
      let v2 = new Vertex(1);
      let e1 = new Edge(v1, v2);
      let e2 = new Edge(v1, v2);
      g.addEdge(e1);
      g.addEdge(e2);
      expect(g.edges).to.eql([e1]);
    });
  });
  describe('#removeEdge', function () {
    it('removes an edge from the graph', function () {
      let g = new Graph();
      let e = new Edge();
      g.addEdge(e);
      g.removeEdge(e);
      expect(g.edges).to.eql([]);
    });
  });
  describe('#get size', function () {
    it('should be 0 for a new graph', function () {
      let graph = new Graph();
      expect(graph.size).to.eql(0);
    });
    it('should be 1 after adding a vertice', function () {
      let graph = new Graph();
      let vertex = new Vertex(0);
      graph.addVertex(vertex);
      expect(graph.size).to.eql(1);
    });
  });
  describe('#setSource', function () {
    it('throws an error if the vertex is not in the graph', function () {
      let graph = new Graph();
      let vertex = new Vertex(0);
      try {
        graph.setSource(vertex);
        expect(true).to.be.false;
      } catch (err) {
        expect(err).to.eql(new Error('Source vertex must be in the graph'));
      }
    });
    it('sets the source of the graph', function () {
      let graph = new Graph();
      let vertex = new Vertex(0);
      graph.addVertex(vertex);
      graph.setSource(vertex);
      expect(graph.source).to.eql(vertex);
    });
  });
  describe('#setSink', function () {
    it('throws an error if the vertex is not in the graph', function () {
      let graph = new Graph();
      let vertex = new Vertex(0);
      try {
        graph.setSink(vertex);
        expect(true).to.be.false;
      } catch (err) {
        expect(err).to.eql(new Error('Sink vertex must be in the graph'));
      }
    });
    it('sets the source of the graph', function () {
      let graph = new Graph();
      let vertex = new Vertex(0);
      graph.addVertex(vertex);
      graph.setSink(vertex);
      expect(graph.sink).to.eql(vertex);
    });
  });
  describe('#removeSource', function () {
    it('sets the source to null', function () {
      let graph = new Graph();
      let vertex = new Vertex(0);
      graph.addVertex(vertex);
      graph.setSource(vertex);
      expect(graph.source).to.eql(vertex);
      graph.removeSource();
      expect(graph.source).to.be.null;
    });
  });
  describe('#bfs', function () {
    it('returns 0 if no vertices', function () {
      let graph = new Graph();
      expect(graph.bfs()).to.eql(0);
    });
    it('returns 0 if no edges', function () {
      let graph = new Graph();
      let v0 = new Vertex(0);
      let v1 = new Vertex(1);
      graph.addVertex(v0);
      graph.addVertex(v1);
      graph.setSource(v0);
      graph.setSink(v1);
      expect(graph.bfs()).to.eql(0);
    });
    it('throws an error if the source is null', function () {
      let graph = new Graph();
      let vertex = new Vertex(0);
      graph.addVertex(vertex);
      try {
        graph.bfs();
        expect(true).to.be.false;
      } catch (err) {
        expect(err).to.eql(new Error('Graph must have a source'));
      }
    });
    it('throws an error if the sink is null', function () {
      let graph = new Graph();
      let vertex = new Vertex(0);
      graph.addVertex(vertex);
      graph.setSource(vertex);
      try {
        graph.bfs();
        expect(true).to.be.false;
      } catch (err) {
        expect(err).to.eql(new Error('Graph must have a sink'));
      }
    });
    it('shows a vertex as visited if it is the source and the source is visited', function () {
      let g = new Graph();
      let v = new Vertex(0);
      g.addVertex(v);
      g.setSource(v);
      expect(v.visited).to.be.false;
      g.source.visited = true;
      expect(v.visited).to.be.true;
    });
    it('returns the increased flow along an augmented path', function () {
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
      g.flow_path.map(function (p) {
        expect(p.flow).to.eql(flow_increase);
      });
      expect(flow_increase).to.eql(5);
      expect(g.max_flow).to.eql(flow_increase);
    });
    it('returns 0 flow if there is no augmenting path from source to sink', function () {
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
      let e35 = new Edge(v3, v5, 0);
      let e43 = new Edge(v4, v3, 3);
      let e45 = new Edge(v4, v5, 0);

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
      expect(flow_increase).to.eql(0);
    });
  });
  describe('#edmondsKarp', function () {
    it('returns a maximum flow of 0 if there are no augmenting paths', function () {
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
      let e35 = new Edge(v3, v5, 0);
      let e43 = new Edge(v4, v3, 3);
      let e45 = new Edge(v4, v5, 0);

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

      g.edmondsKarp();
      expect(g.max_flow).to.eql(0);
    });
    it('throws an error if the source is null', function () {
      let graph = new Graph();
      let vertex = new Vertex(0);
      graph.addVertex(vertex);
      try {
        graph.edmondsKarp();
        expect(true).to.be.false;
      } catch (err) {
        expect(err).to.eql(new Error('Graph must have a source'));
      }
    });
    it('throws an error if the sink is null', function () {
      let graph = new Graph();
      let vertex = new Vertex(0);
      graph.addVertex(vertex);
      graph.setSource(vertex);
      try {
        graph.edmondsKarp();
        expect(true).to.be.false;
      } catch (err) {
        expect(err).to.eql(new Error('Graph must have a sink'));
      }
    });
    it('returns the maximum flow of a graph', function () {
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

      g.edmondsKarp();
      expect(g.max_flow).to.eql(10);
    });
  });
  describe('#toJSON', function () {
    it('returns a JSON representation of the graph, containing vertices and edges', function () {
      let g = new Graph();
      let v0 = new Vertex(0);
      let v1 = new Vertex(1);
      let v2 = new Vertex(2);

      let e01 = new Edge(v0, v1, 8);
      let e02 = new Edge(v0, v2, 5);

      g.addEdge(e01);
      g.addEdge(e02);

      let graph_json = g.toJSON();
      expect(graph_json).to.eql({
        vertices: [
          {id: 0},
          {id: 1},
          {id: 2}
        ],
        edges: [
          {id: e01.id, capacity: 8, flow: 0, source: {id: 0}, target: {id: 1}},
          {id: e02.id, capacity: 5, flow: 0, source: {id: 0}, target: {id: 2}}
        ]
      })
    });
  });
});