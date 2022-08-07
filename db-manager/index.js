// db-updater/index.js
// runs a set of verifications in the mongodb database on startup and
// stays in the background fetching data from the blockchain at a set
// interval and updating the local mongodb database
//
require("dotenv").config();
const DB = require("../database/mongo");
const dbManager = require("./db-manager");

const INTERVALS = { oneDay: 1000 * 60 * 60 * 24, oneMinute: 1000 * 60 };
let CONNECTION_SUCCESS = false;
let DB_CONNECTION = null;
const proposalsCollection = process.env.PROPOSALS_COLLECTION;
const prepsCollection = process.env.PREPS_COLLECTION;

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

// set recursive tasks

// set task that runs once a day to update db IF mongo is online
const task = setInterval(async () => {
  // connect to db
  await connectDB();

  // check if db is connected and run check
  if (CONNECTION_SUCCESS) {
    await dbManager(DB_CONNECTION, proposalsCollection, prepsCollection);
  } else {
    console.log("mongo is offline, skipping check");
  }
  // closing connection to db
  await DB.closeDatabase(DB_CONNECTION);
  DB = null;
  console.log("db closed");
}, INTERVALS.oneDay);

// Enable graceful stop
process.once("SIGINT", () => {
  console.log("Terminating execution");
  clearInterval(task);
  console.log("recursive tasks cleared");
});
process.once("SIGTERM", () => {
  clearInterval(task);
});

// to run one check inmmediatly set to true the following variable
const RUN_ONE_CHECK_NOW = false;

async function runNow() {
  await connectDB();
  await dbManager(DB_CONNECTION, proposalsCollection, prepsCollection);
}
if (RUN_ONE_CHECK_NOW) {
  runNow();
}
