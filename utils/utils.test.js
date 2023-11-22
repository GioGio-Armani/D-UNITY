const { uploadErrors } = require("./errors.utils");
const { signInErrors } = require("./errors.utils");
const { signUpErrors } = require("./errors.utils");
const { checkUserBeforeInsert } = require("./errors.utils");
const userModel = require("../models/user.model");

jest.mock("../models/user.model");

describe("checkUserBeforeInsert", () => {
  it("should return errors when pseudo and email are empty", async () => {
    const errors = await checkUserBeforeInsert(" ", " ");
    expect(errors).toEqual({
      pseudo: "Le pseudo est obligatoire",
      email: "L'email est obligatoire",
    });
  });

  it("should return errors when pseudo and email already exist", async () => {
    userModel.findOne.mockImplementation((query) => Promise.resolve(true));

    const errors = await checkUserBeforeInsert(
      "existingPseudo",
      "existingEmail"
    );
    expect(errors).toEqual({
      pseudo: "Ce pseudo est déjà pris",
      email: "Cet email est déjà enregistré",
    });
  });

  it("should return no errors when pseudo and email are unique and not empty", async () => {
    userModel.findOne.mockImplementation((query) => Promise.resolve(false));

    const errors = await checkUserBeforeInsert("uniquePseudo", "uniqueEmail");
    expect(errors).toEqual({
      pseudo: "",
      email: "",
    });
  });
});

describe("signUpErrors", () => {
  it('should return pseudo error when error message includes "pseudo"', () => {
    const errors = signUpErrors({ message: "pseudo" });
    expect(errors).toEqual({
      pseudo: "Pseudo incorrect",
      email: "",
      password: "",
    });
  });

  it('should return email error when error message includes "email"', () => {
    const errors = signUpErrors({ message: "email" });
    expect(errors).toEqual({
      pseudo: "",
      email: "Email incorrect",
      password: "",
    });
  });

  it('should return password error when error message includes "password"', () => {
    const errors = signUpErrors({ message: "password" });
    expect(errors).toEqual({
      pseudo: "",
      email: "",
      password: "Le mot de passe doit faire 6 caractères minimum",
    });
  });

  it('should return no errors when error message does not include "pseudo", "email", or "password"', () => {
    const errors = signUpErrors({ message: "other error" });
    expect(errors).toEqual({
      pseudo: "",
      email: "",
      password: "",
    });
  });
});

describe("signInErrors", () => {
  it('should return login error when error message includes "incorrect"', () => {
    const errors = signInErrors({ message: "incorrect" });
    expect(errors).toEqual({
      login: "Login incorrect",
    });
  });

  it('should return no errors when error message does not include "incorrect"', () => {
    const errors = signInErrors({ message: "other error" });
    expect(errors).toEqual({
      login: "",
    });
  });
});

describe("uploadErrors", () => {
  it('should return format error when error message includes "invalid file"', () => {
    const errors = uploadErrors({ message: "invalid file" });
    expect(errors).toEqual({
      format: "Format incompatible",
      maxSize: "",
    });
  });

  it('should return maxSize error when error message includes "max size"', () => {
    const errors = uploadErrors({ message: "max size" });
    expect(errors).toEqual({
      format: "",
      maxSize: "Le fichier dépasse 500ko",
    });
  });

  it('should return no errors when error message does not include "invalid file" or "max size"', () => {
    const errors = uploadErrors({ message: "other error" });
    expect(errors).toEqual({
      format: "",
      maxSize: "",
    });
  });
});
