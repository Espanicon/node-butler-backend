// db-updater/index.js
// runs a set of verifications in the mongodb database on startup and
// stays in the background fetching data from the blockchain at a set
// interval and updating the local mongodb database
//
const DB = require("../database/mongo");

async function mainAsync() {
  try {
    // connecting to db
    const connection = await DB.connect();

    // closing connection to db
    await DB.closeDatabase(connection);
    console.log("db closed");
  } catch (err) {
    console.log("Error running main async code");
    console.log(err);
  }
}

mainAsync();
