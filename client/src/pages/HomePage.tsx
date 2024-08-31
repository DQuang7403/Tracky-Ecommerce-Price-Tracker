import { useCallback, useEffect, useRef } from "react";
import ProductCard from "../components/ProductCard";
import { Button } from "../components/ui/button";
import Spline from "@splinetool/react-spline";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel";
import { ProductCardProp } from "../utils/constants";
import axios from "../api/axios";
import {
  fetchOfferError,
  fetchOfferStart,
  fetchOfferSuccess,
} from "../redux/productSlice";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { toast } from "../components/ui/use-toast";
import { selectCurrentUser } from "../redux/slice/authSlice";
import { Link } from "react-router-dom";
export default function HomePage() {
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector((state) => state.products);
  const currentUser = useAppSelector(selectCurrentUser);
  const offersRef = useRef<HTMLDivElement>(null);
  const fetchOffers = useCallback(async () => {
    try {
      dispatch(fetchOfferStart());
      const res = await axios.get("/product/offer");
      if (res.status === 200 && res.data === "") {
        toast({
          title: "ERROR",
          description: "No offers found or something went wrong",
          variant: "destructive",
        });
        dispatch(fetchOfferError());
      } else if (res.status === 200 && res.data.length > 0) {
        dispatch(fetchOfferSuccess(res.data));
      }
    } catch (error) {
      dispatch(fetchOfferError());
      console.error(error);
    }
  }, [dispatch]);

  useEffect(() => {
    const getInitialProducts = async () => {
      dispatch(fetchOfferStart());
      try {
        const res = await axios.get("/product/today-sale");
        if (res.status === 200) {
          dispatch(fetchOfferSuccess(res.data));
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch products",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (products === null || products.length === 0  ) {
      getInitialProducts();
    }
  }, [products]);

  return (
    <section className="px-4 sm:pl-20 mb-4">
      <div className="flex items-center relative min-h-[calc(100vh-64px)] ">
        <div
          className={`md:absolute max-w-[600px] h-full flex items-start flex-col justify-center top-0 left-0 py-4`}
        >
          <h1 className=" text-4xl font-bold">
            Tracky - Your Ultimate Price Tracking Companion
          </h1>
          <h3 className="text-lg font-semibold mt-6 mb-12">
            Never Miss a Deal! Get real-time alerts and price history from your
            favorite stores. Save money effortlessly.
          </h3>
          {currentUser ? (
            <Button
              onClick={() => {
                window.scrollTo({
                  top: offersRef.current?.offsetTop,
                  behavior: "smooth",
                });
              }}
            >
              Start Searching
            </Button>
          ) : (
            <Link to="/authenticate">
              <Button>Start Tracking</Button>
            </Link>
          )}
        </div>
        <div className="w-full h-full md:block hidden">
          <Spline scene="https://prod.spline.design/MQLgDExoE9Kavio8/scene.splinecode" />
        </div>
      </div>
      <div ref={offersRef}>
        <div className="flex items-center justify-between my-4 flex-wrap">
          <h2 className="text-3xl font-semibold mb-3">
            Today's Offers ({products?.length || 0})
          </h2>
          <Button onClick={() => fetchOffers()}>Scrape new offer</Button>
        </div>
        <div className="w-full relative min-h-[200px]">
          {loading && (
            <div className="flex items-center gap-4 text-xl justify-center absolute z-10 bg-[#F5F5F5] py-2 px-4 rounded-md top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-fit w-full sm:w-52">
              <span className="loader z-20"></span> Looking for the latest
              offers
            </div>
          )}
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-[calc(100%-50px)]"
          >
            <CarouselContent>
              {products?.map(
                (product:ProductCardProp, index) => {
                  return (
                    <CarouselItem
                      key={index}
                      className="sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                    >
                      <ProductCard
                        isLoading={loading}
                        key={index}
                        name={product.name}
                        href={product.href}
                        discount={product.discount}
                        image={product.image}
                        price={product.price}
                        unit={product.unit}
                        specialOffer={product.specialOffer}
                        site={product.site}
                      />
                    </CarouselItem>
                  );
                },
              )}
            </CarouselContent>
            <CarouselPrevious className={loading ? "hidden" : ""} />
            <CarouselNext className={loading ? "hidden" : ""} />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
