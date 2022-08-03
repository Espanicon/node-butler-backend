// db-manager/db-manager.js
// runs a set of verifications in the mongodb database on startup and
// stays in the background fetching data from the blockchain at a set
// interval and updating the local mongodb database
//
const {
  createProposal,
  getAllProposals,
  getAllProposalsCount,
  getProposalById,
  getProposalsByStatus,
  getProposalsByStatusCount,
  getProposalCommentsByProposalId,
  updateProposalCommentsByProposalId,
  getProposalsHash,
  deleteOneProposalByProposalHash
} = require("../database/services/proposal");
const NodeButlerSDK = require("../utils/customLib");
const lib = new NodeButlerSDK();

async function dbManager(dbConnection, collectionId) {
  try {
    // connecting to db
    if (dbConnection == null) {
      throw new Error("connection error");
    } else {
      console.log("Running update on database");

      // get the hash of each proposal in the db
      const proposalsHash = await getProposalsHash(collectionId, dbConnection);
      console.log(`Found ${proposalsHash.length} entries in db`);

      // update proposals in db
      await updateProposalsInDb(proposalsHash, dbConnection, collectionId);

      // WARNING WARNING WARNING
      // FOR TESTING ONLY. DELETES ALL ITEMS IN DB
      // await deleteAllProposalsInDb(proposalsHash, dbConnection, collectionId);
      // FOR TESTING
    }
  } catch (err) {
    console.log("Error running main async code");
    console.log(err);
  }
}

async function updateProposalsInDb(
  hashOfProposalsInDb,
  dbConnection,
  collectionId
) {
  // compare all the CPS proposals to the ones in the DB and get the
  // missing ones
  const missingProposals = await getCPSMissingProposals(
    hashOfProposalsInDb,
    dbConnection,
    collectionId
  );

  // add each of the missing proposals to the db
  if (missingProposals.length > 0) {
    console.log("Updating db");
    for (let eachProposal of missingProposals) {
      console.log(
        `Adding proposal with hash: ${eachProposal.proposal["ipfs_hash"]}`
      );
      const newAddedProposal = await createProposal(
        eachProposal.proposal,
        collectionId,
        dbConnection
      );
      console.log(`Result: ${newAddedProposal.status}`);

      // if proposal added successfully update comments
      if (newAddedProposal.status === "SUCCESS") {
        console.log(`Adding comments to proposal entry in db`);
        const updatedProposal = await updateProposalCommentsByProposalId(
          eachProposal.comments.data,
          newAddedProposal.message["_id"],
          collectionId,
          dbConnection
        );
      }
    }
    console.log("Finish updating db");
  } else {
    console.log("No update done on local db");
  }
}

async function getCPSMissingProposals(
  hashOfProposalsInDb,
  dbConnection,
  collectionId
) {
  // compare all the CPS proposals to the ones in the DB and get the
  // missing ones
  const missingProposals = await lib.getCPSMissingProposals(
    hashOfProposalsInDb,
    dbConnection,
    collectionId
  );
  console.log(`Found ${missingProposals.length} new proposals to add to db.`);
  return missingProposals;
}

async function deleteAllProposalsInDb(
  hashOfProposalsInDb,
  dbConnection,
  collectionId
) {
  // WARNING WARNING WARNING
  // FOR TESTING ONLY. DELETES ALL ITEMS IN DB
  const DELETE_ALL_PROPOSALS = false;

  console.log("Running function to delete all proposals");
  if (DELETE_ALL_PROPOSALS) {
    console.log("Safety flag to delete all proposals has been activated");
    for (let eachHash of hashOfProposalsInDb) {
      console.log(`deleting: ${eachHash}`);
      await deleteOneProposalByProposalHash(
        eachHash,
        collectionId,
        dbConnection
      );
    }
    // FOR TESTING
  } else {
    console.log(
      "Safety flag to delete all proposals is disable. bypassing deletion"
    );
  }
}
module.exports = dbManager;
