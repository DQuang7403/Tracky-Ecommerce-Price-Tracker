import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import {logIn, logOut} from "../slice/authSlice"
import { createApi } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  //TODO: add base url
  baseUrl: import.meta.env.VITE_BACKEND_API_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as any).auth.access_token
    if(token) {
      headers.set("authorization", `Bearer ${token}`);
      
    }
    return headers;
  }
})
// : Promise<any>
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result?.error?.status === 403) {
      // send refresh token to get new access token 
      const refreshResult = await baseQuery('/auth/refresh', api, extraOptions)
      if (refreshResult?.data) {
          api.getState().auth.user_info
          // store the new token 
          api.dispatch(logIn({ ...refreshResult.data }))
          // retry the original query with new access token 
          result = await baseQuery(args, api, extraOptions)
      } else {
          api.dispatch(logOut())
          
      }
  }

  return result
}

export const apiSlice: any = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Tracked", "Auth"],
  endpoints: (_builder: any) => ({})
})