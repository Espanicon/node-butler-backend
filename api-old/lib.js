const httpsRequest = require("./httpsRequest.js");
const httpRequest = require("./httpRequest.js");

const GLOBAL = {
  node: {
    ctz: "ctz.solidwallet.io",
    geometry: "api.icon.geometry.io",
    tracker: "tracker.icon.community",
    localhost: "localhost",
    espanicon: "api.espanicon.team"
  },
  // TODO: fix the nginx webserver to also allow /api/v1
  routes: {
    v3: "/api/v3",
    proposals: "/api/v1/governance/proposals"
  },
  param: {
    headers: {
      "content-type": "text/plain",
      charset: "UTF-8"
    }
  },
  scores: {
    main: "cx0000000000000000000000000000000000000000",
    cps: "cx9f4ab72f854d3ccdc59aa6f2c3e2215dd62e879f",
    network: "cx0000000000000000000000000000000000000001"
  }
};

const HTTP_HOSTNAME = GLOBAL.node.localhost;
const HTTPS_HOSTNAME = GLOBAL.node.espanicon;

async function customRequest(route, data, hostname, requestCallback) {
  try {
    let params = {
      hostname: hostname,
      path: route,
      method: data ? "POST" : "GET",
      ...GLOBAL.param
    };

    const request = await requestCallback(params, data);
    // return JSON.parse(request);
    return request;
  } catch (err) {
    console.log("error running customHttpsRequest");
    console.log(err);
    return null;
  }
}

async function customHttpsRequest(route, data = false) {
  customRequest(route, data, HTTPS_HOSTNAME, httpsRequest);
}

async function customHttpRequest(route, data = false) {
  customRequest(route, data, HTTP_HOSTNAME, httpRequest);
}

function makeJSONRPCRequestObject(method) {
  //
  return {
    jsonrpc: "2.0",
    method: method,
    id: Math.ceil(Math.random() * 1000)
  };
}

function makeICXCallRequestObject(
  method,
  params = null,
  height = null,
  to = GLOBAL.scores.main
) {
  const JSONRPCRequestObject = makeJSONRPCRequestObject("icx_call");
  let data = {
    ...JSONRPCRequestObject,
    params: {
      to: to,
      dataType: "call",
      data: {
        method: method
      }
    }
  };

  if (params === null) {
  } else {
    data.params.data.params = params;
  }

  if (height === null) {
  } else {
    if (typeof height !== "number") {
      throw new Error("height type must be number");
    } else {
      data.params.height = "0x" + height.toString(16);
    }
  }
  return JSON.stringify(data);
}

async function getProposals(requestCallback = customHttpsRequest) {
  const JSONRPCObject = makeICXCallRequestObject(
    "getProposals",
    null,
    null,
    GLOBAL.scores.network
  );

  const request = await requestCallback(GLOBAL.routes.v3, JSONRPCObject);
  return request.result.proposals;

  // try {
  //   const parsedRequest = JSON.parse(request);
  //   return parsedRequest.result.proposals
  // } catch (err) {
  //   console.log("error on getPreps request response");
  //   console.log(`response: ${request}.`);
  //   console.error(err);
  //   return [];
  // }
}

async function getScoreApi(
  address = GLOBAL.scores.main,
  requestCallback = customHttpsRequest
) {
  //
  try {
    const postData = JSON.stringify({
      ...makeJSONRPCRequestObject("icx_getScoreApi"),
      params: {
        address: address
      }
    });

    const response = await requestCallback(GLOBAL.routes.v3, postData);
    // const parsedResponse = JSON.parse(response);
    return response.result;
  } catch (err) {
    console.log("error running customHttpsRequest");
    console.log(err);
    return null;
  }
}
async function getLastBlock(requestCallback = customHttpsRequest) {
  try {
    const postData = JSON.stringify(
      makeJSONRPCRequestObject("icx_getLastBlock")
    );

    const response = await requestCallback(GLOBAL.routes.v3, postData);
    // console.log(response);
    // const parsedResponse = JSON.parse(response);
    return response.result.height;
  } catch (err) {
    console.log("error running customHttpsRequest");
    console.log(err);
    return null;
  }
}

async function getBonderList(prep) {
  const postData = makeICXCallRequestObject("getBonderList", { address: prep });
  const request = await requestCallback(GLOBAL.routes.v3, postData);
  return request.result;
}

async function getProposalKeysByStatus(
  status,
  requestCallback = customHttpsRequest
) {
  //
  const statusType = [
    "_active",
    "_completed",
    "_disqualified",
    "_paused",
    "_pending"
  ];

  if (statusType.includes(status)) {
    const JSONRPCObject = makeICXCallRequestObject(
      "get_proposals_keys_by_status",
      { _status: status },
      null,
      GLOBAL.scores.cps
    );

    const request = await requestCallback(GLOBAL.routes.v3, JSONRPCObject);
    return request.result;
  } else {
    return null;
  }
}

async function getProposalDetailsByHash(
  hash,
  requestCallback = customHttpsRequest
) {
  //
  const JSONRPCObject = makeICXCallRequestObject(
    "get_proposals_details_by_hash",
    { _ipfs_key: hash },
    null,
    GLOBAL.scores.cps
  );

  const request = await requestCallback(GLOBAL.routes.v3, JSONRPCObject);
  return request.result;
}

async function getAllCPSProposals(requestCallback = customHttpsRequest) {
  const statusType = [
    "_active",
    "_completed",
    "_disqualified",
    "_paused",
    "_pending"
  ];

  let proposals = {
    _active: [],
    _completed: [],
    _disqualified: [],
    _paused: [],
    _pending: []
  };

  for (let eachStatus of statusType) {
    const proposalsKeys = await getProposalKeysByStatus(
      eachStatus,
      requestCallback
    );

    for (let eachProposal of proposalsKeys) {
      const proposal = await getProposalDetailsByHash(
        eachProposal,
        requestCallback
      );
      proposals[eachStatus].push(proposal);
    }
  }

  return proposals;
}

async function getPreps(height = null, requestCallback = customHttpsRequest) {
  const postData = makeICXCallRequestObject(
    "getPReps",
    { startRanking: "0x1" },
    height
  );
  const request = await requestCallback(GLOBAL.routes.v3, postData);
  return request.result.preps;

  // try {
  //   const parsedRequest = JSON.parse(request);
  //   return parsedRequest.result.preps;
  // } catch (err) {
  //   console.log("error on getPreps request response");
  //   console.log(`response: ${request}.`);
  //   console.error(err);
  //   return [];
  // }
}

async function getProposalsFromTracker(requestCallback = customHttpsRequest) {
  const request = await requestCallback(
    GLOBAL.routes.proposals,
    false,
    GLOBAL.node.tracker
  );
  return request;
}

module.exports = {
  customHttpsRequest: customHttpsRequest,
  makeJSONRPCRequestObject: makeJSONRPCRequestObject,
  GLOBAL: GLOBAL,
  getLastBlock: getLastBlock,
  makeICXCallRequestObject: makeICXCallRequestObject,
  getScoreApi: getScoreApi,
  getPreps: getPreps,
  getProposalsFromTracker: getProposalsFromTracker,
  getProposals: getProposals,
  getBonderList: getBonderList,
  getAllCPSProposals: getAllCPSProposals
};
