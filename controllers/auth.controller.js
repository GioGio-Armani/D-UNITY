const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const {
  signUpErrors,
  signInErrors,
  checkUserBeforeInsert,
} = require("../utils/errors.utils");

const maxAge = 24 * 60 * 60 * 1000;

const createToken = (id) => {
  return jwt.sign({ id }, process.env.TOKEN_SECRET, { expiresIn: maxAge });
};

module.exports = {
  signUp: async (req, res) => {
    const { email, password, pseudo } = req.body;
    const errors = await checkUserBeforeInsert(pseudo, email);
    if (Object.values(errors).some((item) => item !== "")) {
      console.log(errors);
      return res.status(400).json({ errors });
    }
    try {
      const user = await userModel.create({ email, password, pseudo });
      res.status(201).json({ user: user._id });
    } catch (err) {
      console.log(err);
      const errors = signUpErrors(err);
      res.status(400).json({ errors });
    }
  },
  signIn: async (req, res) => {
    const { email, password } = req.body;
    // console.log(req.body);
    try {
      const user = await userModel.login(email, password);
      const token = createToken(user._id);
      res.cookie("jwt", token, { httpOnly: true, maxAge });
      res.status(200).json({ user: user._id });
    } catch (err) {
      console.log(err);
      const errors = signInErrors(err);
      res.status(200).json({ errors });
    }
  },
  logout: (req, res) => {
    res.cookie("jwt", "", { maxAge: 1 });
    res.send({ succes: "logout" });
  },
};
