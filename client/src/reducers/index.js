import { combineReducers } from "redux";
import userReducer from "./user.reducer.js";
import usersReducer from "./users.reducer.js";
import postsReducer from "./posts.reducer.js";

export default combineReducers({
  userReducer,
  usersReducer,
  postsReducer,
});
