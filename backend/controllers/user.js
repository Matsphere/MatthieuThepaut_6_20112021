const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");

exports.signup = async (req, res, next) => {
  try {
    const hash = bcrypt.hash(req.body.password, 10);
    const user = new User({
      email: req.body.email,
      password: hash,
    });
    try {
      await user.save();
      res.status(201).json({ message: "Utilisateur créé !" });
    } catch (err) {
      res.status(400).json({ err });
    }
  } catch (err) {
    res.status(500).json({ err });
  }
};
exports.login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ error: "Utilisateur non trouvé !" });
    }
    try {
      const valid = await bcrypt.compare(req.body.password, user.password);
      if (!valid) {
        return res.status(401).json({ error: "Mot de passe incorrect !" });
      }
      res.status(200).json({
        userId: user._id,
        token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
          expiresIn: "24h",
        }),
      });
    } catch (err) {
      res.status(500).json({ error });
    }
  } catch (err) {
    res.status(500).json({ err });
  }
};

exports.loginLimiter = (req, res, next) =>{ rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  message:
    "Trop de tentative de connexion successive! Réessayez dans 15 minutes! ",
});};
