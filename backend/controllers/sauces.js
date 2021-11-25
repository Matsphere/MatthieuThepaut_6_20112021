const Sauce = require("../models/sauce");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();

exports.createSauce = async (req, res, next) => {
  try {
    const sauceObject = JSON.parse(req.body.sauce);
    const sauce = new Sauce({
      ...sauceObject,
      imageUrl: req.file.filename,
    });
    const data = await sauce.save();
    res.status(201).json({ message: "Sauce enregistrée !" });
  } catch (err) {
    res.status(400).json({ err });
  }
};

exports.getOneSauce = async (req, res, next) => {
  try {
    const sauce = await Sauce.findOne({
      _id: req.params.id,
    });
    const fileName = sauce.imageUrl;
    sauce.imageUrl = process.env.URL + process.env.DIR + fileName;
    res.status(200).json(sauce);
  } catch (err) {
    res.status(404).json({
      error: error,
    });
  }
};

exports.modifySauce = async (req, res, next) => {
  try {
    const sauceObject = req.file
      ? {
          ...JSON.parse(req.body.sauce),
          imageUrl: req.file.filename,
        }
      : { ...req.body };
    const newSauce = await Sauce.updateOne(
      { _id: req.params.id },
      { ...sauceObject, _id: req.params.id }
    );
    res.status(200).json({ message: "Sauce modifiée !" });
  } catch (err) {
    res.status(400).json({ error });
  }
};

exports.deleteSauce = async (req, res, next) => {
  try {
    const sauce = await Sauce.findOne({ _id: req.params.id });
    const filename = sauce.imageUrl;
    fs.unlink(`images/${filename}`, async () => {
      try {
        await Sauce.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: "Sauce supprimée !" });
      } catch (err) {
        res.status(400).json({ err });
      }
    });
  } catch (err) {
    res.status(500).json({ err });
  }
};

exports.getAllSauces = async (req, res, next) => {
  try {
    const sauces = await Sauce.find();
    res.status(200).json(sauces);
  } catch (err) {
    res.status(400).json({
      error: error,
    });
  }
};

exports.feedback = async (req, res, next) => {
  try {
    const sauce = await Sauce.findOne({ _id: req.params.id });
    const userId = req.userId;
    const like = req.like;
    switch (like) {
      case -1:
        if (userId == sauce.userId) {
          throw "L'auteur de la sauce ne peut pas voter!";
        }
        sauces.dislikes++;
        sauces.usersDisliked.push(userId);
        break;

      case 0:
        if (sauce.usersDisliked.findindex((id) => id == userId) > -1) {
          const index = sauce.usersDisliked.findindex((id) => id == userId);
          sauces.dislikes--;
          sauces.usersDisliked.splice(index, 1);
          break;
        } else {
          const index = sauce.usersliked.findindex((id) => id == userId);
          sauces.likes--;
          sauces.usersLiked.splice(index, 1);
          break;
        }

      case 1:
        if (userId == sauce.userId) {
          throw "L'auteur de la sauce ne peut pas voter!";
        }
        sauces.likes++;
        sauces.usersLiked.push(userId);
        break;
    }
  } catch (err) {
    res.status(400).json({
      error: err,
    });
  }
};
