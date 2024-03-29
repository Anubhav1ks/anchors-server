const express = require("express");
const router = express.Router();
const JWT = require("jsonwebtoken");
const createError = require("http-errors");
const {
  signup,
  Verifyotp,
  resendotp,
  Signin,
} = require("../Controllers/User/signup");
const {
  Createurl,
  getUserurl,
  getAllurl,
  deleteeurl,
  editurl,
} = require("../Controllers/User/url");

// ====================== GENERAL ============================

// ===========================================================================
// ------------------------ IMPORTS OVER -------------------------------------
// ===========================================================================

// ===========================================================================
// ====================== GENERAL ============================
// ----------- 2FA -------------
router.post("/signup", (req, res, next) => {
  signup(req, res, next);
});

router.post("/Verifyotp", (req, res, next) => {
  Verifyotp(req, res, next);
});
router.post("/resendotp", (req, res, next) => {
  resendotp(req, res, next);
});
router.post("/Signin", (req, res, next) => {
  Signin(req, res, next);
});
router.get("/getAllurl", (req, res, next) => {
  getAllurl(req, res, next);
});

// router.get('/:urlId',(req, res, next) => {
//   getAllurl(req, res, next);
// })

// ==========================================================
// ----------------- AUTHORIZATION MIDDLEWARE ---------------
// ===========================================================
router.use(function (req, res, next) {
  if (!req.headers["authorization"]) return next(createError.Unauthorized());
  const authHeader = req.headers["authorization"];
  const bearerToken = authHeader.split(" ");
  const token = bearerToken[1];
  JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
    if (err) {
      const message =
        err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
      return next(createError.Unauthorized(message));
    }
    req.payload = payload;
    res.locals.id = payload.id;

    next();
  });
});

// ===========================================================================
// ------------------------ Protected Routes ---------------------------------
// ===========================================================================
router.get("/getUserurl", (req, res, next) => {
  getUserurl(req, res, next);
});

router.post("/create/addurl", (req, res, next) => {
  Createurl(req, res, next);
});
router.post("/create/deleteurl", (req, res, next) => {
  deleteeurl(req, res, next);
});
router.post("/create/editurl", (req, res, next) => {
  editurl(req, res, next);
});

module.exports = router;
