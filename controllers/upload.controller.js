const postModel = require("../models/post.model");
const userModel = require("../models/user.model");
const ObjectID = require("mongoose").Types.ObjectId;
const fs = require("fs");
const { promisify } = require("util");
const pipeline = promisify(require("stream").pipeline);
const { Readable } = require("stream");
const { uploadErrors } = require("../utils/errors.utils");

module.exports = {
  // upload img user -------------------
  uploadProfil: async (req, res) => {
    if (!ObjectID.isValid(req.body.userId))
      return res.status(400).send("ID unknown : " + req.body.userId);

    try {
      if (
        req.file.mimetype != "image/jpg" &&
        req.file.mimetype != "image/png" &&
        req.file.mimetype != "image/jpeg"
      ) {
        throw Error("invalid file");
      }

      if (req.file.size > 500000) throw Error("max size");
    } catch (err) {
      const errors = uploadErrors(err);
      return res.status(200).json({ errors });
    }

    const fileName = req.body.name + ".jpg";

    const uploadPath = __dirname + "/../client/public/uploads/profil/";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const readableStream = new Readable({
      read() {
        this.push(req.file.buffer);
        this.push(null);
      },
    });

    await pipeline(readableStream, fs.createWriteStream(uploadPath + fileName))
      .then(() => {
        console.log("image uploaded");
      })
      .catch((err) => {
        console.log(err);
      });

    try {
      await userModel
        .findByIdAndUpdate(
          req.body.userId,
          { $set: { picture: "./uploads/profil/" + fileName } },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        )
        .then(() => {
          res.status(200).json({ message: "Successfully updated. " });
        })
        .catch((err) => {
          console.log(err);
          res.status(401).json("Error updating data");
        });
    } catch (err) {
      return res.status(500).json(err);
    }
  },
};
