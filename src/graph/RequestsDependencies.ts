import { RequestDependencies } from './interfaces/request-dependencies.interface';
import { InputRequest } from '../interfaces/input-request.interface';

export class RequestsDependencies {
    private readonly requests: Map<string, RequestDependencies>

    constructor() {
      this.requests = new Map();
    }

    addRequest(name: string, request: InputRequest) {
      if (!this.requests.has(name)) {
        this.requests.set(name, { request, dependencies: [] });
      }
    }

    addDependency(name: string, request: InputRequest) {
      if (this.requests.has(name)) {
        const requestDependency = this.requests.get(name)!;

        requestDependency.dependencies.push(request);

        this.requests.set(name, requestDependency);
      }
    }
}
