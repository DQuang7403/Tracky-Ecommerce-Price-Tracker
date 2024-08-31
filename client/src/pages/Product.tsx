import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import axios from "../api/axios";

import { Button } from "../components/ui/button";
import { Heart } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  selectCurrentUser,
  updateUserTrackedList,
} from "../redux/slice/authSlice";
import ProductDetails from "../layouts/ProductDetails";
import {
  useAddTrackedProductMutation,
  useDeleteTrackedProductMutation,
  useUpdateTrackedProductMutation,
} from "../redux/slice/userApiSlice";
import { setSelectedProduct } from "../redux/productSlice";
import PriceHistory from "../layouts/PriceHistory";
import { toast } from "../components/ui/use-toast";
import graphDataFormatter from "../utils/graphDataFormatter";
import ScheduledScrape from "../layouts/ProductOptions";
type ProductCardProp = {
  name: string;
  price: number;
  available: string;
  specialOffer: string | null;
  transportOffer: string;
  description: string[];
  priceHistory?: number[];
  dateHistory?: string[];
  site: string;
};
type TrackedProduct = {
  id: string;
  name: string;
};
export default function Product() {
  const { name } = useParams();
  const { state } = useLocation();
  const dispatch = useAppDispatch();
  const [productDetails, setProductDetails] = useState<ProductCardProp>(
    {} as ProductCardProp,
  );
  const [addTrackedProduct] = useAddTrackedProductMutation();
  const [deleteTrackedProduct] = useDeleteTrackedProductMutation();
  const [updateTrackedProduct, { isLoading: updateLoading }] =
    useUpdateTrackedProductMutation();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const currentUser = useAppSelector(selectCurrentUser);
  const seletedProduct = useAppSelector((state) => state.products.product);
  const [tracked, setTracked] = useState<TrackedProduct | null>(null);

  useEffect(() => {
    if (currentUser) {
      currentUser.trackedProducts.map((product: any) => {
        if (product.name === name) {
          setTracked({ id: product.id, name: product.name });
        }
      });
    }
  }, []);
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const fetchProductDetails = async () => {
      try {
        setIsLoading(true);
        const res = await axios.post(
          `/product/scrape`,
          {
            href: state.href,
            site: state.site,
          },
          {
            signal: controller.signal,
          },
        );
        if (res.status === 200) {
          setProductDetails(res.data);
          dispatch(
            setSelectedProduct({
              name: res.data.name,
              image: state.image,
              href: state.href,
              price: res.data.price,
              discount: state.discount,
              unit: state.unit,
              specialOffer: res.data.specialOffer,
              available: res.data.available,
              transportOffer: res.data.transportOffer,
              description: res.data.description,
              autoUpdateTargetPrice: res.data.autoUpdateTargetPrice,
              data: graphDataFormatter(
                res.data?.priceHistory,
                res.data?.dateHistory,
              ),
              site: state.site,
              targetPrice: res.data.targetPrice,
            }),
          );
        }
        setIsLoading(false);
      } catch (error: any) {
        console.log(error);
      }
    };
    if (seletedProduct === null || seletedProduct.name !== name) {
      fetchProductDetails();
    } else {
      setProductDetails(seletedProduct);
    }
    return () => {
      isMounted = false;
      isMounted && controller.abort();
    };
  }, [name, state.href]);

  const toggleFavorite = async () => {
    try {
      if (!tracked) {
        const res = await addTrackedProduct({
          name: productDetails.name,
          image: state.image,
          href: state.href,
          price: productDetails.price,
          discount: state.discount,
          unit: state.unit,
          specialOffer: productDetails.specialOffer,
          available: productDetails.available,
          transportOffer: productDetails.transportOffer,
          site: state.site,
        });
        if (res?.error?.status === 401) {
          toast({
            title: "Unauthorized",
            variant: "info",
            description: "You need to login to track products",
            action: (
              <Button>
                <Link to={"/authenticate"}>Login</Link>
              </Button>
            ),
          });
        }
        dispatch(
          updateUserTrackedList({ id: res.data.id, name: productDetails.name }),
        );
        dispatch(
          setSelectedProduct({
            name: res.data.product.name,
            image: state.image,
            href: state.href,
            price: res.data.product.price,
            discount: state.discount,
            unit: state.unit,
            specialOffer: res.data.product.specialOffer,
            available: res.data.product.available,
            transportOffer: res.data.product.transportOffer,
            description: res.data.product.description,
            data: graphDataFormatter(
              res.data.product?.priceHistory,
              res.data.product?.dateHistory,
            ),
            targetPrice: res.data.targetPrice,
            site: state.site,
          }),
        );
        setTracked({ id: res.data.id, name: productDetails.name });
      } else {
        const res = await deleteTrackedProduct({
          id: tracked.id,
        });
        if (res?.error?.status === 401) {
          toast({
            variant: "destructive",
            title: "Unauthorized",
            description: "You need to login first",
            action: <Link to={"/authenticate"}>Login</Link>,
          });
        }
        dispatch(
          updateUserTrackedList({ id: res.data.id, name: productDetails.name }),
        );
        setTracked(null);
      }
    } catch (error: any) {
      console.log(error);
    }
  };
  const updatePrice = async () => {
    try {
      const res = await updateTrackedProduct({
        href: state.href,
      });
      dispatch(
        setSelectedProduct({
          ...seletedProduct,
          name: res.data.name,
          image: state.image,
          href: state.href,
          price: res.data.price,
          discount: state.discount,
          unit: state.unit,
          specialOffer: res.data.specialOffer,
          available: res.data.available,
          transportOffer: res.data.transportOffer,
          data: graphDataFormatter(
            res.data?.priceHistory,
            res.data?.dateHistory,
          ),
          targetPrice: res.data.targetPrice,
          site: state.site,
        }),
      );
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <section className="px-1 sm:px-20 my-4 lg:my-10">
      <div>
        <div className="flex flex-col lg:flex-row items-top gap-4">
          <div className="lg:w-[550px] flex md:p-6 p-2 items-center justify-center aspect-square bg-blue shadow-xl bg-[#F2F2F2] rounded-lg relative">
            <Button
              disabled={isLoading}
              onClick={toggleFavorite}
              variant={"ghost"}
              size={"icon"}
              className="rounded-full bg-[#f2f2f2] absolute top-10 right-10 hover:bg-[#d9d9d9]"
            >
              <Heart
                color={`${tracked ? "#db4444" : "#353535"} `}
                fill={`${tracked ? "#db4444" : "transparent"} `}
              />
            </Button>

            <img src={`${state.image}`} loading="lazy" className="w-full" />
          </div>
          <ProductDetails
            isLoading={isLoading || updateLoading}
            productDetails={productDetails}
            state={state}
          />
        </div>

        {currentUser && tracked && (
          <>
            <div className="my-10 justify-between">
              <h1 className="text-2xl font-semibold">Product Statistics:</h1>
            </div>
            <div className="md:flex gap-4">
              <PriceHistory
                isLoading={isLoading}
                updatePrice={updatePrice}
                isAuthenticated={currentUser}
                data={seletedProduct?.data || []}
              />
              <ScheduledScrape
                isLoading={isLoading}
                productDetails={productDetails}
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
