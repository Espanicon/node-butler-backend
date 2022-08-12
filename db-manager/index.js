// db-updater/index.js
// runs a set of verifications in the mongodb database on startup and
// stays in the background fetching data from the blockchain at a set
// interval and updating the local mongodb database
//
require("dotenv").config();
const DB = require("../database/mongo");
const { CPSAndPrepDbHelper, networkProposalDbHelper } = require("./db-manager");

const INTERVALS = {
  oneDay: 1000 * 60 * 60 * 24,
  oneMinute: 1000 * 60,
  tenMinutes: 1000 * 60 * 10
};
let CONNECTION_SUCCESS = false;
let DB_CONNECTION = null;
const proposalsCollection = process.env.PROPOSALS_COLLECTION;
const prepsCollection = process.env.PREPS_COLLECTION;
const networkProposalCollection = process.env.NETWORK_PROP_COLLECTION;

async function task1() {
  await CPSAndPrepDbHelper(DB_CONNECTION, proposalsCollection, prepsCollection);
}
async function task2() {
  await networkProposalDbHelper(DB_CONNECTION, networkProposalCollection);
}
async function tasksRunner(taskCallback) {
  // connect to db
  await connectDB();

  // check if db is connected and run check
  if (CONNECTION_SUCCESS) {
    await taskCallback();
  } else {
    console.log("mongo is offline, skipping check");
  }
  // closing connection to db
  await DB.closeDatabase(DB_CONNECTION);
  DB_CONNECTION = null;
  console.log("db closed");
}

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
const intervalOfTask1 = setInterval(async () => {
  await tasksRunner(task1);
}, INTERVALS.oneDay);

const intervalOfTask2 = setInterval(async () => {
  await tasksRunner(task2);
}, INTERVALS.tenMinutes);

// Enable graceful stop
process.once("SIGINT", () => {
  console.log("Terminating execution");
  clearInterval(intervalOfTask1);
  clearInterval(intervalOfTask2);
  console.log("recursive tasks cleared");
});
process.once("SIGTERM", () => {
  clearInterval(intervalOfTask1);
  clearInterval(intervalOfTask2);
});

// to run one check inmmediatly set to true the following variable
const RUN_ONE_CHECK_NOW = true;

if (RUN_ONE_CHECK_NOW) {
  // run at the beginning once
  tasksRunner(task1);
  tasksRunner(task2);
}
