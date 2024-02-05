const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const user = require("./Routers/user.router");

const errorController = require("./Controllers/errorController");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));

app.use(express.json());
//app.use("/uploads/files", express.static("uploads/files"));

const port = 4000 || process.env.PORT;

mongoose
  .connect(process.env.MONGO_DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("mongodb connected.");
  })
  .catch((err) => console.log(err.message));

app.get("/test", (req, res, next) => {
  res.json({
    success: true,
    message: "Posted successfully ",
    // data: { id: savedPost._id },
  });
});

app.use("/user", user);

app.use(errorController);
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
