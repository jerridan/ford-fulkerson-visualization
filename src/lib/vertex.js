class Vertex {
  constructor(id) {
    this.id = id;
    this.visited = false;
    this.pre = null;
    this.fat = 0;
  }

  toJSON() {
    return {id: this.id};
  }
}

export default Vertex