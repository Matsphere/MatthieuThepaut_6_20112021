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
    await sauce.save();
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
    await Sauce.updateOne(
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
    sauces.forEach((sauce) => {
      sauce.imageUrl = process.env.URL + process.env.DIR + sauce.imageUrl;
    });
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
    const userId = req.body.userId;
    const like = req.body.like;
    // if (userId == sauce.userId) {
    //   throw new Error("L'auteur de la sauce ne peut pas voter!");
    // }
    switch (like) {
      case -1:
        await Sauce.updateOne(
          { _id: sauce._id },
          {
            $inc: { dislikes: 1 },
            $push: { usersDisliked: userId },
          }
        );
        res.status(201).json("Vote enregistré!");
        break;

      case 0:
        if (sauce.usersDisliked.find((user) => user == userId)) {
          await Sauce.updateOne(
            { _id: sauce._id },
            {
              $inc: { dislikes: -1 },
              $pull: { usersDisliked: userId },
            }
          );
          res.status(201).json("Vote enregistré!");
        }

        if (sauce.usersLiked.find((user) => user == userId)) {
          await Sauce.updateOne(
            { _id: sauce._id },
            {
              $inc: { likes: -1 },
              $pull: { usersLiked: userId },
            }
          );
          res.status(201).json("Vote enregistré!");
        }
        break;

      case 1:
        await Sauce.updateOne(
          { _id: sauce._id },
          {
            $inc: { likes: 1 },
            $push: { usersLiked: userId },
          }
        );
        res.status(201).json("Vote enregistré!");
        break;

      default:
        res.status(400).json("Mauvaise requête!");
    }
  } catch (err) {
    res.status(400).json({ err });
  }
};
