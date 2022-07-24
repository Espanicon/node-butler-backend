// tests/rest-server.test.js
//
const { getAllCPSProposals } = require("./lib/lib");

async function runAsync() {
  // test getAllCPSProposals
  let query = await getAllCPSProposals();
  console.log(JSON.stringify(query).slice(0, 200) + "...)");
}

runAsync();
