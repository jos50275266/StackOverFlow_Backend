const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
  res.json({ profile: "profile" });
});

module.exports = router;
