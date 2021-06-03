import { requests } from './data/requests';
import { buildRequestsGraph, buildRequestsDependencies, getResponse } from './utils/requests';

async function main() {
  try {
    const requestsGraph = buildRequestsGraph(requests);
    const requestsDependencies = buildRequestsDependencies(requestsGraph);

    console.log(requestsDependencies);

    const response = await getResponse(requestsGraph, { id: 'id' });

    console.log(response);
  } catch (e) {
    console.error(e);
  }
}

main();
