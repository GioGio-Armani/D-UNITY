import React, { useEffect, useState } from "react";
import Routes from "./components/routes";
import { UidContext } from "./components/AppContext";
import axios from "axios";
import { useDispatch } from "react-redux";
import { getUser } from "./actions/user.actions";

function App() {
  const [uid, setUid] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchToken = async () => {
      await axios({
        method: "get",
        url: `${process.env.REACT_APP_API_URL}jwtid`,
        withCredentials: true,
      })
        .then((res) => {
          setUid(res.data);
          dispatch(getUser(res.data));
        })
        .catch((err) => {
          console.log("No token");
        });
    };
    const fetchCsrf = async () => {
      await axios({
        withCredentials: true,
        method: "get",
        url: `${process.env.REACT_APP_API_URL}csrf-token`,
      })
        .then((res) => {
          axios.defaults.headers["X-CSRF-Token"] = res.data.csrfToken;
        })
        .catch((err) => {
          console.log("No csrf token");
        });
    };
    fetchCsrf();
    fetchToken();
  }, [uid, dispatch]);

  return (
    <UidContext.Provider value={uid}>
      <Routes />
    </UidContext.Provider>
  );
}

export default App;
