const express = require("express");
const validator = require("validator");
const logger = require("morgan");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

// bring all routes
const auth = require("./routes/api/auth");
const profile = require("./routes/api/profile");
const questions = require("./routes/api/questions");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(logger("combined"));
// Middleware for bodyparser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join("routes/public")));

//mongoDB Configuration
// mongoose.connect(process.env.MongoDB, { useNewUrlParser: true });
const db = require("./setup/myurl").mongoURL;

// Attempt to connect to database
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected Successfully!"))
  .catch(err => console.log(err));

//Passport middleware


// route
app.get("/", (req, res, next) => {
  res.send("Hey There Big Stack!");
});

//actual routes
app.use("/api/auth", auth);
app.use("/api/questions", questions);
app.use("/api/profile", profile);

app.listen(PORT, () => {
  console.log(`Listening On Port ${PORT}`);
});
