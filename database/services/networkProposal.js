// database/services/networkProposal.js

// Imports
//
const { NetworkProposalSchema } = require("../schema/networkProposal");
const { makeDBOperationResponseMsg } = require("../../utils/utils");

// Functions
//
// READONLY methods
//
async function getNetworkProposalByParams(params, collectionId, db) {
  /*
   *
   */
  const NetworkProposalModel = db.model(
    collectionId,
    NetworkProposalSchema,
    collectionId
  );
  const query = await NetworkProposalModel.find(params);
  return query;
}

async function getNetworkProposalByNetworkProposalId(id, collectionId, db) {
  /*
   * gets proposal by network proposal Id
   */
  const query = await getNetworkProposalByParams({ id: id }, collectionId, db);
  return query;
}

async function getReducedNetworkProposalByParams(
  params,
  selectObj,
  collectionId,
  db
) {
  /*
   *
   */
  const NetworkProposalModel = db.model(
    collectionId,
    NetworkProposalSchema,
    collectionId
  );
  const query = await NetworkProposalModel.find(params).select(selectObj);
  return query;
}

async function getCountByParams(params, collectionId, db) {
  /*
   *
   */
  const NetworkProposalModel = db.model(
    collectionId,
    NetworkProposalSchema,
    collectionId
  );
  const query = await NetworkProposalModel.find(params).count();
  return query;
}

async function getAllNetworkProposals(collectionId, db) {
  /*
   * gets all proposals
   */
  const query = await getNetworkProposalByParams({}, collectionId, db);
  return query;
}

async function getAllNetworkProposalsCount(collectionId, db) {
  /*
   * gets amount of proposals in the db
   */
  const query = await getCountByParams({}, collectionId, db);
  return query;
}

async function getNetworkProposalsByStatus(status, collectionId, db) {
  /*
   * gets all proposals of a defined status
   */

  const query = await getNetworkProposalByParams(
    { status: status },
    collectionId,
    db
  );
  return query;
}

async function getNetworkProposalsByStatusCount(status, collectionId, db) {
  /*
   * gets amount of proposals of a defined status
   */
  const query = await getCountByParams({ status: status }, collectionId, db);
  return query;
}

async function getNetworkProposalsId(collectionId, db) {
  // gets the hash of all the proposals in the db
  const query = await getReducedNetworkProposalByParams(
    {},
    { id: 1 },
    collectionId,
    db
  );

  let parsedResult = query.map(reducedProposals => {
    return reducedProposals.id;
  });
  return parsedResult;
}

// parse networkProposal
//
function parseNetworkProposal(rawNetworkProposal) {
  let parsedNetworkProposal = {
    apply: {
      was_applied: rawNetworkProposal.apply == null ? true : false,
      address:
        rawNetworkProposal.apply == null
          ? ""
          : rawNetworkProposal.apply.address,
      id: rawNetworkProposal.apply == null ? "" : rawNetworkProposal.apply.id,
      name:
        rawNetworkProposal.apply == null ? "" : rawNetworkProposal.apply.name,
      timestamp:
        rawNetworkProposal.apply == null
          ? ""
          : rawNetworkProposal.apply.timestamp
    },
    contents: { ...rawNetworkProposal.contents },
    vote: { ...rawNetworkProposal.vote },
    endBlockHeight: rawNetworkProposal.endBlockHeight,
    id: rawNetworkProposal.id,
    proposer: rawNetworkProposal.proposer,
    proposerName: rawNetworkProposal.proposerName,
    startBlockHeight: rawNetworkProposal.startBlockHeight,
    status: rawNetworkProposal.status
  };

  return parsedNetworkProposal;
}
// UPDATE and/or CREATE methods
//
async function createNetworkProposal(proposalData, collectionId, db) {
  /*
   * creates a new proposal in the db
   */
  let operationResult = makeDBOperationResponseMsg(
    "Error: unknown error",
    false
  );
  let newProposal = null;

  // parse data comming from CPS smart contracts
  let parsedProposalData = parseNetworkProposal(proposalData);

  try {
    const NetworkProposalModel = db.model(
      collectionId,
      NetworkProposalSchema,
      collectionId
    );
    newProposal = await new NetworkProposalModel(parsedProposalData).save();
    operationResult = makeDBOperationResponseMsg(newProposal);
  } catch (err) {
    console.log("Catched Error.");
    console.log(err.name, err.message);
    operationResult = makeDBOperationResponseMsg(err, false);
  }

  return operationResult;
}

async function updateNetworkProposalByNetworkProposalId(
  newData,
  proposalId,
  collectionId,
  db
) {
  /*
   * update proposal
   */
  const NetworkProposalModel = db.model(
    collectionId,
    NetworkProposalSchema,
    collectionId
  );
  const query = await NetworkProposalModel.findByIdAndUpdate(
    proposalId,
    newData
  );
  return query;
}

async function deleteOneByFilter(filter, collectionId, db) {
  //
  const NetworkProposalModel = db.model(
    collectionId,
    NetworkProposalSchema,
    collectionId
  );
  const query = await NetworkProposalModel.deleteOne(filter);
  return query;
}
async function deleteOneNetworkProposalByProposalId(id, collectionId, db) {
  //
  const query = await deleteOneByFilter({ id: id }, collectionId, db);
  return query;
}

module.exports = {
  getNetworkProposalByNetworkProposalId,
  getReducedNetworkProposalByParams,
  getAllNetworkProposals,
  getAllNetworkProposalsCount,
  getNetworkProposalsByStatus,
  getNetworkProposalsByStatusCount,
  getNetworkProposalsId,
  createNetworkProposal,
  updateNetworkProposalByNetworkProposalId,
  deleteOneNetworkProposalByProposalId
};
