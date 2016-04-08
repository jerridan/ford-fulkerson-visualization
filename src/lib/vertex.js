class Vertex {
  constructor(id) {
    this.id = id;
    this.visited = false;
    this.pre = null;
  }

  toJSON() {
    return {id: this.id};
  }
}

export default Vertex