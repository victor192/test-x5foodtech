import { requests } from './data/requests';
import { buildRequestsGraph, getResponse } from './utils/requests';

async function main() {
  try {
    const requestsGraph = buildRequestsGraph(requests);
    const nodes = requestsGraph.getNodes();

    nodes.forEach((node, name) => {
      const adjacents = node.getAdjacents();

      console.log(`Request: ${name} dependencies: [${adjacents.map((adjecent) => {
        const request = adjecent.getData();

        return request.name;
      }).join(', ')}]`);
    });

    const response = await getResponse(requestsGraph, { id: 'id' });

    console.log(response);
  } catch (e) {
    console.error(e);
  }
}

main();
