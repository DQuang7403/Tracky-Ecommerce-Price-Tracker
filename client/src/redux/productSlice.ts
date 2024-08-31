import { createSlice } from "@reduxjs/toolkit";
type ProductsSliceType = {
  products: [] | {
    name : string;
    href : string;
    price : number;
    discount : number | null;
    specialOffer : string | null;
    image : string;
    unit : string;
    site: string;
  }[],
  loading: boolean,
  error: boolean,
  product: null | {
    name: string,
    image: string,
    href: string,
    price: number,
    discount: string| null,
    unit: string,
    specialOffer: string | null,
    available: string,
    transportOffer: string,
    description: string[],
    data?:any[];
    targetPrice: number,
    autoUpdateTargetPrice: boolean,
    site: string,
  },
}

const initialState : ProductsSliceType = {
  products: [],
  product: null,
  loading: false,
  error: false,
}

export const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    fetchOfferStart: (state) => {
      state.loading = true
    },
    fetchOfferSuccess: (state, action) => {
      state.loading = false,
      state.products = action.payload,
      state.error = true
    },
    fetchOfferError: (state) => {
      state.products = [],
      state.loading = false,
      state.error = true
    },
    setSelectedProduct: (state, action) => {
      state.product = action.payload;
    },
    
  }
})

export const {fetchOfferError, fetchOfferStart, fetchOfferSuccess, setSelectedProduct} = productSlice.actions
export default productSlice.reducer