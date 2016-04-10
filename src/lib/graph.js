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

  toJSON() {
    let vertices = [];
    let edges = [];

    this.vertices.map(function (v) {
      vertices.push(v.toJSON());
    });

    this.edges.map(function (e) {
      edges.push(e.toJSON());
    });

    return {
      vertices: vertices,
      edges: edges
    }
  }

  addVertex(vertex) {
    if (!vertex) {
      return;
    }

    if (_.isEmpty(this.vertices)) {
      this.vertices.push(vertex);
      return;
    }

    let clone_index = _.findIndex(this.vertices, function (v) {
      return v.id === vertex.id;
    });

    if (-1 === clone_index) {
      this.vertices.push(vertex);
    }
  }

  removeVertex(vertex) {
    let _this = this;

    let edges_to_remove = _.filter(this.edges, function (e) {
      return e.source.id === vertex.id || e.target.id === vertex.id;
    });

    edges_to_remove.map(function (e) {
      _this.removeEdge(e);
    });

    _.remove(this.vertices, function (v) {
      return v.id === vertex.id;
    });
  }

  addEdge(edge) {
    // do not allow clones of an edge
    let clone_index = _.findIndex(this.edges, function (e) {
      return (e.id === edge.id) || (e.source.id === edge.source.id && e.target.id === edge.target.id);
    });

    if (-1 === clone_index) {
      // if there is another node going in the opposite direction, edges will be evil twins
      let evil_twin_index = _.findIndex(this.edges, function (e) {
        return e.source.id === edge.target.id && e.target.id === edge.source.id;
      });

      if (-1 !== evil_twin_index) {
        this.edges[evil_twin_index].has_evil_twin = true;
        edge.has_evil_twin = true;
      }
      this.edges.push(edge);
      this.addVertex(edge.source);
      this.addVertex(edge.target);
    }
  }

  removeEdge(edge) {
    // if the edge is an evil twin, make it no longer so...
    if (edge.has_evil_twin) {
      edge.has_evil_twin = false;
      let evil_twin_index = _.findIndex(this.edges, function (e) {
        return e.source.id === edge.target.id && e.target.id === edge.source.id;
      });
      if (-1 !== evil_twin_index) {
        this.edges[evil_twin_index].has_evil_twin = false;
      }
    }
    _.remove(this.edges, function (e) {
      return e.id === edge.id;
    });
  }

  setSource(vertex) {
    if (-1 === _.indexOf(this.vertices, vertex)) {
      throw new Error('Source vertex must be in the graph');
    }
    if (vertex === this.sink) {
      throw new Error('Graph sink cannot be the source');
    }
    this.source = vertex;
  }

  setSink(vertex) {
    if (-1 === _.indexOf(this.vertices, vertex)) {
      throw new Error('Sink vertex must be in the graph');
    }
    if (vertex === this.source) {
      throw new Error('Graph source cannot be the sink');
    }
    this.sink = vertex;
  }

  removeSource() {
    this.source = null;
  }

  // Uses Breadth First Search to find an augmenting path
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

    // visit each node according to BFS and push to queue
    while (queue.length > 0 && !done) {
      let u = queue.shift();
      g.edges.map(function (e) {
        if (e.source === u && e.capacity > 0 && !e.target.visited) {
          let v = e.target;
          v.visited = true;
          v.pre = u;

          // add new node to the end of the queue
          queue.push(v);

          // if the sink is found, we're done
          if (v === g.sink) {
            done = true;
          }
        }
      });
    }

    // if the sink was not found, no increase in flow
    if (!g.sink.visited) {
      return 0;
    }

    return this._buildFlowPath();
  }

  // Uses Depth First Search to find an augmenting path
  // Returns the increase in flow along the new path
  dfs() {
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

    // visit each node according to DFS and push to queue
    while (queue.length > 0 && !done) {
      let u = queue.shift();
      g.edges.map(function (e) {
        if (e.source === u && e.capacity > 0 && !e.target.visited) {
          let v = e.target;
          v.visited = true;
          v.pre = u;

          // add new node to the front of the queue
          queue.unshift(v);

          // if the sink is found, we're done
          if (v === g.sink) {
            done = true;
          }
        }
      });
    }

    // if the sink was not found, no increase in flow
    if (!g.sink.visited) {
      return 0;
    }

    return this._buildFlowPath();
  }

  fattestPath() {
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

    let queue = [];

    // set fatness of all vertices to 0
    g.vertices.map(function (vertex) {
      vertex.fat = 0;
      queue.push(vertex);
    });

    // set fatness to source as very large
    g.source.fat = Number.MAX_VALUE;

    while (queue.length > 0) {

      // get fattest vertex and remove from queue
      let fattest = _.maxBy(queue, 'fat');
      _.pull(queue, fattest);

      // if the fattest value is 0, we are finished
      if (0 === fattest.fat) {
        break;
      }

      // update fat value for neighbours of fattest vertex
      g.edges.map(function (edge) {
        if (edge.source === fattest && edge.capacity > 0) {
          if (edge.target.fat < Math.min(fattest.fat, edge.capacity)) {
            edge.target.fat = Math.min(fattest.fat, edge.capacity);
            edge.target.pre = fattest;
          }
        }
      });
    }

    // if the sink could not be reached by any vertex, flow is 0
    if (null === g.sink.pre) {
      return 0;
    }

    return this._buildFlowPath();
  }

  edmondsKarp() {
    let g = this;
    g.max_flow = 0;
    g.edges.map(function (e) {
      e.resetFlow();
    });

    while (g.bfs() > 0) {
      g.flow_path = [];
    }
    g.flow_path = [];
  }

  /** HELPER FUNCTIONS **/

  // Backtracks from the sink to the source to
  // build the flow path
  _buildFlowPath() {
    let g = this;

    let done = false;
    let min_capacity = Number.MAX_VALUE;
    let head = g.sink;
    while (!done && null != head) {
      let tail = head.pre;

      // find the edge connecting head and tail vertices
      let edge = _.find(g.edges, {'source': tail, 'target': head});
      g.flow_path.push(edge);
      if (edge.capacity < min_capacity) {
        min_capacity = edge.capacity;
      }

      head = tail;

      // if we have nowhere else to go, we're done
      if (null === head.pre) {
        done = true;
      }
    }

    // if the head of the path is not our source node, not an augmenting path
    if(g.source !== head) {
      return 0;
    }

    g.flow_path.map(function (edge_with_flow) {
      edge_with_flow.addFlow(min_capacity);
    });
    g.max_flow += min_capacity;

    g.flow_path.reverse();

    return min_capacity;
  }
}

export default Graph;