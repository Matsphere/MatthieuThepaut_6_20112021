const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const userCtrl = require("../controllers/user");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message:
    "Trop de tentative de connexion successive! Réessayez dans 15 minutes! ",
});

router.post("/signup", userCtrl.signup);
router.post("/login", limiter, userCtrl.login);

module.exports = router;
