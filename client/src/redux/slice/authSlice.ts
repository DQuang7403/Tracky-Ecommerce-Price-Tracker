import { createSlice } from "@reduxjs/toolkit/react";
type UserInfo = {
  user_info: null | {
  _id: string,
  name: string,
  email: string,
  createdAt: string,
  updatedAt: string,
  receiveGmail: boolean,
  signWithGoogle: boolean,
  autoUpdateConfig: {
    frequency: string,
    hour: string,
    minute: string,
    day: string,
  }
  trackedProducts: {
    id: string,
    name: string,
  }[],
}
  access_token: null | string
}
const initialState: UserInfo = {
  user_info : null,
  access_token:  null,
}
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logIn: (state, action) => {
      const {user_info, access_token} = action.payload
      state.user_info = user_info;
      state.access_token = access_token;
    },
    logOut: (state) => {
      state.user_info = null;
      state.access_token = null;
    },
    updateUserTrackedList: (state, action) => {
      if (state.user_info && state.user_info.trackedProducts.filter(user => user.id === action.payload.id).length > 0) {
        state.user_info.trackedProducts.splice(state.user_info.trackedProducts.findIndex(user => user.id === action.payload.id), 1);
      } else {
        if (state.user_info) {
          state.user_info.trackedProducts.push(action.payload);
        }
      }
    },
    updateUserInfo: (state, action) => {
      if(state.user_info) {
        state.user_info = action.payload
      }
    }
  },
})

export const {logIn, logOut, updateUserTrackedList, updateUserInfo}  = authSlice.actions

export default authSlice.reducer

export const selectCurrentUser = (state: any) => state.auth.user_info
export const selectCurrentToken = (state: any) => state.auth.access_token