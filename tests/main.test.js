// test/main.test.js
//
const { runTestModule } = require("./utils");
const proposalTest = require("./proposal.test");
const db_test = require("./memoryMongo");
const db = require("../database/mongo");

const RUN_MEMORY_TEST = true;

let DB = null;
let mongod = null;

if (RUN_MEMORY_TEST) {
  let memoryDB = db_test.connect();
  DB = memoryDB.connection;
  mongod = memoryDB.MMS;
  console.log("mongod");
  console.log(mongod);
} else {
  DB = db.connect();
}

async function runAllTests() {
  // setting up in db to run tests
  const DB = await db.connect();
  const collectionId = "test-proposals";
  console.log("succesfully connected to db");

  // running tests
  await runTestModule(
    proposalTest,
    "proposal.test.js",
    false,
    true,
    collectionId,
    DB
  );

  // closing db
  if (RUN_MEMORY_TEST) {
    await db_test.closeDatabase(DB);
    console.log("mongod");
    console.log(mongod);
    // await mongod.stop();
  } else {
    await db.closeDatabase(DB);
  }
  console.log("successfully closed db");
}

runAllTests();
