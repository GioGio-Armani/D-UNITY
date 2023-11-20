# 🚀 Javascript full-stack 🚀

## MERN Stack

### React / Express / MongoDB / Redux

Démarrer le server : `npm start`

Démarrer le front : `cd client` + `npm start`

Ou lancer les deux en même temps : `npm run dev`

---

### Back config :

- Mettez vos informations de cluster dans `/config/db.js`
- Créez le fichier `.env` dans `/config/` entré les données suivantes
  - PORT=5000 `votre port localhost`
  - CLIENT_URL=http://localhost:3000 `votre URL client`
  - DB_USER_PASS=mongodb://127.0.0.1:27017/D-UNITY `votre URI MongoDB`
  - TOKEN_SECRET=990bf68e6adf1be5f1671bba3bec692056922454 `votre clé secrète aléatoire`

---

### Front config :

- Créez un fichier `.env` avec l'URL du serveur :
  - REACT_APP_API_URL=http://localhost:5000/ `l'url de votre serveur`

---

![Texte alternatif](./client/public/img/screenshotd.jpg "Capture d'écran")

💻 Réalisé par Giovan Hamadaïne, novembre 2023. Libre d'utilisation
