// database/services/preps.js

// Imports
//
const { PrepsSchema } = require("../schema/preps");
const { makeDBOperationResponseMsg } = require("../../utils/utils");

// Functions
//
// READONLY methods
//
async function makeQueryByParams(params, prepsCollection, db) {
  /*
   *
   */
  const PrepsModel = db.model(prepsCollection, PrepsSchema, prepsCollection);
  const query = await PrepsModel.find(params);
  return query;
}

async function getAllPrepsData(prepsCollection, db) {
  /*
   * gets all prep
   */
  const query = await makeQueryByParams({}, prepsCollection, db);
  return query;
}

async function getPrepByPrepAddress(address, prepsCollection, db) {
  /*
   * get prep by address
   */
  const query = await makeQueryByParams(
    { address: address },
    prepsCollection,
    db
  );
  return query;
}

// UPDATE and/or CREATE methods
//
async function createPrep(prepData, prepsCollection, db) {
  /*
   * creates a new prep in the db
   */
  let operationResult = makeDBOperationResponseMsg(
    "Error: unknown error",
    false
  );
  let newProposal = null;

  try {
    const PrepsModel = db.model(prepsCollection, PrepsSchema, prepsCollection);
    newProposal = await new PrepsModel(prepData).save();
    operationResult = makeDBOperationResponseMsg(newProposal);
  } catch (err) {
    console.log("Catched Error.");
    console.log(err.name, err.message);
    operationResult = makeDBOperationResponseMsg(err, false);
  }

  return operationResult;
}

async function updatePrepById(newData, prepId, prepsCollection, db) {
  /*
   * update prep
   */
  const PrepsModel = db.model(prepsCollection, PrepsSchema, prepsCollection);
  const query = await PrepsModel.findByIdAndUpdate(prepId, newData);
  return query;
}

async function updatePrepDetailsByPrepId(
  newDetails,
  prepId,
  prepsCollection,
  db
) {
  /*
   * update details.json of Prep
   */
  const query = await updateProposalById(
    { details: newDetails },
    prepId,
    prepsCollection,
    db
  );
  return query;
}

async function deleteOneByFilter(filter, prepsCollection, db) {
  /*
   *
   */
  const PrepsModel = db.model(prepsCollection, PrepsSchema, prepsCollection);
  const query = await PrepsModel.deleteOne(filter);
  return query;
}
async function deleteOnePrepByPrepAddress(address, prepsCollection, db) {
  //
  const query = await deleteOneByFilter(
    { address: address },
    prepsCollection,
    db
  );
  return query;
}

module.exports = {
  getAllPrepsData,
  createPrep,
  updatePrepById,
  getPrepByPrepAddress,
  updatePrepDetailsByPrepId,
  deleteOnePrepByPrepAddress
};
