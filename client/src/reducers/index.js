import { combineReducers } from "redux";
import userReducer from "./user.reducer.js";
import usersReducer from "./users.reducer.js";
import postsReducer from "./posts.reducer.js";
import errorReducer from "./error.reducer.js";
import allPostsReducer from "./allPosts.reducer.js";
import trendingReducer from "./trending.reducer.js";

export default combineReducers({
  userReducer,
  usersReducer,
  postsReducer,
  errorReducer,
  allPostsReducer,
  trendingReducer,
});
