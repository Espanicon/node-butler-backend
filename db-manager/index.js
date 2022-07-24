// db-updater/index.js
// runs a set of verifications in the mongodb database on startup and
// stays in the background fetching data from the blockchain at a set
// interval and updating the local mongodb database
//
require("dotenv").config();
const DB = require("../database/mongo");
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
const lib = require("../icon-lib/lib-no-sdk");

const INTERVALS = { oneDay: 1000 * 60 * 60 * 24 };

async function mainAsync() {
  try {
    // connecting to db
    const db = await DB.connect();
    const collectionId = process.env.COLLECTION_ID;

    // get the hash of each proposal in the db
    const proposalsHash = await getProposalsHash(collectionId, db);
    console.log(`Found ${proposalsHash.length} entries in db`);

    // compare all the CPS proposals to the ones in the DB and get the
    // missing ones
    const missingProposals = await lib.cps.getCPSMissingProposals(
      proposalsHash
    );
    console.log(`Found ${missingProposals.length} new proposals to add to db.`);

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
          db
        );
        console.log(`Result: ${newAddedProposal.status}`);

        // if proposal added successfully update comments
        if (newAddedProposal.status === "SUCCESS") {
          console.log(`Adding comments to proposal entry in db`);
          const updatedProposal = await updateProposalCommentsByProposalId(
            eachProposal.comments.data,
            newAddedProposal.message["_id"],
            collectionId,
            db
          );
        }
      }

      console.log("Finish updating db");
    } else {
      console.log("No update done on local db");
    }

    // FOR TESTING DELETES ALL ITEMS IN DB
    // for (let eachHash of proposalsHash) {
    //   console.log(`deleting: ${eachHash}`);
    //   await deleteOneProposalByProposalHash(eachHash, collectionId, db);
    // }
    // FOR TESTING

    // closing connection to db
    await DB.closeDatabase(db);
    console.log("db closed");
  } catch (err) {
    console.log("Error running main async code");
    console.log(err);
  }
}

mainAsync();

// set test of updating db to run once every day
const task = setInterval(() => {
  mainAsync();
}, INTERVALS.oneDay);

// Enable graceful stop
process.once("SIGINT", () => {
  console.log("Terminating execution");
  clearInterval(task);
});
process.once("SIGTERM", () => clearInterval(task));
