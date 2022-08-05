// database/services/preps.js

// Imports
//
const { PrepsSchema } = require("../schema/proposal");
const { makeDBOperationResponseMsg } = require("../../utils/utils");

// Functions
//
// READONLY methods
//
async function makeQueryByParams(params, collectionId, db) {
  /*
   *
   */
  const PrepsModel = db.model(collectionId, PrepsSchema, collectionId);
  const query = await PrepsModel.find(params);
  return query;
}
async function getAllPrepsData(collectionId, db) {
  /*
   * gets all prep
   */
  const query = await makeQueryByParams({}, collectionId, db);
  return query;
}

// UPDATE and/or CREATE methods
//
async function createPrep(prepData, collectionId, db) {
  /*
   * creates a new prep in the db
   */
  let operationResult = makeDBOperationResponseMsg(
    "Error: unknown error",
    false
  );
  let newProposal = null;

  try {
    const PrepsModel = db.model(collectionId, PrepsSchema, collectionId);
    newProposal = await new PrepsModel(prepData).save();
    operationResult = makeDBOperationResponseMsg(newProposal);
  } catch (err) {
    console.log("Catched Error.");
    console.log(err.name, err.message);
    operationResult = makeDBOperationResponseMsg(err, false);
  }

  return operationResult;
}

async function updatePrepById(newData, prepId, collectionId, db) {
  /*
   * update prep
   */
  const PrepsModel = db.model(collectionId, PrepsSchema, collectionId);
  const query = await PrepsModel.findByIdAndUpdate(prepId, newData);
  return query;
}

async function updatePrepDetailsByPrepId(newDetails, prepId, collectionId, db) {
  /*
   * update details.json of Prep
   */
  const query = await updateProposalById(
    { details: newDetails },
    prepId,
    collectionId,
    db
  );
  return query;
}

async function deleteOneByFilter(filter, collectionId, db) {
  /*
   *
   */
  const PrepsModel = db.model(collectionId, PrepsSchema, collectionId);
  const query = await PrepsModel.deleteOne(filter);
  return query;
}
async function deleteOnePrepByPrepAddress(address, collectionId, db) {
  //
  const query = await deleteOneByFilter({ address: address }, collectionId, db);
  return query;
}

module.exports = {
  getAllPrepsData,
  createPrep,
  updatePrepDetailsByPrepId,
  deleteOnePrepByPrepAddress
};
