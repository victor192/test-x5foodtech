import { AsyncAutoTasks, auto } from 'async';
import axios, { AxiosRequestConfig } from 'axios';
import { isOfTypeHttpMethod, InputRequest, InputRequestParams } from '../interfaces/input-request.interface';
import { RequestsGraph } from '../graph/RequestsGraph';

export const buildRequestsGraph = (requests: InputRequest[]): RequestsGraph => {
  const requestsGraph = new RequestsGraph();

  requests.forEach((request, index) => {
    const { name, method, params } = request;

    if (requestsGraph.isVertex(name)) {
      throw new Error(`${name}: Request with this name already exists`);
    } else if (!isOfTypeHttpMethod(method)) {
      throw new Error(`${name}: Invalid http method`);
    }

    const node = requestsGraph.addVertex(name, request);
    let relatedParamsCount = 0;

    Object.keys(params).forEach((param) => {
      const paramValue = params[param];
      const parts = paramValue.split('.');

      if (parts.length > 2) {
        throw new Error(`${name}: Invalid value of param '${paramValue}'`);
      } else if (parts.length === 2) {
        relatedParamsCount += 1;

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
          { value: name, data: request },
          { value: relatedValue, data: relatedData },
        );

        node.addInputParam(param, relatedInputParam);
      } else {
        node.addInputParam(param, paramValue);
      }
    });

    if (index !== 0 && relatedParamsCount === 0) {
      throw new Error(`${name}: Node is not connected`);
    }
  });

  return requestsGraph;
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
      const inputParam = inputParams[param];

      if (!inputParamsObject[inputParam] && important) {
        throw new Error(`Invalid param '${inputParam}'`);
      } else if (!important) {
        requestParams[param] = inputParamsObject[inputParam];
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
