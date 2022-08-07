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

const {
  getAllPrepsData,
  createPrep,
  updatePrepById,
  getPrepByPrepAddress,
  updatePrepDetailsByPrepId,
  deleteOnePrepByPrepAddress
} = require("../database/services/preps");

const NodeButlerSDK = require("../utils/customLib");
const lib = new NodeButlerSDK();

async function dbManager(dbConnection, proposalsCollection, prepsCollection) {
  // console.log("collections");
  // console.log(proposalsCollection);
  // console.log(prepsCollection);
  try {
    // connecting to db
    if (dbConnection == null) {
      throw new Error("connection error");
    } else {
      console.log("Running update on database");

      // get the hash of each proposal in the db
      const proposalsHash = await getProposalsHash(
        proposalsCollection,
        dbConnection
      );
      console.log(`Found ${proposalsHash.length} entries in db`);

      // update proposals in db
      await updateProposalsInDb(
        proposalsHash,
        dbConnection,
        proposalsCollection
      );

      // get data on all preps
      // run getPreps
      const query = await lib.getPreps();
      const preps = query.preps;
      // console.log("preps");
      // console.log(preps);

      // update all preps in the database
      for (let eachPrep of preps) {
        console.log(`address ${eachPrep.address}`);
        const dbPrep = await getPrepByPrepAddress(
          eachPrep.address,
          prepsCollection,
          dbConnection
        );

        // get prep details
        const newDetails = await lib.getPrepsDetails(eachPrep.details);

        // parse prep details
        const hasValidDetails = newDetails == null ? false : true;
        const newDetailsStringified =
          newDetails == null ? "null" : JSON.stringify(newDetails);

        // add/update prep details in db
        if (dbPrep.length < 1) {
          // if no result back from db we create the prep in the db
          const newPrepInDb = await createPrep(
            {
              address: eachPrep.address,
              details: newDetailsStringified,
              has_valid_details: hasValidDetails
            },
            prepsCollection,
            dbConnection
          );
        } else {
          // if the prep exists we update the details.json
          const newPrepInDb = await updatePrepById(
            {
              details: newDetailsStringified,
              has_valid_details: hasValidDetails
            },
            dbPrep[0]["_id"],
            prepsCollection,
            dbConnection
          );
        }
      }

      // get all preps in db
      // const allPrepsInDb = await getAllPrepsData(prepsCollection, dbConnection);

      // WARNING WARNING WARNING
      // FOR TESTING ONLY. DELETES ALL ITEMS IN DB
      // await deleteAllProposalsInDb(proposalsHash, dbConnection, proposalsCollection);
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
  proposalsCollection
) {
  // compare all the CPS proposals to the ones in the DB and get the
  // missing ones
  const missingProposals = await getCPSMissingProposals(
    hashOfProposalsInDb,
    dbConnection,
    proposalsCollection
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
        proposalsCollection,
        dbConnection
      );
      console.log(`Result: ${newAddedProposal.status}`);

      // if proposal added successfully update comments
      if (newAddedProposal.status === "SUCCESS") {
        console.log(`Adding comments to proposal entry in db`);
        const updatedProposal = await updateProposalCommentsByProposalId(
          eachProposal.comments.data,
          newAddedProposal.message["_id"],
          proposalsCollection,
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
  proposalsCollection
) {
  // compare all the CPS proposals to the ones in the DB and get the
  // missing ones
  const missingProposals = await lib.getCPSMissingProposals(
    hashOfProposalsInDb
  );
  console.log(`Found ${missingProposals.length} new proposals to add to db.`);
  return missingProposals;
}

async function deleteAllProposalsInDb(
  hashOfProposalsInDb,
  dbConnection,
  proposalsCollection
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
        proposalsCollection,
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
