const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const { ethers } = require("ethers");

const app = express();

const {
  calculateScore,
  distributeReward,
  getScore,
  getRanking,
} = require("./controller/gameController");

app.options("*", cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

require("dotenv").config();

const port = process.env.PORT;
const MongoURI = process.env.MONGOURI;

app.post("/calculateScore", calculateScore);
app.post("/distributeReward", distributeReward);
app.post("/getScore", getScore);
app.get("/getRanking", getRanking);

async function startApp() {
  await mongoose
    .connect(MongoURI)
    .then(() => console.log("MongoDB connected..."))
    .catch((err) => console.log(err));

  await app.listen(port, () => {
    console.log(`server listening at port: ${port}`);
  });
}

startApp();
