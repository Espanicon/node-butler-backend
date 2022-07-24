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

const INTERVALS = { oneDay: 1000 * 60 * 60 * 24, oneMinute: 1000 * 60 };
let CONNECTION_SUCCESS = false;
let DB_CONNECTION = null;
let dailyInterval = null;

async function connectDB() {
  //
  try {
    console.log("!---------------\nChecking if mongo is online");
    DB_CONNECTION = await DB.connect();

    if (DB_CONNECTION == null) {
      CONNECTION_SUCCESS = false;
      console.log("mongo is offline");
    } else {
      CONNECTION_SUCCESS = true;
      console.log("mongo is online");
    }
  } catch (err) {
    console.log("Error trying to connect to db");
    console.log(err);
    CONNECTION_SUCCESS = false;
  }
}

async function mainAsync() {
  try {
    // connecting to db
    if (DB_CONNECTION == null) {
      throw new Error("connection error");
    } else {
      console.log("Running update on database");
      const collectionId = process.env.COLLECTION_ID;

      // get the hash of each proposal in the db
      const proposalsHash = await getProposalsHash(collectionId, DB_CONNECTION);
      console.log(`Found ${proposalsHash.length} entries in db`);

      // compare all the CPS proposals to the ones in the DB and get the
      // missing ones
      const missingProposals = await lib.cps.getCPSMissingProposals(
        proposalsHash
      );
      console.log(
        `Found ${missingProposals.length} new proposals to add to db.`
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
            DB_CONNECTION
          );
          console.log(`Result: ${newAddedProposal.status}`);

          // if proposal added successfully update comments
          if (newAddedProposal.status === "SUCCESS") {
            console.log(`Adding comments to proposal entry in db`);
            const updatedProposal = await updateProposalCommentsByProposalId(
              eachProposal.comments.data,
              newAddedProposal.message["_id"],
              collectionId,
              DB_CONNECTION
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
      //   await deleteOneProposalByProposalHash(eachHash, collectionId, DB_CONNECTION);
      // }
      // FOR TESTING

      // closing connection to db
      await DB.closeDatabase(DB_CONNECTION);
      console.log("db closed");
    }
  } catch (err) {
    console.log("Error running main async code");
    console.log(err);
  }
}

// set recursive tasks
//
// set task that runs every minute to check if mongo is online
const task1 = setInterval(async () => {
  await connectDB();

  // if mongo is online run one check inmediatly
  if (CONNECTION_SUCCESS) {
    await mainAsync();
  }
}, INTERVALS.oneMinute);

// set task that runs day to update db IF mongo is online
const task2 = setInterval(async () => {
  if (CONNECTION_SUCCESS) {
    await mainAsync();
  } else {
    console.log("mongo is offline, skipping check");
  }
}, INTERVALS.oneDay);

// Enable graceful stop
process.once("SIGINT", () => {
  console.log("Terminating execution");
  clearInterval(task1);
  clearInterval(task2);
  console.log("recursive tasks cleared");
});
process.once("SIGTERM", () => {
  clearInterval(task1);
  clearInterval(task2);
});
