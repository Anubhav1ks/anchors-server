const express = require("express");
const { oepnOriginalUrl } = require("../Controllers/User/url");
const router = express.Router();

router.get("/:urlId", (req, res, next) => {
  oepnOriginalUrl(req, res, next);
});

module.exports = router;
