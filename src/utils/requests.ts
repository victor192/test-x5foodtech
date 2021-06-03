import { AsyncAutoTasks, auto } from 'async';
import axios, { AxiosRequestConfig } from 'axios';
import { isOfTypeHttpMethod, InputRequest, InputRequestParams } from '../interfaces/input-request.interface';
import { RequestsGraph } from '../graph/RequestsGraph';
import { RequestsNode } from '../graph/RequestsNode';
import { RequestsDependencies } from '../graph/RequestsDependencies';

export const buildRequestsGraph = (requests: InputRequest[]): RequestsGraph => {
  const requestsGraph = new RequestsGraph();

  requests.forEach((request) => {
    const { name, method, params } = request;

    if (requestsGraph.isVertex(name)) {
      throw new Error(`${name}: Request with this name already exists`);
    } else if (!isOfTypeHttpMethod(method)) {
      throw new Error(`${name}: Invalid http method`);
    }

    const node = requestsGraph.addVertex(name, request);

    Object.keys(params).forEach((param) => {
      const paramValue = params[param];
      const parts = paramValue.split('.');

      if (parts.length > 2) {
        throw new Error(`${name}: Invalid value of param '${paramValue}'`);
      } else if (parts.length === 2) {
        const relatedValue = parts[0];
        const relatedParam = parts[1];
        const relatedNode = requestsGraph.getVertex(relatedValue);

        if (!relatedNode) {
          throw new Error(`${name}: For param '${paramValue}' does not exists node '${relatedValue}'`);
        }

        const relatedData = relatedNode.getData();
        const relatedInputParams = relatedNode.getInputParams();
        const relatedInputParam = relatedInputParams[relatedParam];

        if (!relatedInputParam) {
          throw new Error(`${name}: Param '${relatedParam}' does not exists in node '${relatedValue}'`);
        }

        requestsGraph.addEdge(
          { value: relatedValue, data: relatedData },
          { value: name, data: request },
        );

        node.addInputParam(relatedParam, relatedInputParam);
      } else {
        node.addInputParam(param, paramValue);
      }
    });
  });

  return requestsGraph;
};

const buildRequestDependencies = (
  requestsDependencies: RequestsDependencies,
  parentNode: RequestsNode,
  currentNode: RequestsNode,
) => {
  const currentRequest = currentNode.getData();
  const { name: currentName } = currentRequest;

  requestsDependencies.addRequest(currentName, currentRequest);

  const parentRequest = parentNode.getData();
  const { name: parentName } = parentRequest;

  requestsDependencies.addDependency(parentName, currentRequest);

  const adjacents = currentNode.getAdjacents();

  adjacents.forEach((node) => {
    buildRequestDependencies(requestsDependencies, currentNode, node);
  });
};

export const buildRequestsDependencies = (requestsGraph: RequestsGraph): RequestsDependencies => {
  const nodes = requestsGraph.getNodes();
  const requestsDependencies = new RequestsDependencies();

  nodes.forEach((node, value) => {
    const request = node.getData();
    const adjacents = node.getAdjacents();

    requestsDependencies.addRequest(value, request);

    adjacents.forEach((childNode) => {
      buildRequestDependencies(requestsDependencies, node, childNode);
    });
  });

  return requestsDependencies;
};

export const getResponse = async (
  requestsGraph: RequestsGraph,
  inputParamsObject: InputRequestParams,
) => {
  const nodes = requestsGraph.getNodes();
  const tasks = {} as AsyncAutoTasks<any, Error>;

  nodes.forEach((node) => {
    const request = node.getData();
    const { important } = request;
    const inputParams = node.getInputParams();
    const requestParams = {} as InputRequestParams;

    Object.keys(inputParams).forEach((param) => {
      if (!inputParamsObject[param] && important) {
        throw new Error(`Invalid param '${param}'`);
      } else if (!important) {
        requestParams[param] = inputParamsObject[param];
      }

      const { name, url, method } = request;

      tasks[name] = (callback) => {
        const axiosRequestConfig = {
          url,
          method,
          validateStatus: (status) => status === 200,
        } as AxiosRequestConfig;

        if (method === 'GET') {
          axiosRequestConfig.params = requestParams;
        } else if (['POST', 'PUT'].includes(method)) {
          axiosRequestConfig.data = requestParams;
        }

        axios(axiosRequestConfig).then((response) => {
          callback(null, response.data);
        }).catch((error) => {
          if (important) {
            callback(error, null);
          } else {
            callback(null, {});
          }
        });
      };
    });
  });

  return new Promise((resolve, reject) => {
    auto(tasks, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};
