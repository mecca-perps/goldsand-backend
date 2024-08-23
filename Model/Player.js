const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema({
  score: {
    type: Number,
    default: 0
  },
  lastPlayed: {
    type: Number,
  },
  count: {
    type: Number,
    default: 0
  },
  walletAddress: {
    type: String,
  },
});

const Player = mongoose.model("Player", PlayerSchema);

module.exports = Player;
