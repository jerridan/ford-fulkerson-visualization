import {expect} from 'chai';
import Vertex from './../vertex';

describe('vertex', function() {
  describe('#visited', function() {
    it('should return false for an unvisited vertex', function() {
      let vertex = new Vertex(0);
      expect(vertex.visited).to.be.false;
    });
    it('should return true for a visited vertex', function() {
      let vertex = new Vertex(0);
      vertex.visited = true;
      expect(vertex.visited).to.be.true;
    });
  });
});