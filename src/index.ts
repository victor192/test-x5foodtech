import { requests } from './data/requests';
import { buildRequestsGraph, buildRequestsDependencies, getResponse } from './utils/requests';

async function main() {
  try {
    const requestsGraph = buildRequestsGraph(requests);
    const requestsDependencies = buildRequestsDependencies(requestsGraph);

    const dependencies = requestsDependencies.getRequests();

    dependencies.forEach((depencency) => {
      console.log(`Request: ${depencency.request.name} dependencies: [${depencency.dependencies.map((request) => request.name).join(', ')}]`);
    });

    const response = await getResponse(requestsGraph, { id: 'id' });

    console.log(response);
  } catch (e) {
    console.error(e);
  }
}

main();
