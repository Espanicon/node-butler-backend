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
  getProposalByHash,
  getProposalCommentsByProposalId,
  updateProposalCommentsByProposalId,
  updateProposalStatusByProposalId,
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

const {
  createNetworkProposal,
  getNetworkProposalByNetworkProposalId,
  updateNetworkProposalByNetworkProposalId,
  parseNetworkProposal
} = require("../database/services/networkProposal");

const NodeButlerSDK = require("../utils/customLib");
const lib = new NodeButlerSDK();

async function updateNetworkProposals(
  dbConnection,
  networkProposalCollection
) {}

async function activeNetworkProposalDbHelper() {
  // checks every minute for active network proposals for voting. it updates
  // the votes on the active network proposals
  // TODO: this would probably be better to handle on the front end
}
async function networkProposalDbHelper(
  dbConnection,
  networkProposalCollection
) {
  // runs every hour and updates the network proposals in the db
  // fetch all network proposals
  console.log('!---------->\nRunning "networkProposalDbHelper"');
  const allNetworkProposals = await lib.getAllNetworkProposals();

  let idOfLastNetworkProposalFetchedFromDb = null;
  for (let eachProposal of allNetworkProposals) {
    // query db to check if proposal was already in db
    const oldProposalInDb = await getNetworkProposalByNetworkProposalId(
      eachProposal.id,
      networkProposalCollection,
      dbConnection
    );

    let proposalInDb = null;
    if (oldProposalInDb.length < 1) {
      // if proposal is not already in db, add proposal to db
      console.log("adding network proposal to db");
      console.log(`proposal id: ${eachProposal.id}`);
      proposalInDb = await createNetworkProposal(
        eachProposal,
        networkProposalCollection,
        dbConnection
      );
    } else {
      // if proposal is already in db, update vote, apply and status
      console.log("updating network proposal in db");
      console.log(`proposal id: ${eachProposal.id}`);
      const parsedNetworkProposal = parseNetworkProposal(eachProposal);
      proposalInDb = await updateNetworkProposalByNetworkProposalId(
        {
          vote: { ...parsedNetworkProposal.vote },
          apply: { ...parsedNetworkProposal.apply },
          status: parsedNetworkProposal.status
        },
        oldProposalInDb[0]["_id"],
        networkProposalCollection,
        dbConnection
      );
    }
    // console.log("Result of adding network proposal to db");
    // console.log(proposalInDb);

    // test
    // idOfLastNetworkProposalFetchedFromDb = eachProposal.id;
    // console.log("proposal was already in db");
    // console.log(oldProposalInDb);
    // test
  }

  // test
  // const lastProposalAddedToDb = await getNetworkProposalByNetworkProposalId(
  //   idOfLastNetworkProposalFetchedFromDb,
  //   networkProposalCollection,
  //   dbConnection
  // );
  // console.log("last added proposal in db");
  // console.log(lastProposalAddedToDb);
  // test

  // by network proposal ID check one by one and add the proposals missing
  // in the db
}

async function CPSAndPrepDbHelper(
  dbConnection,
  proposalsCollection,
  prepsCollection
) {
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
      console.log('!---------->\nRunning "updateProposalsInDb"');
      await updateProposalsInDb(
        proposalsHash,
        dbConnection,
        proposalsCollection
      );

      // update all proposals status and comments
      console.log(
        '!---------->\nRunning "updateProposalsCommentsAndStatusInDB"'
      );
      await updateProposalsCommentsAndStatusInDB(
        dbConnection,
        proposalsCollection
      );

      // update Preps in db
      console.log('!---------->\nRunning "updatePrepsInDB"');
      await updatePrepsInDB(prepsCollection, dbConnection);

      // TEST
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

async function updatePrepsInDB(prepsCollection, dbConnection) {
  //
  // get data on all preps
  // run getPreps
  const query = await lib.getPreps();
  const preps = query.preps;
  // console.log("preps");
  // console.log(preps);

  // update all preps in the database
  for (let eachPrep of preps) {
    console.log("!------>\n");
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
}

async function updateProposalsCommentsAndStatusInDB(
  dbConnection,
  proposalsCollection
) {
  //
  // get the hash of each proposal in the db
  const proposalsHash = await getProposalsHash(
    proposalsCollection,
    dbConnection
  );

  console.log(`Updating comments and status`);
  for (let eachProposalHash of proposalsHash) {
    const proposalInDb = await getProposalByHash(
      eachProposalHash,
      proposalsCollection,
      dbConnection
    );
    const proposal = await lib.getCPSProposalDetailsByHash(eachProposalHash);
    const comments = await lib.getCPSProposalVoteResultsByHash(
      eachProposalHash
    );
    if (proposalInDb[0].status !== proposal.status) {
      console.log(
        `old status: ${proposalInDb[0].status}. new status: ${proposal.status}`
      );
      await updateProposalStatusByProposalId(
        proposal.status,
        proposalInDb[0]["_id"],
        proposalsCollection,
        dbConnection
      );
    }

    if (proposalInDb[0].comments.length != comments.data.length) {
      console.log(
        `old comments length: ${proposalInDb[0].comments.length}. new comments length ${comments.data.length}`
      );
      await updateProposalCommentsByProposalId(
        comments.data,
        proposalInDb[0]["_id"],
        proposalsCollection,
        dbConnection
      );
    }
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
      } else {
        // test to se why the proposal failed to be added to DB
        // console.log("FAILED proposal -->");
        // console.log(eachProposal);
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

const dbManager = {
  CPSAndPrepDbHelper,
  networkProposalDbHelper,
  activeNetworkProposalDbHelper
};
module.exports = dbManager;
