const userModel = require("../models/user.model");

module.exports = {
  checkUserBeforeInsert: async (pseudo, email) => {
    let errors = { pseudo: "", email: "" };

    if (pseudo.trim() === "") {
      errors.pseudo = "Le pseudo est obligatoire";
    }
    if (email.trim() === "") {
      errors.email = "L'email est obligatoire";
    }
    // Vérifiez si le pseudo existe déjà
    const pseudoExists = await userModel.findOne({ pseudo });
    if (pseudoExists) {
      errors.pseudo = "Ce pseudo est déjà pris";
    }

    // Vérifiez si l'email existe déjà
    const emailExists = await userModel.findOne({ email });
    if (emailExists) {
      errors.email = "Cet email est déjà enregistré";
    }

    return errors;
  },

  signUpErrors: (err) => {
    let errors = { pseudo: "", email: "", password: "" };
    if (err.message.includes("pseudo")) errors.pseudo = "Pseudo incorrect";
    if (err.message.includes("email")) errors.email = "Email incorrect";
    if (err.message.includes("password"))
      errors.password = "Le mot de passe doit faire 6 caractères minimum";

    return errors;
  },
  signInErrors: (err) => {
    console.log(err.message);
    let errors = { login: "" };
    if (err.message.includes("incorrect")) errors.login = "Login incorrect";
    return errors;
  },

  uploadErrors: (err) => {
    let errors = { format: "", maxSize: "" };
    if (err.message.includes("invalid file"))
      errors.format = "Format incompatible";
    if (err.message.includes("max size"))
      errors.maxSize = "Le fichier dépasse 500ko";
    return errors;
  },
};
