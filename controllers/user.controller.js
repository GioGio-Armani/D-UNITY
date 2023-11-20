const userModel = require("../models/user.model");
const ObjectID = require("mongoose").Types.ObjectId;

module.exports = {
  getAllUsers: async (req, res) => {
    const users = await userModel.find().select("-password");
    res.status(201).json(users);
  },
  userInfo: async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send("ID unknown : " + req.params.id);
    try {
      const user = await userModel.findById(req.params.id).select("-password");
      if (!user) return res.status(400).send("Utilisateur non trouvé");
      res.status(201).json(user);
    } catch (err) {
      console.log("ID inconnu" + err);
      res.status(500).json({ message: err });
    }
  },
  updateUser: async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send("ID unknown : " + req.params.id);
    try {
      const updatedUser = await userModel
        .findOneAndUpdate(
          { _id: req.params.id },
          {
            $set: {
              bio: req.body.bio,
            },
          },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        )
        .select("-password");

      // Vérifiez si l'utilisateur a bien été mis à jour
      if (!updatedUser) {
        return res.status(400).send("Utilisateur non trouvé");
      }

      // Renvoyez les informations de l'utilisateur mis à jour
      res.status(201).send(updatedUser);
    } catch (err) {
      // Gestion des erreurs
      console.error("Erreur de mise à jour : " + err);
      res.status(500).json({
        message: "Erreur lors de la mise à jour de l'utilisateur : " + err,
      });
    }
  },

  deleteUser: async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send("ID unknown : " + req.params.id);
    try {
      await userModel.deleteOne({ _id: req.params.id }).exec();
      res.status(201).json({ message: "Utilisateur supprimé avec succès" });
    } catch (err) {
      console.log("ID inconnu" + err);
      res.status(500).json({ message: err });
    }
  },

  follow: async (req, res) => {
    if (
      !ObjectID.isValid(req.params.id) ||
      !ObjectID.isValid(req.body.idToFollow)
    )
      return res.status(400).send("ID unknown : " + req.params.id);
    try {
      // Ajoute l'utilisateur à la liste des followers de l'utilisateur ciblé
      const user = await userModel.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { following: req.body.idToFollow } },
        { new: true, upsert: true }
      );

      // Ajoute l'utilisateur à la liste des following de l'utilisateur ciblé

      await userModel.findByIdAndUpdate(
        req.body.idToFollow,
        { $addToSet: { followers: req.params.id } },
        { new: true, upsert: true }
      );

      res.status(201).json({ message: "Utilisateur suivi" });
    } catch (err) {
      return res.status(500).json({ message: err });
    }
  },
  unfollow: async (req, res) => {
    if (
      !ObjectID.isValid(req.params.id) ||
      !ObjectID.isValid(req.body.idToUnfollow)
    )
      return res.status(400).send("ID unknown : " + req.params.id);
    try {
      // Ajoute l'utilisateur à la liste des followers de l'utilisateur ciblé
      const user = await userModel.findByIdAndUpdate(
        req.params.id,
        { $pull: { following: req.body.idToUnfollow } },
        { new: true, upsert: true }
      );

      // Ajoute l'utilisateur à la liste des following de l'utilisateur ciblé

      await userModel.findByIdAndUpdate(
        req.body.idToUnfollow,
        { $pull: { followers: req.params.id } },
        { new: true, upsert: true }
      );

      res.status(201).json({ message: "Utilisateur unfollow" });
    } catch (err) {
      return res.status(500).json({ message: err });
    }
  },
};
