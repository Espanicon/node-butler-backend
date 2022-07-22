// database/schema/proposal.js

// Imports
const mongoose = require("mongoose");
const isIPFS = require("is-ipfs");
const {
  proposalStates,
  sponsorDepositStatus,
  voteTypes
} = require("../commons");
/*
 * CPS proposal schema
 */

const ProposalSchema = new mongoose.Schema({
  approve_voters: {
    type: Number,
    required: [true, "Please specify field"]
  },
  approved_reports: {
    type: Number,
    required: [true, "Please specify field"]
  },
  approved_votes: {
    type: Number,
    required: [true, "Please specify field"]
  },
  budget_adjustment: {
    type: Number,
    required: [true, "Please specify field"]
  },
  contributor_address: {
    type: String,
    required: [true, "Please specify field"],
    validate: {
      validator: v => {
        return /^hx([a-fA-F0-9]{40,40}$)/.test(v);
      },
      message: "{VALUE} is not a valid ICON address"
    }
  },
  ipfs_hash: {
    type: String,
    unique: [true, "hash already used in the db on other document"],
    required: [true, "Please specify field"],
    validate: {
      validator: v => {
        return isIPFS.cid(v);
      },
      message: "{VALUE} is not a valid IPFS hash"
    }
  },
  percentage_completed: {
    type: Number,
    required: [true, "Please specify field"]
  },
  project_duration: {
    type: Number,
    required: [true, "Please specify field"]
  },
  project_title: {
    type: String,
    required: [true, "Please specify field"]
  },
  reject_voters: {
    type: Number,
    required: [true, "Please specify field"]
  },
  rejected_votes: {
    type: Number,
    required: [true, "Please specify field"]
  },
  sponsor_address: {
    type: String,
    required: [true, "Please specify field"],
    validate: {
      validator: v => {
        return /^hx([a-fA-F0-9]{40,40}$)/.test(v);
      },
      message: "{VALUE} is not a valid ICON address"
    }
  },
  sponsor_deposit_amount: {
    type: Number,
    required: [true, "Please specify field"]
  },
  sponsor_deposit_status: {
    type: String,
    enum: [...sponsorDepositStatus],
    required: [true, "Please specify field"]
  },
  sponsor_vote_reason: {
    type: String,
    required: [true, "Please specify field"]
  },
  sponsored_timestamp: {
    type: Date,
    required: [true, "Please specify field"]
  },
  status: {
    type: String,
    enum: [...proposalStates],
    required: [true, "Please specify field"]
  },
  submit_progress_report: {
    type: Number,
    required: [true, "Please specify field"]
  },
  timestamp: {
    type: Date,
    required: [true, "Please specify field"]
  },
  token: {
    type: String,
    required: [true, "Please specify field"]
  },
  total_budget: {
    type: Number,
    required: [true, "Please specify field"]
  },
  total_voters: {
    type: Number,
    required: [true, "Please specify field"]
  },
  total_votes: {
    type: Number,
    required: [true, "Please specify field"]
  },
  tx_hash: {
    type: String,
    required: [true, "Please specify field"]
  },
  comments: [
    {
      address: {
        type: String,
        required: [true, "Please specify field"],
        unique: [true, "validator address must be unique"],
        validate: {
          validator: v => {
            return /^hx([a-fA-F0-9]{40,40}$)/.test(v);
          },
          message: "{VALUE} is not a valid ICON address"
        }
      },
      prep_name: {
        type: String,
        required: [true, "Please specify field"]
      },
      vote: {
        type: String,
        enum: [...voteTypes],
        required: [true, "Please specify field"]
      },
      vote_reason: {
        type: String,
        required: [true, "Please specify field"]
      }
    }
  ]
});

module.exports = {
  ProposalSchema
};
