// test/main.test.js
//
const { runTestModule } = require("./utils");
const proposalTest = require("./proposal.test");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const db = require("../database/mongo");
const {
  CPSAndPrepDbHelper,
  networkProposalDbHelper
} = require("../db-manager/db-manager");

const NodeButlerSDK = require("../utils/customLib");

const lib = new NodeButlerSDK();
const RUN_MEMORY_TEST = true;

let DB = null;
let mongod = null;
const proposalsCollectionTest = "test-proposals";
const prepsCollectionTest = "test-preps";
const networkProposalCollection = "test-network";

const db_test = require("./memoryMongo");

async function restServerTest() {
  // get all preps
  let query = await lib.queryMethod(
    "/node-butler/preps/",
    false,
    "localhost",
    false,
    3001
  );
  console.log(query);

  // get one prep
  query = await lib.queryMethod(
    "/node-butler/preps/hxfba37e91ccc13ec1dab115811f73e429cde44d48",
    false,
    "localhost",
    false,
    3001
  );
  console.log(query);

  // get proposals
  query = await lib.queryMethod(
    "/node-butler/cps-proposals",
    false,
    "localhost",
    false,
    3001
  );
  console.log(query);
}

async function dbManagerTest() {
  // setting up in db to run tests
  try {
    if (RUN_MEMORY_TEST) {
      console.log("Running tests using memory mongo");
      let memoryDB = await db_test.connect();
      DB = memoryDB.connection;
      mongod = memoryDB.MMS;
    } else {
      console.log("Running tests using local mongo");
      DB = await db.connect();
    }
    console.log("succesfully connected to db");

    // running tests
    // await runTestModule(
    //   proposalTest,
    //   "proposal.test.js",
    //   false,
    //   true,
    //   proposalsCollectionTest,
    //   DB
    // );

    // run test on db-manager
    console.log("running test on dbManager");

    // console.log('Running CPSAndPrepDbHelper')
    // await CPSAndPrepDbHelper(DB, proposalsCollectionTest, prepsCollectionTest);

    console.log("Running CPSAndPrepDbHelper");
    await networkProposalDbHelper(DB, networkProposalCollection);

    // closing db
    if (RUN_MEMORY_TEST) {
      await db_test.closeDatabase(DB);
      await mongod.stop();
    } else {
      await db.closeDatabase(DB);
    }
    console.log("successfully closed db");
  } catch (err) {
    console.log("Error running tests");
    console.log(err);
  }
}

async function runAllTests() {
  // rest server tests
  // console.log('Running test on rest server')
  // await restServerTest();

  // db-manager tests
  console.log("Running test on dbManager");
  await dbManagerTest();
}

runAllTests();
