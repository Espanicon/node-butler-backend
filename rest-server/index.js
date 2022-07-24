// rest-server/index.js
// REST API server.
// Gets data from the local mongodb database and serves this data to the
// clients via a REST API.

// imports
//
require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const db = require("../database/mongo");
const { getAllProposals } = require("../database/services/proposal");

const COLLECTION_ID = process.env.COLLECTION_ID;
let DB_CONNECTION = null;

morgan.token("body", (req, res) => {
  if (req.body == null) {
    return {};
  } else {
    const bodyString = JSON.stringify(req.body);
    return bodyString.length < 120
      ? bodyString
      : bodyString.slice(0, 120) + "...";
  }
});

const app = express();
app.use(express.json());
app.use(helmet());
app.use(
  morgan("> :method :url :status :body - :response-time ms \n-----------\n")
);
app.use(express.static(path.join(__dirname, "www")));

async function connectDB() {
  // wait for database
  DB_CONNECTION = await db.connect();
}

async function runAsync() {
  // connects database
  await connectDB();

  // ENDPOINTS
  //
  // GET proposals
  app.get("/node-butler/cps-proposals", async (req, res) => {
    if (req.accepts(["json", "application/json"])) {
      // do nothing, the request has the correct type and will be
      // handle correctly
    } else {
      res
        .set("Connection", "close")
        .status(406)
        .json({
          res: "Unsopported 'Content-Type'",
          status: 406
        });
    }

    // predifined response in case of failure on the server side
    let query = { res: null, status: 500 };

    // handle request accordingly depending on database status
    if (DB_CONNECTION == null) {
      // if mongodb is offline send response with status 500
      res.set("Connection", "close").status(500);
    } else {
      // if mongodb is online send response with the result of the
      // query and status 200
      query = await getAllProposals(COLLECTION_ID, DB_CONNECTION);
      res.set("Connection", "close").status(200);
    }

    // make response
    res.json(query);
  });

  // run server
  app.listen(3000, () => {
    console.log("Listening on port 3000");
  });
}

runAsync();

// create interval that checks database connection every 10 seconds
const task = setInterval(async () => {
  await connectDB();
}, 10000);

process.on("uncaughtException", err => {
  console.log('Error: "uncaughtException"');
  console.log(err);
  process.kill(process.pid, "SIGINT");
});

// Enable graceful stop
process.once("SIGINT", async () => {
  console.log("Terminating execution");
  if (DB_CONNECTION == null) {
  } else {
    await db.closeDatabase(DB_CONNECTION);
  }
  clearInterval(task);
  process.exit(0);
});
process.once("SIGTERM", async () => {
  if (DB_CONNECTION == null) {
  } else {
    await db.closeDatabase(DB_CONNECTION);
  }
  clearInterval(task);
  process.exit(0);
});
