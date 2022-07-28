// tests/rest-server.test.js
//
const { getAllCPSProposals } = require("./lib/lib");

const RUN_LOCAL = false;
async function runAsync() {
  let hostname = false;

  if (RUN_LOCAL) {
    hostname = "localhost";
  }
  // test getAllCPSProposals
  let query = await getAllCPSProposals(hostname);
  console.log(JSON.stringify(query));
}

runAsync();
