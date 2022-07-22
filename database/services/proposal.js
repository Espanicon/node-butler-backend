// database/services/proposal.js

// Imports
//
const { ProposalSchema } = require("../schema/proposal");
const { makeDBOperationResponseMsg } = require("../../utils/utils");
const {
  proposalStates,
  sponsorDepositStatus,
  voteTypes,
  arrayOfHexEntries,
  arrayOfDateEntries,
  arrayOfLoopEntries,
  parseProposalData
} = require("../commons");

// Functions
//
// READONLY methods
//
async function getProposalByParams(params, collectionId, db) {
  /*
   *
   */
  const ProposalModel = db.model(collectionId, ProposalSchema, collectionId);
  const query = await ProposalModel.find(params);
  return query;
}

async function getProposalByParamsCustom(params, selectObj, collectionId, db) {
  /*
   *
   */
  const ProposalModel = db.model(collectionId, ProposalSchema, collectionId);
  const query = await ProposalModel.find(params).select(selectObj);
  return query;
}

async function getCountByParams(params, collectionId, db) {
  /*
   *
   */
  const ProposalModel = db.model(collectionId, ProposalSchema, collectionId);
  const query = await ProposalModel.find(params).count();
  return query;
}

async function getAllProposals(collectionId, db) {
  /*
   * gets all proposals
   */
  const query = await getProposalByParams({}, collectionId, db);
  return query;
}

async function getAllProposalsCount(collectionId, db) {
  /*
   * gets amount of proposals in the db
   */
  const query = await getCountByParams({}, collectionId, db);
  return query;
}

async function getProposalById(proposalId, collectionId, db) {
  /*
   * gets proposal given a proposal ID (mongodb ID)
   */
  const query = await getProposalByParams(
    { _id: proposalId },
    collectionId,
    db
  );
  return query[0];
}

async function getProposalsByStatus(status, collectionId, db) {
  /*
   * gets all proposals of a defined status
   */

  if (proposalStates.includes(status)) {
    const query = await getProposalByParams(
      { status: status },
      collectionId,
      db
    );
    return query;
  } else {
    return null;
  }
}

async function getProposalsByStatusCount(status, collectionId, db) {
  /*
   * gets amount of proposals of a defined status
   */
  if (proposalStates.includes(status)) {
    const query = await getCountByParams({ status: status }, collectionId, db);
    return query;
  } else {
    return null;
  }
}

async function getProposalCommentsByProposalId(proposalId, collectionId, db) {
  /*
   * gets all the comments of a specific proposal, querying by proposal ID
   * (mongodb _id)
   */
  const query = await getProposalByParamsCustom(
    { _id: proposalId },
    { comments: 1 },
    collectionId,
    db
  );
  return query;
}

// UPDATE and/or CREATE methods
//
async function createProposal(proposalData, collectionId, db) {
  /*
   * creates a new proposal in the db
   */
  let operationResult = makeDBOperationResponseMsg(
    "Error: unknown error",
    false
  );

  // parse data comming from CPS smart contracts
  let parsedProposalData = parseProposalData(proposalData);

  try {
    const ProposalModel = db.model(collectionId, ProposalSchema, collectionId);
    const newProposal = await new ProposalModel(parsedProposalData).save();
    operationResult = makeDBOperationResponseMsg(
      `Proposal created. proposal: ${JSON.stringify(newProposal)}`
    );
  } catch (err) {
    console.log("Catched Error.");
    console.log(err.name, err.message);
    operationResult = makeDBOperationResponseMsg(err, false);
  }

  return operationResult;
}

async function updateProposalById(newData, proposalId, collectionId, db) {
  /*
   * update proposal
   */
  const ProposalModel = db.model(collectionId, ProposalSchema, collectionId);
  const query = await ProposalModel.findByIdAndUpdate(proposalId, newData);
  return query;
}

async function updateProposalStatusByProposalId(
  newStatus,
  proposalId,
  collectionId,
  db
) {
  /*
   * update status of a proposal
   */
  const query = await updateProposalById(
    { status: newStatus },
    proposalId,
    collectionId,
    db
  );
  return query;
}

async function updateProposalCommentsByProposalId(
  commentsArray,
  proposalId,
  collectionId,
  db
) {
  /*
   * update comments of a proposal
   */
  const query = await updateProposalById(
    { comments: commentsArray },
    proposalId,
    collectionId,
    db
  );
  return query;
}

module.exports = {
  createProposal,
  getAllProposals,
  getAllProposalsCount,
  getProposalById,
  getProposalsByStatus,
  getProposalsByStatusCount,
  getProposalCommentsByProposalId,
  updateProposalCommentsByProposalId
};
