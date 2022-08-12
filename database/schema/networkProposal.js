// database/schema/networkProposal.js

// Imports
const mongoose = require("mongoose");
/*
 * network proposal schema
 */

const NetworkProposalSchema = new mongoose.Schema({
  apply: {
    was_applied: { type: Boolean, required: [true, "Please specify field"] },
    address: { type: String },
    id: { type: String },
    name: { type: String },
    timestamp: { type: String }
  },
  contents: {
    description: { type: String, required: [true, "Please specify field"] },
    title: { type: String, required: [true, "Please specify field"] },
    type: { type: String, required: [true, "Please specify field"] }
  },
  vote: {
    agree: {
      amount: {
        type: String
      },
      count: {
        type: String
      }
    },
    disagree: {
      amount: {
        type: String
      },
      count: {
        type: String
      }
    },

    noVote: {
      amount: {
        type: String
      },
      count: {
        type: String
      }
    }
  },
  endBlockHeight: { type: String, required: [true, "Please specify field"] },
  id: { type: String, required: [true, "Please specify field"] },
  proposer: { type: String, required: [true, "Please specify field"] },
  proposerName: { type: String, required: [true, "Please specify field"] },
  startBlockHeight: { type: String, required: [true, "Please specify field"] },
  status: { type: String, required: [true, "Please specify field"] }
});

module.exports = {
  NetworkProposalSchema
};
