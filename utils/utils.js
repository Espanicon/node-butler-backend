// src/utils/utils.js

function makeDBOperationResponseMsg(msg, success = true) {
  /*
   * returns parsed query response
   */
  return {
    status: success ? "SUCCESS" : "FAILED",
    message: msg
  };
}

function makeAPIResponseMsg(responseData, success = true, statusCode = false) {
  /*
   * makes API response message
   */
  let response = {
    status: success ? "SUCCESS" : "FAILED"
  };

  if (!success) {
    response.error = responseData;
  } else {
    response.result = responseData;
  }

  return {
    res: response,
    status: statusCode ? statusCode : response.status === "SUCCESS" ? 200 : 400
  };
}

module.exports = {
  makeDBOperationResponseMsg,
  makeAPIResponseMsg
};
