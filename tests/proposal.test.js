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
  updateProposalCommentsByProposalId,
  getProposalsHash
} = require("../database/services/proposal");

async function proposalTest(proposalsCollection, db) {
  // test on getProposalsHash
  await createTest(getProposalsHash, true, proposalsCollection, db);

  // test on createProposal
  await createTest(
    createProposal,
    true,
    oneProposalData.proposal,
    proposalsCollection,
    db
  );

  // test getAllProposals
  const query = await createTest(getAllProposals, true, proposalsCollection, db);

  // test getProposalCommentsByProposalId
  await createTest(
    getProposalCommentsByProposalId,
    true,
    query[0]["_id"],
    proposalsCollection,
    db
  );

  // test updateProposalCommentsByProposalId
  await createTest(
    updateProposalCommentsByProposalId,
    true,
    oneProposalData.comments.data,
    query[0]["_id"],
    proposalsCollection,
    db
  );

  // test getProposalById
  await createTest(getProposalById, true, query[0]["_id"], proposalsCollection, db);

  // test getProposalCommentsByProposalId
  await createTest(
    getProposalCommentsByProposalId,
    true,
    query[0]["_id"],
    proposalsCollection,
    db
  );

  // test on getProposalsHash
  await createTest(getProposalsHash, true, proposalsCollection, db);
}

module.exports = proposalTest;
