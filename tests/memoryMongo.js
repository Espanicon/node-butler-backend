// database/mongo.js
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let mongod = null;

async function connect() {
  if (mongod === null) {
    // temporary database created in memory
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    // connecto to database
    const connection = await mongoose.createConnection(uri).asPromise();
    console.log("mongoose connected");
    return connection;
  } else {
    console.log("Error: mongodb connection already created (mongod != null)");
    console.log(mongod);
  }
}

async function closeDatabase(connection) {
  await connection.close();
  await mongod.stop();
}

const db = {
  connect,
  closeDatabase
};

module.exports = db;
