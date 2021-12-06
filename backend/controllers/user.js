const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const validator = require("password-validator");

let schema = new validator();

schema
  .is()
  .min(8)
  .is()
  .max(20)
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .digits()
  .has()
  .not()
  .spaces();

exports.signup = async (req, res, next) => {
  try {
    try {
      if (!schema.validate(req.body.password))
        throw new Error(
          "Le mot de passe doit contenir 8 caractères au minimum dont au moins une majuscule et un chiffre"
        );
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
    try {
      const hash = await bcrypt.hash(req.body.password, 10);
      const user = new User({
        email: req.body.email,
        password: hash,
      });

      const data = await user.save();
      res.status(201).json({ message: "Utilisateur créé !" });
    } catch (err) {
      res.status(400).json({ message: "Email déjà utilisé" });
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
