import {expect} from 'chai';
import Edge from '../edge';
import Vertex from '../vertex';

describe('edge', function () {
  it('should have null source and target if no parameters are passed into constructor', function() {
    let edge = new Edge();
    expect(edge.source).to.be.null;
    expect(edge.target).to.be.null;
  });
  it('should have set the source and target if parameters are passed into constructor', function() {
    let v1 = new Vertex(0);
    let v2 = new Vertex(1);
    let edge = new Edge(v1, v2);
    expect(edge.source).to.eql(v1);
    expect(edge.target).to.eql(v2);
  });
  describe('#addFlow', function () {
    it('should throw an error if there is not enough capacity', function () {
      let edge = new Edge();
      try {
        edge.addFlow(10);
        expect(true).to.be.false;
      } catch (err) {
        expect(err).to.eql(new Error("Not enough capacity for that flow"));
      }
    });
    it('should decrease the capacity by an equal amount', function () {
      let edge = new Edge();
      edge.capacity = 10;
      edge.addFlow(10);
      expect(edge.capacity).to.eql(0);
    });
    it('should increase the flow by an equal amount', function () {
      let edge = new Edge();
      edge.capacity = 10;
      edge.addFlow(10);
      expect(edge.flow).to.eql(10);
    });
    it('should put the edge in the flow path', function () {
      let edge = new Edge();
      edge.capacity = 10;
      edge.addFlow(10);
      expect(edge.inFlowPath).to.be.true;
    });
  });
  describe('#resetFlow', function() {
    it('removes all flow from an edge and restores capacity', function() {
      let edge = new Edge();
      edge.capacity = 10;
      edge.addFlow(10);
      expect(edge.flow).to.eql(10);
      expect(edge.capacity).to.eql(0);
      expect(edge.inFlowPath).to.be.true;
      edge.resetFlow();
      expect(edge.flow).to.eql(0);
      expect(edge.capacity).to.eql(10);
      expect(edge.inFlowPath).to.be.false;
    });
  });
});