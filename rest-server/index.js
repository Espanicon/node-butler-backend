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
const cors = require("cors");
const db = require("../database/mongo");
const { getAllProposals } = require("../database/services/proposal");
const {
  getAllPrepsData,
  getPrepByPrepAddress
} = require("../database/services/preps");

// var declarations
//
const proposalsCollection = process.env.PROPOSALS_COLLECTION;
const prepsCollection = process.env.PREPS_COLLECTION;
const networkProposalCollection = process.env.NETWORK_PROP_COLLECTION;
let DB_CONNECTION = null;
let DB_IS_CONNECTED = 0;

// configure middlewares
//
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

const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// create server
//
const app = express();

// apply middlewares
app.use(express.json());
app.use(helmet());
app.use(
  morgan(
    "> :method :req[header] :url :status :body - :response-time ms \n-----------\n"
  )
);
app.use(express.static(path.join(__dirname, "www")));

async function connectDB() {
  // wait for database
  if (DB_CONNECTION == null) {
    DB_CONNECTION = await db.connect();
  } else {
    const connectionStatusString =
      DB_CONNECTION.readyState === 0
        ? "disconnected"
        : DB_CONNECTION.readyState === 1
        ? "connected"
        : DB_CONNECTION.readyState === 2
        ? "connecting"
        : DB_CONNECTION.readyState === 3
        ? "disconnecting"
        : DB_CONNECTION.readyState === 4
        ? "invalid credentials"
        : "UNKNOWN STATE";

    if (DB_IS_CONNECTED) {
      // if db is connected dont log db state to console
    } else {
      if (DB_IS_CONNECTED === DB_CONNECTION.readyState) {
        // if db state is the same as it was during last check
        // dont log to console
      } else {
        // if db state has changed since last check log the change
        // to the console
        console.log(
          `\n-----------\nDB connection check returns: ${DB_CONNECTION.readyState} (${connectionStatusString})`
        );
        console.log(
          "This check is repeated every minute but is only logging to console when it changes state. Last reported state is the current state\n-----------\n"
        );
        DB_IS_CONNECTED = DB_CONNECTION.readyState;
      }
    }
    if (DB_CONNECTION.readyState === 0) {
      // if db state is disconnected close db and reconnect
      await db.closeDatabase(DB_CONNECTION);
      DB_CONNECTION = await db.connect();
    }
  }
}

async function runAsync() {
  // connects database
  await connectDB();

  // ENDPOINTS
  //
  // GET proposals
  app.get("/node-butler/cps-proposals", cors(corsOptions), async (req, res) => {
    // predifined response in case of failure on the server side
    let query = { res: null, status: 500 };
    try {
      // if the request Accepts json
      if (req.accepts(["json", "application/json"])) {
        // handle request accordingly depending on database status
        if (DB_CONNECTION == null) {
          // if mongodb is offline send response with status 500
          res.set("Connection", "close").status(500);
          query = {
            res: "cant connect to db",
            db_msg: DB_CONNECTION,
            status: 500
          };
        } else {
          // if mongodb is online send response with the result of the
          // query and status 200
          query = await getAllProposals(proposalsCollection, DB_CONNECTION);
          res.set("Connection", "close").status(200);
        }
      } else {
        res.set("Connection", "close").status(406);
        query = {
          res: "Unsopported 'Content-Type'",
          status: 406
        };
      }
    } catch (err) {
      console.log("Server error");
      console.log(err);
    }
    // make response
    res.json(query);
    res.end();
  });
  // GET preps
  app.get("/node-butler/preps", cors(corsOptions), async (req, res) => {
    // predifined response in case of failure on the server side
    let query = { res: null, status: 500 };
    try {
      // if the request Accepts json
      if (req.accepts(["json", "application/json"])) {
        // handle request accordingly depending on database status
        if (DB_CONNECTION == null) {
          // if mongodb is offline send response with status 500
          res.set("Connection", "close").status(500);
          query = {
            res: "cant connect to db",
            db_msg: DB_CONNECTION,
            status: 500
          };
        } else {
          // if mongodb is online send response with the result of the
          // query and status 200
          query = await getAllPrepsData(prepsCollection, DB_CONNECTION);
          res.set("Connection", "close").status(200);
        }
      } else {
        res.set("Connection", "close").status(406);
        query = {
          res: "Unsopported 'Content-Type'",
          status: 406
        };
      }
    } catch (err) {
      console.log("Server error");
      console.log(err);
    }

    // make response
    res.json(query);
    res.end();
  });

  // GET prep data
  app.get(
    "/node-butler/preps/:address",
    cors(corsOptions),
    async (req, res) => {
      // predifined response in case of failure on the server side
      let query = { res: null, status: 500 };
      try {
        // if the request Accepts json
        if (req.accepts(["json", "application/json"])) {
          // handle request accordingly depending on database status
          if (DB_CONNECTION == null) {
            // if mongodb is offline send response with status 500
            res.set("Connection", "close").status(500);
            query = {
              res: "cant connect to db",
              db_msg: DB_CONNECTION,
              status: 500
            };
          } else {
            // if mongodb is online send response with the result of the
            // query and status 200
            const prepAddress = req.params.address;
            query = await getPrepByPrepAddress(
              prepAddress,
              prepsCollection,
              DB_CONNECTION
            );
            res.set("Connection", "close").status(200);
          }
        } else {
          res.set("Connection", "close").status(406);
          query = {
            res: "Unsopported 'Content-Type'",
            status: 406
          };
        }
      } catch (err) {
        console.log("Server error");
        console.log(err);
      }

      // make response
      res.json(query);
      res.end();
    }
  );

  // run server
  app.listen(process.env.REST_PORT, () => {
    console.log(`Listening on port ${process.env.REST_PORT}`);
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
