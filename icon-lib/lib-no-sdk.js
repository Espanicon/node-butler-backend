// lib-no-sdk.js
//
// Imports
const httpRequest = require("./api/httpRequest");
const httpsRequest = require("./api/httpsRequest");
const SCORES = require("./scores");

// global var declarations
const statusType = [
  "_active",
  "_completed",
  "_disqualified",
  "_paused",
  "_pending"
];

// General Functions
async function customRequest(
  path,
  data = false,
  hostname = SCORES.apiHostnames.espanicon,
  https = true
) {
  let request;
  try {
    let params = {
      hostname: hostname,
      path: path,
      method: data ? "POST" : "GET",
      headers: {
        "Content-Type": "text/plain",
        charset: "UTF-8"
      }
    };

    if (https) {
      request = await httpsRequest(params, data);
    } else {
      request = await httpRequest(params, data);
    }

    if (request.error == null) {
      // if there is no error
      return request;
    } else {
      throw new Error("Request returned error");
    }
  } catch (err) {
    console.log("Error running customRequest");
    console.log(err.message);
    console.log(request);
  }
}

function makeJSONRPCRequestObj(method) {
  return {
    jsonrpc: "2.0",
    method: method,
    id: Math.ceil(Math.random() * 1000)
  };
}

function makeTxCallRPCObj(
  from,
  to,
  method,
  paramsObj,
  nid = SCORES.nid.mainnet,
  stepLimit = 2000000
) {
  let txObj = makeJSONRPCRequestObj("icx_sendTransaction");
  txObj["params"] = {
    from: from,
    to: to,
    stepLimit: decimalToHex(stepLimit),
    nid: decimalToHex(nid),
    nonce: decimalToHex(1),
    version: decimalToHex(3),
    timestamp: decimalToHex(new Date().getTime() * 1000),
    dataType: "call",
    data: {
      method: method,
      params: paramsObj
    }
  };

  return txObj;
}

function makeICXCallRequestObj(
  method,
  params = null,
  height = null,
  to = "cx0000000000000000000000000000000000000000"
) {
  const JSONRPCRequestObj = makeJSONRPCRequestObj("icx_call");
  let data = {
    ...JSONRPCRequestObj,
    params: {
      to: to,
      dataType: "call",
      data: {
        method: method
      }
    }
  };

  if (params == null) {
  } else {
    data.params.data.params = params;
  }

  if (height === null) {
  } else {
    if (typeof height !== "number") {
      throw new Error("Height type must be number");
    } else {
      data.params.height = "0x" + height.toString(16);
    }
  }

  return JSON.stringify(data);
}

function hexToDecimal(hex) {
  return parseInt(hex, 16);
}

function decimalToHex(number) {
  return "0x" + number.toString(16);
}

function fromHexInLoop(loopInHex) {
  let loopInBase2 = hexToDecimal(loopInHex);
  return loopInBase2 / 10 ** 18;
}

// SCORE methods
//
// CPS methods
async function getCPSPeriodStatus() {
  //
  const JSONRPCObject = makeICXCallRequestObj(
    "get_period_status",
    null,
    null,
    SCORES.mainnet.cps
  );

  const request = await customRequest(SCORES.apiRoutes.v3, JSONRPCObject);
  return request.result;
}

async function getCPSProposalKeysByStatus(status) {
  const JSONRPCObject = makeICXCallRequestObj(
    "get_proposals_keys_by_status",
    { _status: status },
    null,
    SCORES.mainnet.cps
  );

  if (statusType.includes(status)) {
    const request = await customRequest(SCORES.apiRoutes.v3, JSONRPCObject);
    return request.result;
  } else {
    return null;
  }
}

async function getCPSProposalDetailsByHash(hash) {
  const JSONRPCObject = makeICXCallRequestObj(
    "get_proposal_details_by_hash",
    { _ipfs_key: hash },
    null,
    SCORES.mainnet.cps
  );

  const request = await customRequest(SCORES.apiRoutes.v3, JSONRPCObject);
  return request.result;
}

async function getCPSVoteResultsByHash(hash) {
  const JSONRPCObject = makeICXCallRequestObj(
    "get_vote_result",
    { _ipfs_key: hash },
    null,
    SCORES.mainnet.cps
  );

  const request = await customRequest(SCORES.apiRoutes.v3, JSONRPCObject);
  return request.result;
}

async function getAllCPSProposals() {
  let proposals = {
    _active: [],
    _completed: [],
    _disqualified: [],
    _paused: [],
    _pending: []
  };

  for (let eachStatus of statusType) {
    const proposalsKeys = await getCPSProposalKeysByStatus(eachStatus);

    for (let eachProposal of proposalsKeys) {
      const proposal = await getCPSProposalDetailsByHash(eachProposal);
      const comments = await getCPSVoteResultsByHash(eachProposal);

      proposals[eachStatus].push({
        proposal: proposal,
        comments: comments
      });
    }
  }

  return proposals;
}

async function getCPSMissingProposalsKeys(currentProposalsInDb = []) {
  // compares the hash of the proposals that are currently in the db with all
  // the proposals in the ICON Network and returns a list of the keys of the
  // missing proposals
  let missingProposalsKeys = [];

  for (let eachStatus of statusType) {
    const proposalsKeys = await getCPSProposalKeysByStatus(eachStatus);

    proposalsKeys.map(eachKey => {
      if (currentProposalsInDb.includes(eachKey)) {
        // do nothing
      } else {
        missingProposalsKeys.push(eachKey);
      }
    });
  }

  return missingProposalsKeys;
}

async function getCPSMissingProposals(currentProposalsInDb = []) {
  // compares the hash of the proposals that are currently in the db with all
  // the proposals in the ICON Network and only dowloads the missing ones
  const missingProposalsKeys = await getCPSMissingProposalsKeys(
    currentProposalsInDb
  );
  let missingProposals = [];

  for (let eachProposal of missingProposalsKeys) {
    console.log(`fetching ${eachProposal}`);
    const proposal = await getCPSProposalDetailsByHash(eachProposal);
    const comments = await getCPSVoteResultsByHash(eachProposal);

    missingProposals.push({
      proposal: proposal,
      comments: comments
    });
  }

  return missingProposals;
}

// Network score methods
async function getProposals() {
  const JSONRPCObject = makeICXCallRequestObj(
    "getProposals",
    null,
    null,
    SCORES.mainnet.network
  );

  const request = await customRequest(SCORES.apiRoutes.v3, JSONRPCObject);
  return request.result;
}

// Governance methods
async function getScoreApi(address = SCORES.mainnet.governance) {
  //
  const JSONRPCObject = JSON.stringify({
    ...makeJSONRPCRequestObj("icx_getScoreApi"),
    params: {
      address: address
    }
  });

  const request = await customRequest(SCORES.apiRoutes.v3, JSONRPCObject);
  return request.result;
}

function getIcxBalance(address, decimals = 2) {
  //
}

async function getPreps(height = null) {
  const JSONRPCObject = makeICXCallRequestObj(
    "getPReps",
    { startRanking: "0x1" },
    height,
    SCORES.mainnet.governance
  );
  const request = await customRequest(SCORES.apiRoutes.v3, JSONRPCObject);
  return request.result;
}

async function getPrep(prepAddress) {
  //
  const JSONRPCObject = makeICXCallRequestObj(
    "getPRep",
    { address: prepAddress },
    null,
    SCORES.mainnet.governance
  );

  const request = await customRequest(SCORES.apiRoutes.v3, JSONRPCObject);
  return request.result;
}

function parsePrepData(prep) {
  return {
    ...prep,
    bonded: parseInt(fromHexInLoop(prep.bonded)),
    delegated: parseInt(fromHexInLoop(prep.delegated)),
    grade:
      prep.grade === "0x0"
        ? "Main Prep"
        : prep.grade === "0x1"
        ? "Sub Prep"
        : "Prep candidate",
    irep: parseInt(fromHexInLoop(prep.irep)),
    irepUpdateBlockHeight: hexToDecimal(prep.irepUpdateBlockHeight),
    lastHeight: hexToDecimal(prep.lastHeight),
    penalty:
      prep.penalty === "0x0"
        ? "none"
        : prep.penalty === "0x1"
        ? "Disqualification"
        : prep.penalty === "0x2"
        ? "Low Productivity"
        : prep.penalty === "0x3"
        ? "Block Validation Failure"
        : "Unknown",
    power: parseInt(fromHexInLoop(prep.power)),
    status:
      prep.status === "0x0"
        ? "Active"
        : prep.status === "0x1"
        ? "unregistered"
        : prep.status === "0x2"
        ? "Disqualified"
        : "Unknown",
    totalBlocks: hexToDecimal(prep.totalBlocks),
    validatedBlocks: hexToDecimal(prep.validatedBlocks)
  };
}

async function getBonderList(prepAddress) {
  //
  const JSONRPCObject = makeICXCallRequestObj(
    "getBonderList",
    { address: prepAddress },
    null,
    SCORES.mainnet.governance
  );

  const request = await customRequest(SCORES.apiRoutes.v3, JSONRPCObject);
  return request.result;
}

function setBonderList(prepAddress, arrayOfBonderAddresses) {
  return makeTxCallRPCObj(
    prepAddress,
    SCORES.mainnet.governance,
    "setBonderList",
    {
      bonderList: [...arrayOfBonderAddresses]
    }
  );
}

function voteNetworkProposal(proposalId, vote, prepAddress) {
  return makeTxCallRPCObj(prepAddress, SCORES.mainnet.network, "voteProposal", {
    id: proposalId,
    vote: vote
  });
}

function approveNetworkProposal(proposalId, prepAddress) {
  return voteNetworkProposal(proposalId, "0x1", prepAddress);
}

function rejectNetworkProposal(proposalId, prepAddress) {
  return voteNetworkProposal(proposalId, "0x0", prepAddress);
}

async function getLastBlock() {
  const JSONRPCObject = JSON.stringify(
    makeJSONRPCRequestObj("icx_getLastBlock")
  );

  const request = await customRequest(SCORES.apiRoutes.v3, JSONRPCObject);
  return request.result;
}

const lib = {
  cps: {
    getCPSPeriodStatus,
    getCPSProposalKeysByStatus,
    getCPSProposalDetailsByHash,
    getCPSVoteResultsByHash,
    getAllCPSProposals,
    getCPSMissingProposals
  },
  governance: {
    getScoreApi,
    getPrep,
    parsePrepData,
    getPreps,
    getBonderList,
    setBonderList,
    getLastBlock,
    approveNetworkProposal,
    rejectNetworkProposal
  },
  lib: {
    hexToDecimal,
    decimalToHex,
    fromHexInLoop
  }
};

module.exports = lib;