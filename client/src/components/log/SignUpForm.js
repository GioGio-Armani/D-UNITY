import React, { useState } from "react";
import axios from "axios";
import SignInForm from "./SignInForm";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
  pseudo: Yup.string()
    .required("Le pseudo est requis")
    .min(3, "Trop court")
    .max(55, "Trop long"),
  email: Yup.string().email("Email invalide").required("L'email est requis"),
  password: Yup.string()
    .required("Le mot de passe est requis")
    .min(6, "Trop court")
    .max(1024, "Trop long"),
  controlPassword: Yup.string()
    .required("La confirmation est requise")
    .oneOf(
      [Yup.ref("password"), null],
      "Les mots de passe doivent correspondre"
    ),
  terms: Yup.boolean().oneOf(
    [true],
    "Veuillez accepter les conditions générales"
  ),
});

const SignUpForm = () => {
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [controlPassword, setControlPassword] = useState("");
  const [formSubmit, setFormSubmit] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const terms = document.getElementById("terms");
      // Valider les données
      await validationSchema.validate(
        { pseudo, email, password, controlPassword, terms: terms.checked },
        { abortEarly: false }
      );

      // Si la validation est réussie, envoie les données
      await axios({
        method: "post",
        url: `${process.env.REACT_APP_API_URL}api/user/register`,
        withCredentials: true,
        data: { pseudo, email, password },
      });
      setFormSubmit(true);
    } catch (err) {
      const errors = {};

      // Parcourir chaque erreur et stocker uniquement la première pour chaque champ
      err.inner.forEach((error) => {
        // Si une erreur pour ce champ n'a pas déjà été enregistrée, l'enregistrer
        if (!errors[error.path]) {
          errors[error.path] = error.message;
        }
      });

      // Mettre à jour l'UI avec les erreurs
      for (const [path, message] of Object.entries(errors)) {
        const errorField = document.querySelector(`.${path}.error`);
        if (errorField) {
          errorField.innerHTML = message;
        }
      }
    }
  };

  // const handleRegister = async (e) => {
  //   e.preventDefault();
  //   const terms = document.getElementById("terms");
  //   const pseudoError = document.querySelector(".pseudo.error");
  //   const emailError = document.querySelector(".email.error");
  //   const passwordError = document.querySelector(".password.error");
  //   const passwordConfirmError = document.querySelector(
  //     ".password-confirm.error"
  //   );
  //   const termsError = document.querySelector(".terms.error");

  //   passwordConfirmError.innerHTML = "";
  //   termsError.innerHTML = "";

  //   if (password !== controlPassword || !terms.checked) {
  //     if (password !== controlPassword)
  //       passwordConfirmError.innerHTML =
  //         "Les mots de passe ne correspondent pas";
  //     if (!terms.checked)
  //       termsError.innerHTML = "Veuillez valider les conditions générales";
  //   } else {
  //     await axios({
  //       method: "post",
  //       url: `${process.env.REACT_APP_API_URL}api/user/register`,
  //       withCredentials: true,
  //       data: {
  //         pseudo,
  //         email,
  //         password,
  //       },
  //     })
  //       .then((res) => {
  //         console.log(res);
  //         setFormSubmit(true);
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //         pseudoError.innerHTML = err.response.data.errors.pseudo;
  //         emailError.innerHTML = err.response.data.errors.email;
  //         if (err.response.data.errors.password)
  //           passwordError.innerHTML = err.response.data.errors.password;
  //       });
  //   }
  // };

  return (
    <>
      {formSubmit ? (
        <>
          <SignInForm />
          <span></span>
          <h4 className="success">
            Enregistrement réussi, veuillez vous connecter
          </h4>
        </>
      ) : (
        <form action="" onSubmit={handleRegister} id="sign-up-form">
          <label htmlFor="pseudo">Pseudo</label>
          <br />
          <input
            type="text"
            name="pseudo"
            id="pseudo"
            onChange={(e) => setPseudo(e.target.value)}
            value={pseudo}
          />
          <div className="pseudo error"></div>
          <br />
          <label htmlFor="email">Email</label>
          <br />
          <input
            type="text"
            name="email"
            id="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
          <div className="email error"></div>
          <br />
          <label htmlFor="password">Mot de passe</label>
          <br />
          <input
            type="password"
            name="password"
            id="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          <div className="password error"></div>
          <br />
          <label htmlFor="password-conf">Confirmer mot de passe</label>
          <br />
          <input
            type="password"
            name="password"
            id="password-conf"
            onChange={(e) => setControlPassword(e.target.value)}
            value={controlPassword}
          />
          <div className="controlPassword error"></div>
          <br />
          <input type="checkbox" id="terms" />
          <label htmlFor="terms">
            J'accepte les{" "}
            <a href="/" target="_blank" rel="noopener noreferrer">
              termes et conditions
            </a>
          </label>
          <div className="terms error"></div>
          <br />
          <input type="submit" value="Valider inscription" />
        </form>
      )}
    </>
  );
};

export default SignUpForm;
