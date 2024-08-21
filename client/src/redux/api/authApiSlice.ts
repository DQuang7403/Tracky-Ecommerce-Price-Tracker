import { apiSlice } from "./apiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder: any) => ({
      login: builder.mutation({
          query: (credentials: any) => ({
              url: '/auth/login',
              method: 'POST',
              body: { ...credentials },
              invalidatesTags: ['Auth']
          })
      }),
      signup: builder.mutation({
        query: (credential: any) => ({
            url: `/auth/signup`,
            method: 'POST',
            body: { ...credential },
            invalidatesTags: ['Auth']
        })
      })
  })
  })
  
  export const { useLoginMutation, useSignupMutation }: any = authApiSlice