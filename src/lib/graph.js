import _ from 'lodash';

import Vertex from './vertex';
import Edge from './edge';

class Graph {
  constructor() {
    this.vertices = [];
    this.edges = [];
    this.source = null;
    this.sink = null;
    this.flow_path = [];
    this.max_flow = 0;
  }

  get size() {
    return this.vertices.length;
  }

  addVertex(vertex) {
    if (-1 === _.indexOf(this.vertices, vertex)) {
      this.vertices.push(vertex);
    }
  }

  addEdge(edge) {
    if (-1 === _.indexOf(this.edges, edge)) {
      this.edges.push(edge);
      this.addVertex(edge.source);
      this.addVertex(edge.target);
    }
  }

  setSource(vertex) {
    if (-1 === _.indexOf(this.vertices, vertex)) {
      throw new Error('Source vertex must be in the graph');
    }
    this.source = vertex;
  }

  setSink(vertex) {
    if (-1 === _.indexOf(this.vertices, vertex)) {
      throw new Error('Sink vertex must be in the graph');
    }
    this.sink = vertex;
  }

  removeSource() {
    this.source = null;
  }

  // Uses BFS to find an augmenting path
  // Returns the increase in flow along the new path
  bfs() {
    let g = this;

    if (_.isEmpty(g.vertices)) {
      return 0;
    }
    if (null === g.source) {
      throw new Error('Graph must have a source');
    }
    if (null === g.sink) {
      throw new Error('Graph must have a sink');
    }
    if (_.isEmpty(g.edges)) {
      return 0;
    }

    g.vertices.map(function (v) {
      v.visited = false;
      v.pre = null;
    });

    g.source.visited = true;
    let queue = [g.source];
    let done = false;

    while (queue.length > 0 && !done) {
      let u = queue.shift();
      g.edges.map(function (e) {
        if (e.source === u && e.capacity > 0 && !e.target.visited) {
          let v = e.target;
          v.visited = true;
          v.pre = u;
          queue.push(v);
          if (v === g.sink) {
            done = true;
          }
        }
      });
    }

    if(!g.sink.visited) {
      return 0;
    }

    done = false;
    let min_capacity = Number.MAX_VALUE;
    let head = g.sink;
    while (!done && null != head) {
      let tail = head.pre;
      g.edges.map(function (e) {
        if (e.source === tail && e.target === head) {
          g.flow_path.push(e);
          if (e.capacity < min_capacity) {
            min_capacity = e.capacity;
          }
        }
      });
      head = tail;
      if (head === g.source) {
        done = true;
      }
    }

    if (min_capacity !== Number.MAX_VALUE) {
      g.flow_path.map(function (edge_with_flow) {
        edge_with_flow.addFlow(min_capacity);
      });
      g.max_flow += min_capacity;
    }

    g.flow_path.reverse();
    return min_capacity;
  }

  edmondsKarp() {
    let g = this;
    g.edges.map(function(e) {
      e.resetFlow();
    });

    while(g.bfs() > 0) {
      g.flow_path = [];
    }
    g.flow_path = 0;
  }
}

export default Graph;