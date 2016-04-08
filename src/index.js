import d3 from 'd3';

import Vertex from './lib/vertex';
import Edge from './lib/edge';
import Graph from './lib/graph';

import sample_graph from './lib/sample_graph';

// set up SVG for D3
let width = 960,
  height = 500,
  colors = d3.scale.category10();

var svg = d3.select('body')
  .append('svg')
  .attr('oncontextmenu', 'return false;')
  .attr('width', width)
  .attr('height', height);

let graph = sample_graph;

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
  .linkDistance(150)
  .charge(-500)
  .on('tick', tick);

// define arrow markers for graph links
svg.append('svg:defs').append('svg:marker')
  .attr('id', 'end-arrow')
  .attr('viewBox', '0 -5 10 10')
  .attr('refX', 6)
  .attr('markerWidth', 3)
  .attr('markerHeight', 3)
  .attr('orient', 'auto')
  .append('svg:path')
  .attr('d', 'M0,-5L10,0L0,5')
  .attr('fill', '#000');

svg.append('svg:defs').append('svg:marker')
  .attr('id', 'start-arrow')
  .attr('viewBox', '0 -5 10 10')
  .attr('refX', 4)
  .attr('markerWidth', 3)
  .attr('markerHeight', 3)
  .attr('orient', 'auto')
  .append('svg:path')
  .attr('d', 'M10,-5L0,0L10,5')
  .attr('fill', '#000');

let drag_line = svg.append('svg:path')
  .attr('class', 'link dragline')
  .style('display', 'none')
  .attr('d', 'M0,0L0,0');

// handles to link and node element groups
let path = svg.append('svg:g').selectAll('path'),
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
    return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
  });

  circle.attr('transform', function (d) {
    return 'translate(' + d.x + ',' + d.y + ')';
  });
}

// mouse event variables
let mousedown_node = null;
let mouseup_node = null;

function resetMouseVars() {
  mousedown_node = null;
  mouseup_node = null;
}

// update graph (called when needed)
function restart() {

  path = path.data(links, function (d) {
    return d.id;
  });

  let linkGroups = path.enter().append('svg:g');

  linkGroups.append('svg:text')
    .style('font-size', "12px")
    .attr("dy", "-8px")
    .attr("dx", "5px")
    .append('svg:textPath')
    .attr('xlink:href', function (d) {
      return '#link_id_' + d.id;
    })
    .style("text-anchor", "start")
    .attr('startOffset', '0%')
    .attr("class", function (d) {
      return "capacity_forward_" + d.id;
    })
    .text(function (d) {
      return d.capacity;
    });

  // add new links
  path.enter().append('svg:path')
    .attr('class', 'link')
    .attr('id', function (d) {
      return 'link_id_' + d.id;
    })
    .style('marker-start', '')
    .style('marker-end', 'url(#end-arrow)');

  // remove old links
  path.exit().remove();

  // circle (node) group
  circle = circle.data(nodes, function (d) {
    return d.id;
  });

  // update existing nodes (visual states)
  circle.selectAll('circle')
    .style('fill', function (d) {
      return colors(d.id);
    });

  // add new nodes
  let g = circle.enter().append('svg:g');

  g.append('svg:circle')
    .attr('class', 'node')
    .attr('r', 12)
    .style('fill', function (d) {
      return colors(d.id);
    })
    .style('stroke', function (d) {
      return d3.rgb(colors(d.id)).darker().toString();
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
    });

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
  if (mousedown_node) {
    return;
  }

  svg.classed('active', true);

  let position = d3.mouse(this);
  let id = nodes.length;
  let vertex = new Vertex(id);
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

svg.on('mousedown', addNewNode);
svg.on('mousemove', updateDragLine);
svg.on('mouseup', hideDragLine);

restart();