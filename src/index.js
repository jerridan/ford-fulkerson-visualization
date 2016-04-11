import d3 from 'd3';
import d3ContextMenu from './lib/d3_context_menu';

import Vertex from './lib/vertex';
import Edge from './lib/edge';
import Graph from './lib/graph';

import sample_graph from './lib/sample_graph';

// algorithm can be: EK, DFS, FP
let chosen_algorithm = 'EK';

// set up SVG for D3
let width = 960,
  height = 700,
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

// drag behavior for moving vertices around
let drag = d3.behavior.drag()
  .origin(function (d) {
    return d;
  })
  .on('dragstart', function (d) {
    if (shift_mode) {
      force.stop();
      d.fixed = false;
    }
  })
  .on('drag', function (d) {
    if (shift_mode) {
      let position = d3.mouse(this);
      d.x += position[0];
      d.y += position[1];
      d.px += position[0];
      d.py += position[1];
      tick();
    }
  })
  .on('dragend', function (d) {
    if (shift_mode) {
      d.fixed = true;
      force.resume();
    }
  });

// define arrow markers for graph links
svg.append('svg:defs').append('svg:marker')
  .attr('id', 'end-arrow')
  .attr('class', 'link-arrow')
  .attr('viewBox', '0 -5 10 10')
  .attr('refX', 11)
  .attr('markerWidth', 3)
  .attr('markerHeight', 3)
  .attr('orient', 'auto')
  .append('svg:path')
  .attr('d', 'M0,-5L10,0L0,5');

// define arrow markers for graph links
svg.append('svg:defs').append('svg:marker')
  .attr('id', 'arc-end-arrow')
  .attr('class', 'link-arrow')
  .attr('viewBox', '0 -5 10 10')
  .attr('refX', 25)
  .attr('refY', -1)
  .attr('markerWidth', 3)
  .attr('markerHeight', 3)
  .attr('orient', 'auto')
  .append('svg:path')
  .attr('d', 'M0,-5L10,0L0,5');

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
    if (d.has_evil_twin) {
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

let context_menu_open = false; // when right-click menu for vertex is open
let selected_link = null;      // when an edge is selected
let entered_capacity_val = ""; // the new capacity entered for an edge
let shift_mode = false;        // when 'shift' is held down

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
        return d.has_evil_twin ? 'url(#arc-end-arrow)' : 'url(#end-arrow)';
      }
    });

  // add new links
  path.enter().append('svg:path')
    .attr('class', 'link')
    .attr('id', function (d) {
      return 'link_id_' + d.id;
    })
    .style('marker-end', function (d) {
      return d.has_evil_twin ? 'url(#arc-end-arrow)' : 'url(#end-arrow)';
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

  // update capacity text
  d3.selectAll('.capacity-text')
    .attr("dy", "-8px")
    .attr("dx", function (d) {
      return d.has_evil_twin ? "65px" : "50px";
    });

  // update flow text
  d3.selectAll('.flow-text')
    .attr("dy", "-8px")
    .attr("dx", function (d) {
      return d.has_evil_twin ? "-75px" : "-55px";
    });

  let link_text = path_text.enter()
    .append('g')
    .attr('class', 'link-text');

  // Show capacity for each link
  link_text
    .append('svg:text')
    .attr('class', 'capacity-text')
    .style('font-size', "12px")
    .attr('fill', '#FF9800')
    .attr("dy", "-8px")
    .attr("dx", function (d) {
      return d.has_evil_twin ? "65px" : "50px";
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
    .attr('fill', '#2196F3')
    .attr("dy", "-8px")
    .attr("dx", function (d) {
      return d.has_evil_twin ? "-75px" : "-55px";
    })
    .append('svg:textPath')
    .attr('xlink:href', function (d) {
      return '#link_id_' + d.id;
    })
    .style("text-anchor", "start")
    .attr('startOffset', '100%')
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
    .style('stroke-width', function(d) { // make stroke of source and sink wider
      if (d === graph.source || d === graph.sink) {
        return '3px';
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
    .style('stroke-width', function(d) { // make stroke of source and sink wider
      if (d === graph.source || d === graph.sink) {
        return '3px';
      }
    })
    .style('stroke-dasharray', function (d) { // sink has dashed border
      if (d === graph.sink) {
        return '5, 3';
      }
    })
    .on('mousedown', function (d) {
      mousedown_node = d;

      if (!shift_mode) {
        // reposition drag line
        drag_line
          .style('marker-end', 'url(#end-arrow)')
          .style('display', 'inline')
          .attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);
        restart();
      }
    })
    .on('mouseup', function (d) {
      if (!mousedown_node || shift_mode) {
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
      // Grab node before hideDragLine resets it
      let selected_node = mousedown_node;
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
    }))
    .call(drag);

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
  if (!mousedown_node || shift_mode) {
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
  d3.event.preventDefault();

  let key_code = d3.event.keyCode;

  if (selected_link && (13 === key_code || 27 === key_code)) { // enter or escape
    entered_capacity_val = "";
    selected_link = null;
    restart();
  } else if (selected_link && (key_code > 47 && key_code < 58)) { // numeric value
    updateCapacityVal(key_code - 48);
  } else if (16 === key_code) {
    shift_mode = true;
  }
}

function keyup() {
  let key_code = d3.event.keyCode;

  if (16 === key_code) { // shift
    shift_mode = false;
  }
}

// updates the capacity of an edge
function updateCapacityVal(i) {
  if (graph.max_flow > 0) {
    graph.max_flow = 0;
    graph.edges.map(function (e) {
      e.resetFlow();
    });
  }
  if (selected_link) {
    entered_capacity_val += i;
    d3.select('.capacity_' + selected_link.id).text(entered_capacity_val);
    selected_link.capacity = parseInt(entered_capacity_val);
    restart();
  }
}

function calcMaxFlow() {
  edmondsKarp();
}

function edmondsKarp() {
  resetFlowAmounts();

  // disable buttons during calculation
  d3.select('#calc-max-flow-btn')
    .attr('disabled', 'disabled');
  d3.select('#reset-flow-btn')
    .attr('disabled', 'disabled');

  let saved_info = {};
  saved_info.flow_increases = [];
  saved_info.augmenting_paths = [];
  let flow_increase = 0;

  let interval_id = setInterval(function () {

    // unhighlight augmented path
    graph.edges.map(function (edge) {
      d3.select('#link_id_' + edge.id)
        .classed('augmented', false);
    });

    // use chosen algorithm to get flow increase
    // along augmenting path
    try {
      if ('EK' === chosen_algorithm) {
        flow_increase = graph.bfs();
      } else if ('DFS' === chosen_algorithm) {
        flow_increase = graph.dfs();
      } else {
        flow_increase = graph.fattestPath();
      }
    } catch (err) {
      flow_increase = 0;
    }

    // highlight augmented path
    graph.flow_path.map(function (edge) {
      d3.select('.capacity_' + edge.id)
        .text(edge.capacity);
      d3.select('.flow_' + edge.id)
        .text(edge.flow);
      d3.select('#link_id_' + edge.id)
        .classed('augmented', true);
    });

    // clone flow path and save result
    saved_info.augmenting_paths.push(_.map(graph.flow_path, _.clone));
    saved_info.flow_increases.push(flow_increase);

    graph.flow_path = [];

    // display new max flow amount
    d3.select('#max-flow-amount').text(graph.max_flow);

    // if no further augmenting paths, stop searching
    if (flow_increase === 0) {
      clearInterval(interval_id);
      graph.flow_path = [];

      // display number of iterations it took to find flow
      d3.select('#number-iterations').text(saved_info.augmenting_paths.length - 1);

      // display saved info
      displaySavedInfo(saved_info);

      // enable buttons again
      d3.select('#calc-max-flow-btn')
        .attr('disabled', null);
      d3.select('#reset-flow-btn')
        .attr('disabled', null);

      _.flatten(saved_info.augmenting_paths).map(function (edge) {
        d3.select('#link_id_' + edge.id)
          .classed('augmented', false)
          .classed('has-flow', true);
      });
      restart();
    }
  }, 1000);
}

function displaySavedInfo(saved_info) {

  let augmenting_paths_text = "<div class='info'>Augmenting Paths:</div><ul>";

  saved_info.augmenting_paths.map(function (path, index) {
    if (index === saved_info.augmenting_paths.length - 1) {
      return;
    }
    augmenting_paths_text += ("<li>Path " + (index + 1));
    augmenting_paths_text += ("<ul>Flow Increase: " + saved_info.flow_increases[index] + "</ul>");
    path.map(function (edge) {
      augmenting_paths_text += ("<ul>");
      augmenting_paths_text += ("<li>Source: " + edge.source.id + "</li>");
      augmenting_paths_text += ("<li>Target: " + edge.target.id + "</li>");
      augmenting_paths_text += ("<li>Total Flow: " + edge.flow + "</li>");
      augmenting_paths_text += ("<li>Remaining capacity: " + edge.capacity + "</li>");
      augmenting_paths_text += "</ul>";
    });
    augmenting_paths_text += "</li>"
  });
  augmenting_paths_text += "</ul>";

  d3.select('#augmenting-paths').html(augmenting_paths_text);
}

function resetFlowAmounts() {
  graph.max_flow = 0;
  graph.edges.map(function (edge) {
    edge.resetFlow();
    d3.select('.capacity_' + edge.id)
      .text(edge.capacity);
    d3.select('.flow_' + edge.id)
      .text(edge.flow);
    d3.select('#link_id_' + edge.id)
      .classed('has-flow', false);
  });
  d3.select('#max-flow-amount').text('0');
  d3.select('#number-iterations').text('0');
  d3.select('#augmenting-paths').text('');
}

function eraseGraph() {
  graph = new Graph();
  next_vertex_id = 0;

  nodes = graph.vertices;
  links = graph.edges;

  // Source and target of each link must reference node array
  links.map(function (link) {
    link.source = nodes[link.source.id];
    link.target = nodes[link.target.id];
  });

  force.stop();
  force = d3.layout.force()
    .nodes(nodes)
    .links(links)
    .size([width, height])
    .linkDistance(250)
    .charge(-500)
    .on('tick', tick);
  force.start();

  restart();
}

function setEdmondsKarp() {
  chosen_algorithm = 'EK';

  d3.select('#edmonds-karp-select')
    .classed('checked', true);

  d3.select('#dfs-select')
    .classed('checked', false);

  d3.select('#fattest-path-select')
    .classed('checked', false);
}

function setDFS() {
  chosen_algorithm = 'DFS';

  d3.select('#edmonds-karp-select')
    .classed('checked', false);

  d3.select('#dfs-select')
    .classed('checked', true);

  d3.select('#fattest-path-select')
    .classed('checked', false);
}

function setFattestPath() {
  chosen_algorithm = 'FP';

  d3.select('#edmonds-karp-select')
    .classed('checked', false);

  d3.select('#dfs-select')
    .classed('checked', false);

  d3.select('#fattest-path-select')
    .classed('checked', true);
}

// mouse event handlers
svg.on('mousedown', addNewNode);
svg.on('mousemove', updateDragLine);
svg.on('mouseup', hideDragLine);

// keyboard event handlers
d3.select(window)
  .on('keydown', keydown)
  .on('keyup', keyup);

d3.select('#calc-max-flow-btn').on('click', calcMaxFlow);
d3.select('#reset-flow-btn').on('click', resetFlowAmounts);
d3.select('#erase-graph-btn').on('click', eraseGraph);
//d3.select('.algorithms').selectAll('.radio').on('click', setAlgorithm());

d3.select('#edmonds-karp-select')
  .on('click', setEdmondsKarp)
  .classed('checked', true);
d3.select('#dfs-select').on('click', setDFS);
d3.select('#fattest-path-select').on('click', setFattestPath);

restart();