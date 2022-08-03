// test/main.test.js
//
const { runTestModule } = require("./utils");
const proposalTest = require("./proposal.test");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const db = require("../database/mongo");
const dbManager = require("../db-manager/db-manager");

const RUN_MEMORY_TEST = false;

let DB = null;
let mongod = null;
const collectionId = "test-proposals";

const db_test = require("./memoryMongo");
async function runAllTests() {
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
    //   collectionId,
    //   DB
    // );

    // run test on db-manager
    console.log("running test on dbManager");
    await dbManager(DB, collectionId);

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

runAllTests();
