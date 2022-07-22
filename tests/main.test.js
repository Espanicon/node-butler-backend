// test/main.test.js
//
const { runTestModule } = require("./utils");
const proposalTest = require("./proposal.test");
const db = require("../database/mongo");

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
  await db.closeDatabase(DB);
  console.log("successfully closed db");
}

runAllTests();
