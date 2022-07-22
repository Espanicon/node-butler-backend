// tests/proposal.test.js
//
const { createTest } = require("./utils");
const { oneProposalData } = require("./mockData");
const {
  createProposal,
  getAllProposals,
  getAllProposalsCount,
  getProposalById,
  getProposalsByStatus,
  getProposalsByStatusCount,
  getProposalCommentsByProposalId,
  updateProposalCommentsByProposalId
} = require("../database/services/proposal");

async function proposalTest(collectionId, db) {
  // test on createProposal
  await createTest(
    createProposal,
    true,
    oneProposalData.proposal,
    collectionId,
    db
  );

  // test getAllProposals
  const query = await createTest(getAllProposals, true, collectionId, db);

  // test getProposalCommentsByProposalId
  await createTest(
    getProposalCommentsByProposalId,
    true,
    query[0]["_id"],
    collectionId,
    db
  );

  // test updateProposalCommentsByProposalId
  await createTest(
    updateProposalCommentsByProposalId,
    true,
    oneProposalData.comments.data,
    query[0]["_id"],
    collectionId,
    db
  );

  // test getProposalById
  await createTest(getProposalById, true, query[0]["_id"], collectionId, db);

  // test getProposalCommentsByProposalId
  await createTest(
    getProposalCommentsByProposalId,
    true,
    query[0]["_id"],
    collectionId,
    db
  );
}

module.exports = proposalTest;
