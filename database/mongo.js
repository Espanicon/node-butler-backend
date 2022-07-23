// database/mongo.js
// connects to mongodb database via mongoose
//
const mongoose = require("mongoose");

async function connect() {
  try {
    // try to connect to mongod.service which should already be running
    const uri = "mongodb://127.0.0.1:27017/";

    // connecto to database
    const connection = await mongoose
      .createConnection(uri, {
        autoIndex: false, // Don't build indexes
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        family: 4 // Use IPv4, skip trying IPv6
      })
      .asPromise();
    console.log("mongoose connected");
    return connection;
  } catch (err) {
    console.log("Error trying to connect to db");
    console.log(`${err.name}: ${err.message}`);
    return null;
  }
}

async function closeDatabase(connection) {
  if (connection === null) {
    console.log(
      "Error: there was no connection to trigger a connection.close()"
    );
  } else {
    await connection.close(() => {
      console.log("mongoose connection closed");
    });
  }
}

const db = {
  connect,
  closeDatabase
};

module.exports = db;
