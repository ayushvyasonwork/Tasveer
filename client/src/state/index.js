import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mode: "light",
  user: null,
  token: null,
  posts: [],
  posts: [],
  users: [],
  conversations: {},
  activeChatUser: null,
};

export const mainSlice = createSlice({
  name: "main",
  initialState,
  reducers: {
    setMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
    setLogin: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    setLogout: (state) => {
      state.user = null;
      state.token = null;
    },
    setFriends: (state, action) => {
      if (state.user) {
        state.user.friends = action.payload.friends;
      } else {
        console.error("user friends non-existent :(");
      }
    },
    setPosts: (state, action) => {
      state.posts = action.payload.posts;
    },
    setPost: (state, action) => {
      const updatedPosts = state.posts.map((post) => {
        if (post._id === action.payload.post._id) return action.payload.post;
        return post;
      });
      state.posts = updatedPosts;
    },
    removePost: (state, action) => {
      state.posts = state.posts.filter(
        (post) => post._id !== action.payload.postId
      );
    },
    setUsers: (state, action) => {
      state.users = action.payload.users;
    },
    setActiveChatUser: (state, action) => {
      state.activeChatUser = action.payload.user;
    },
    setLastMessage: (state, action) => {
      const { userId, message } = action.payload;
      state.conversations[userId] = message;
    },
  },
});

export const {
  setMode,
  setLogin,
  setLogout,
  setFriends,
  setPosts,
  setPost,
  removePost,
  setUsers,
  setActiveChatUser,
  setLastMessage,
} = mainSlice.actions;
export default mainSlice.reducer;
