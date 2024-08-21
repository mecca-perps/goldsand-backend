const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.options("*", cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

require("dotenv").config();

const port = process.env.PORT;
const MongoURI = process.env.MONGOURI;

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
