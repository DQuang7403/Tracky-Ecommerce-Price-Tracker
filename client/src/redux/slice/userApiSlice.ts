import { apiSlice } from "../api/apiSlice";

export const userApiSlice = apiSlice.injectEndpoints({
  tagTypes: ["Tracked"],
  endpoints: (builder: any) => ({
    getTrackedProducts: builder.query({
      query: () => `/product/tracked`,
      providesTags: ['Tracked']
    }),
    overrideExisting: true,
    addTrackedProduct: builder.mutation({
      query: (body : any) => ({
        url: `/product/add`,
        method: 'POST',
        body: { ...body },
      }),
      invalidatesTags: ['Tracked']
    }),
    deleteTrackedProduct: builder.mutation({
      query: (body: any) => ({
        url: `/product/tracked-product/${body.id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tracked']
    }),
    updateTrackedProduct: builder.mutation({
      query: (body: any) => ({
        url: `/product/tracked-product/`,
        method: 'PUT',
        body: { ...body },
      }),
      invalidatesTags: ['Tracked']
    }),
    updateTargetPrice: builder.mutation({
      query: (body: any) => ({
        url: `/product/target-price`,
        method: 'PUT',
        body: { ...body },
      })
    }), 

    //update user info
    updateUser: builder.mutation({
      query: (body: any) => ({
        url: `/user/update`,
        method: 'PUT',
        body: { ...body },
      })
    })
    
  })
})

export const { useGetTrackedProductsQuery, useAddTrackedProductMutation, useDeleteTrackedProductMutation, useUpdateTrackedProductMutation, useUpdateTargetPriceMutation, useUpdateUserMutation }: any = userApiSlice