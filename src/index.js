import d3 from 'd3';
import d3ContextMenu from './lib/d3_context_menu';

import Vertex from './lib/vertex';
import Edge from './lib/edge';
import Graph from './lib/graph';

import sample_graph from './lib/sample_graph';

// set up SVG for D3
let width = 960,
  height = 500,
  colors = d3.scale.category10();

var svg = d3.select('#graph')
  .append('svg')
  .attr('oncontextmenu', 'return false;')
  .attr('width', width)
  .attr('height', height);

let next_vertex_id = 0;

let graph = sample_graph;
//let graph = new Graph();
next_vertex_id = graph.vertices.length;

let nodes = graph.vertices;
let links = graph.edges;

// Source and target of each link must reference node array
links.map(function (link) {
  link.source = nodes[link.source.id];
  link.target = nodes[link.target.id];
});

// init D3 force layout
let force = d3.layout.force()
  .nodes(nodes)
  .links(links)
  .size([width, height])
  .linkDistance(250)
  .charge(-500)
  .on('tick', tick);

// define arrow markers for graph links
svg.append('svg:defs').append('svg:marker')
  .attr('id', 'end-arrow')
  .attr('viewBox', '0 -5 10 10')
  .attr('refX', 11)
  .attr('markerWidth', 3)
  .attr('markerHeight', 3)
  .attr('orient', 'auto')
  .append('svg:path')
  .attr('d', 'M0,-5L10,0L0,5')
  .attr('fill', '#000');

// define arrow markers for graph links
svg.append('svg:defs').append('svg:marker')
  .attr('id', 'arc-end-arrow')
  .attr('viewBox', '0 -5 10 10')
  .attr('refX', 25)
  .attr('refY', -1)
  .attr('markerWidth', 3)
  .attr('markerHeight', 3)
  .attr('orient', 'auto')
  .append('svg:path')
  .attr('d', 'M0,-5L10,0L0,5')
  .attr('fill', '#000');

// Show a draggable line when user is adding a new edge
let drag_line = svg.append('svg:path')
  .attr('class', 'link dragline')
  .style('display', 'none')
  .attr('d', 'M0,0L0,0');

// handles to link and node element groups
let path = svg.append('svg:g').selectAll('path'),
  path_text = svg.append('svg:g').selectAll('g.link-text'),
  circle = svg.append('svg:g').selectAll('g');

// update force layout (called automatically each iteration)
function tick() {
  // draw directed edges with proper padding from node centers
  path.attr('d', function (d) {
    let deltaX = d.target.x - d.source.x,
      deltaY = d.target.y - d.source.y,
      dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
      normX = deltaX / dist,
      normY = deltaY / dist,
      sourcePadding = 12,
      targetPadding = 17,
      sourceX = d.source.x + (sourcePadding * normX),
      sourceY = d.source.y + (sourcePadding * normY),
      targetX = d.target.x - (targetPadding * normX),
      targetY = d.target.y - (targetPadding * normY);
    if (d.archedLeft || d.archedRight) {
      return "M" + d.source.x + "," + d.source.y + "A" + dist + "," + dist + " 0 0, 1 " + d.target.x + "," + d.target.y;
    } else {
      return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
    }
  });

  circle.attr('transform', function (d) {
    return 'translate(' + d.x + ',' + d.y + ')';
  });
}

// mouse event variables
let mousedown_node = null;
let mouseup_node = null;
let mousedown_link = null;

let context_menu_open = false;
let selected_link = null;
let entered_capacity_val = "";

function resetMouseVars() {
  mousedown_node = null;
  mouseup_node = null;
  mousedown_link = null;
}

// update graph (called when needed)
function restart() {

  path = path.data(links, function (d) {
    return d.id;
  });

  // update links
  d3.selectAll('path.link')
    .classed('selected', function (d) {
      return d === selected_link;
    })
    .style('marker-end', function (d) {
      if (d) {
        return d.archedLeft || d.archedRight ? 'url(#arc-end-arrow)' : 'url(#end-arrow)';
      }
    });

  // add new links
  path.enter().append('svg:path')
    .attr('class', 'link')
    .attr('id', function (d) {
      return 'link_id_' + d.id;
    })
    .style('marker-end', function (d) {
      return d.archedLeft || d.archedRight ? 'url(#arc-end-arrow)' : 'url(#end-arrow)';
    })
    .classed('selected', function (d) {
      return d === selected_link;
    })
    .on('mousedown', function (d) {
      mousedown_link = d;
      if (mousedown_link === selected_link) {
        selected_link = null;
      } else {
        selected_link = mousedown_link;
        entered_capacity_val = "";
      }
      restart();
    });

  path_text = path_text.data(links, function (d) {
    return d.id;
  });

  d3.selectAll('.capacity-text')
    .attr("dy", function (d) {
      return d.archedLeft || d.archedRight ? "-8px" : "-8px";
    })
    .attr("dx", function (d) {
      return d.archedLeft || d.archedRight ? "25px" : "10px";
    });


  let link_text = path_text.enter()
    .append('g')
    .attr('class', 'link-text');

  // Show capacity for each link
  link_text
    .append('svg:text')
    .attr('class', 'capacity-text')
    .style('font-size', "12px")
    .attr("dy", function (d) {
      return d.archedLeft || d.archedRight ? "-8px" : "-8px";
    })
    .attr("dx", function (d) {
      return d.archedLeft || d.archedRight ? "25px" : "10px";
    })
    .append('svg:textPath')
    .attr('xlink:href', function (d) {
      return '#link_id_' + d.id;
    })
    .style("text-anchor", "start")
    .attr('startOffset', '0%')
    .attr("class", function (d) {
      return "capacity_" + d.id;
    })
    .text(function (d) {
      return d.capacity;
    });

  // Show flow for each link
  link_text
    .append('svg:text')
    .attr('class', 'flow-text')
    .style('font-size', "12px")
    .attr("dy", function (d) {
      return d.archedLeft ? "-8px" : "-8px";
    })
    .attr("dx", function (d) {
      return d.archedLeft ? "12px" : "18px";
    })
    .append('svg:textPath')
    .attr('xlink:href', function (d) {
      return '#link_id_' + d.id;
    })
    .style("text-anchor", "start")
    .attr('startOffset', '80%')
    .attr("class", function (d) {
      return "flow_" + d.id;
    })
    .text(function (d) {
      return d.flow;
    });

  // remove old links and their text
  path.exit().remove();
  path_text.exit().remove();

  // circle (node) group
  circle = circle.data(nodes, function (d) {
    return d.id;
  });

  // update existing nodes (visual states)
  circle.selectAll('circle')
    .style('fill', function (d) {
      return colors(d.id);
    })
    .style('stroke', function (d) { // sink and source are black
      if (d === graph.source || d === graph.sink) {
        return d3.rgb('black');
      } else {
        return d3.rgb(colors(d.id)).darker().toString();
      }
    })
    .style('stroke-dasharray', function (d) { // sink has dashed border
      if (d === graph.sink) {
        return '5, 3';
      }
    });

  // add new nodes
  let g = circle.enter().append('svg:g');

  g.append('svg:circle')
    .attr('class', 'node')
    .attr('r', 20)
    .style('fill', function (d) {
      return colors(d.id);
    })
    .style('stroke', function (d) { // sink and source are black
      if (d === graph.source || d === graph.sink) {
        return d3.rgb('black');
      } else {
        return d3.rgb(colors(d.id)).darker().toString();
      }
    })
    .style('stroke-dasharray', function (d) { // sink has dashed border
      if (d === graph.sink) {
        return '5, 3';
      }
    })
    .on('mousedown', function (d) {
      mousedown_node = d;

      // reposition drag line
      drag_line
        .style('marker-end', 'url(#end-arrow)')
        .style('display', 'inline')
        .attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);

      restart();
    })
    .on('mouseup', function (d) {
      if (!mousedown_node) {
        return;
      }
      mouseup_node = d;
      drag_line
        .style('display', 'none')
        .style('marker-end', '');

      // cannot drag to self
      if (mousedown_node === mouseup_node) {
        resetMouseVars();
        return;
      }
      // Edge always drawn pointing from source to target
      let edge = new Edge(mousedown_node, mouseup_node);
      graph.addEdge(edge);

      resetMouseVars();
      restart();
    })
    .on('contextmenu', d3ContextMenu(function () {
      let selected_node = mousedown_node; // Grab node before hideDragLine resets it
      context_menu_open = true;
      hideDragLine();
      function postAction() {
        context_menu_open = false;
        restart();
      }

      return [
        {
          title: 'Remove vertex',
          action: function () {
            graph.removeVertex(selected_node);
            postAction();
          }
        },
        {
          title: 'Set as source',
          action: function () {
            graph.setSource(selected_node);
            postAction();
          }
        },
        {
          title: 'Set as sink',
          action: function () {
            graph.setSink(selected_node);
            postAction();
          }
        }
      ]
    }));

  // show node IDs
  g.append('svg:text')
    .attr('x', 0)
    .attr('y', 4)
    .attr('class', 'id')
    .text(function (d) {
      return d.id;
    });

  // remove old nodes
  circle.exit().remove();

  // set the graph in motion
  force.start();
}

function addNewNode() {
  if (mousedown_node || context_menu_open || mousedown_link) {
    context_menu_open = false;
    return;
  }

  svg.classed('active', true);

  let position = d3.mouse(this);
  let id = nodes.length;
  let vertex = new Vertex(next_vertex_id++);
  graph.addVertex(vertex);

  nodes[id].x = position[0];
  nodes[id].y = position[1];

  restart();
}

function updateDragLine() {
  if (!mousedown_node) {
    return;
  }

  drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);

  restart();
}

function hideDragLine() {
  if (mousedown_node) {
    drag_line
      .style('display', 'none')
      .style('marker-end', '');
  }
  svg.classed('active', false);
  resetMouseVars();
}

function keydown() {
  if (!selected_link) {
    return;
  }

  d3.event.preventDefault();

  let key_code = d3.event.keyCode;

  if (13 === key_code || 27 === key_code) { // enter or escape
    entered_capacity_val = "";
    selected_link = null;
    restart();
  } else if (key_code > 47 && key_code < 58) { // numeric value
    updateCapacityVal(key_code - 48);
  }
}

// updates the capacity of an edge
function updateCapacityVal(i) {
  if (selected_link) {
    entered_capacity_val += i;
    d3.select('.capacity_' + selected_link.id).text(entered_capacity_val);
    selected_link.capacity = parseInt(entered_capacity_val);
    restart();
  }
}

function calcMaxFlow() {
  graph.edmondsKarp();
  console.log(graph.max_flow);

  // edge capacities must be reset, or will be increased by updateCapacityVal
  graph.edges.map(function (e) {
    e.resetFlow();
  });
}

// mouse event handlers
svg.on('mousedown', addNewNode);
svg.on('mousemove', updateDragLine);
svg.on('mouseup', hideDragLine);

// keyboard event handlers
d3.select(window)
  .on('keydown', keydown);

// Button causes maximum flow to be calculated
d3.select('#calcMaxFlow').on('click', calcMaxFlow);

restart();