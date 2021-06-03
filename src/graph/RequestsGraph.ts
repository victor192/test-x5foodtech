import { InputRequest } from '../interfaces/input-request.interface';
import { RequestsNodePayload } from './interfaces/requests-node-payload.interface';
import { RequestsNode } from './RequestsNode';

export class RequestsGraph {
    private readonly nodes: Map<string, RequestsNode>;

    constructor() {
      this.nodes = new Map();
    }

    addVertex(value: string, data: InputRequest): RequestsNode {
      if (this.nodes.has(value)) {
        return this.nodes.get(value)!;
      }

      const vertex = new RequestsNode(value, data);

      this.nodes.set(value, vertex);

      return vertex;
    }

    addEdge(
      { value: sourceValue, data: sourceData }: RequestsNodePayload,
      { value: destinationValue, data: destinationData }: RequestsNodePayload,
    ) {
      const sourceNode = this.addVertex(sourceValue, sourceData);
      const destinationNode = this.addVertex(destinationValue, destinationData);

      sourceNode.addAdjacent(destinationNode);

      return [sourceNode, destinationNode];
    }

    isVertex(value: string) {
      return this.nodes.has(value);
    }

    getVertex(value: string) {
      return this.nodes.get(value);
    }

    getNodes() {
      return this.nodes;
    }
}
