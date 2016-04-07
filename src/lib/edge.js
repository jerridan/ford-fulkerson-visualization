class Edge {
  constructor(source, target, capacity) {
    if (0 === arguments.length) {
      this.source = null;
      this.target = null;
    } else {
      this.source = source;
      this.target = target;
    }
    if (3 === arguments.length) {
      this.capacity = capacity;
    } else {
      this.capacity = 0;
    }
    this.flow = 0;
    this.inFlowPath = false;
  }

  addFlow(flow) {
    if (this.capacity < flow) {
      throw new Error("Not enough capacity for that flow");
    }
    this.capacity -= flow;
    this.flow += flow;
    this.inFlowPath = true;
  }

  resetFlow() {
    this.capacity += this.flow;
    this.flow = 0;
    this.inFlowPath = false;
  }
}

export default Edge;