import React, { useRef, useState } from "react";
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
  const pseudoError = useRef(null);
  const emailError = useRef(null);
  const passwordError = useRef(null);
  const handleRegister = async (e) => {
    e.preventDefault();

    // Sélectionner tous les éléments d'erreur et les réinitialiser
    const errorElements = document.querySelectorAll(".error");
    errorElements.forEach((element) => {
      element.innerHTML = "";
    });

    const terms = document.getElementById("terms");
    // Valider les données
    await validationSchema
      .validate(
        { pseudo, email, password, controlPassword, terms: terms.checked },
        { abortEarly: false }
      )
      .then(async () => {
        await axios({
          method: "post",
          url: `${process.env.REACT_APP_API_URL}api/user/register`,
          withCredentials: true,
          data: { pseudo, email, password },
        })
          .then((res) => {
            if (res.data.errors) {
              console.log(res.data.errors);
              pseudoError.current.innerHTML = res.data.errors.pseudo;
              emailError.current.innerHTML = res.data.errors.email;
            } else {
              setFormSubmit(true);
            }
          })
          .catch((err) => {
            console.log(err);
            if (err.response.data.errors) {
              pseudoError.current.innerHTML = err.response.data.errors.pseudo;
              emailError.current.innerHTML = err.response.data.errors.email;
            } else if (err.response.data.error.password) {
              passwordError.current.innerHTML =
                err.response.data.errors.password;
            }
          });
      })
      .catch((err) => {
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
      });
  };

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
          <div className="pseudo error" ref={pseudoError}></div>
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
          <div className="email error" ref={emailError}></div>
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
          <div className="password error" ref={passwordError}></div>
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
