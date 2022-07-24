// tests/lib/lib.js
//
// Imports
const httpsRequest = require("../../icon-lib/api/httpsRequest");
const SCORES = require("../../icon-lib/scores");

// global var declarations
const statusType = [
  "_active",
  "_completed",
  "_disqualified",
  "_paused",
  "_pending"
];

// General Functions
async function customRequest(
  path,
  data = false,
  hostname = SCORES.apiHostnames.espanicon,
  https = true,
  contentType = "text/plain",
  port = 3000
) {
  let request;
  try {
    let params = {
      hostname: hostname,
      path: path,
      method: data ? "POST" : "GET",
      headers: {
        "Content-Type": contentType,
        charset: "UTF-8"
      },
      timeout: 10000
    };

    if (https) {
      request = await httpsRequest(params, data);
    } else {
      params.port = port;
      request = await httpsRequest(params, data, false);
    }

    if (request.error == null) {
      // if there is no error
      return request;
    } else {
      throw new Error("Request returned error");
    }
  } catch (err) {
    console.log("Error running customRequest");
    console.log(err.message);
    console.log(request);
  }
}

// API routes
async function getAllCPSProposals() {
  //
  const request = await customRequest(
    "/node-butler/cps-proposals",
    false,
    "localhost",
    false,
    "json"
  );

  return request;
}
module.exports = { getAllCPSProposals };
