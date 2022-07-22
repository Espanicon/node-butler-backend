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
app.use(express.static(path.joing(__dirname, "www")));

async function runAsync() {
  // wait for database
  const DB = await db.connect();

  // ENDPOINTS
  //
  // GET proposals
  app.get("/node-butler/cps-proposals", async (req, res) => {
    if (req.accepts(["json", "application/json"])) {
      // do nothing
    } else {
      res
        .set("Connection", "close")
        .status(406)
        .json({
          res: "Unsopported 'Content-Type'",
          status: 406
        });
    }

    res
      .set("Connection", "close")
      .status(200)
      .json({
        res: "Correct test query",
        status: 200
      });
  });
}

runAsync();

process.on("uncaughtException", err => {
  console.log('Error: "uncaughtException"');
  console.log(err);
});
