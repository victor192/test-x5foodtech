import { InputRequest } from '../interfaces/input-request.interface';
import {
  RequestsNodeInputParams,
} from './interfaces/requests-node-input-params.interface';

export class RequestsNode {
    private readonly value: string;

    private readonly data: InputRequest;

    private readonly inputParams: RequestsNodeInputParams;

    private readonly adjacents: RequestsNode[];

    constructor(value: string, data: InputRequest) {
      this.value = value;
      this.data = data;
      this.adjacents = [];
      this.inputParams = {};
      // this.depententParams = {};
    }

    addAdjacent(node: RequestsNode) {
      this.adjacents.push(node);
    }

    removeAdjacent(node: RequestsNode): RequestsNode | boolean {
      const index = this.adjacents.indexOf(node);

      if (index > -1) {
        this.adjacents.splice(index, 1);

        return node;
      }

      return false;
    }

    getAdjacents() {
      return this.adjacents;
    }

    isAdjacent(node: RequestsNode) {
      return this.adjacents.indexOf(node) > -1;
    }

    getData() {
      return this.data;
    }

    addInputParam(param: string, value: string) {
      this.inputParams[param] = value;
    }

    getInputParams() {
      return this.inputParams;
    }
}
