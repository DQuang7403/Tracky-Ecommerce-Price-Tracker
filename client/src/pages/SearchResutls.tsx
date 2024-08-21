import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import Searching from "../assets/searching.svg";
export default function SearchResutls() {
  const { searchParams } = useParams();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchProducts, setSearchProducts] = useState<any[]>([]);
  useEffect(() => {
    const fetchResults = async () => {
      const controller = new AbortController();
      try {
        setIsLoading(true);
        const res = await axios.post(
          `/product/search`,
          {
            search: searchParams,
          },
          {
            signal: controller.signal,
          },
        );
        if (res.status === 200) {
          setSearchProducts(res.data);
        }
        setIsLoading(false);
        return () => {
          controller.abort();
        };
      } catch (error) {
        console.log(error);
      }
    };
    fetchResults();
  }, [searchParams]);
  return (
    <section className="px-4 sm:pl-20 mb-4 my-10">
      <h2 className="text-xl md:text-3xl">
        We are searching for: <b>{searchParams}</b>
      </h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 mt-8">
        {isLoading ? (
          <div className="max-w-[286px] aspect-square flex flex-col items-center justify-center bg-slate-300 rounded-md p-8">
            <img src={Searching} className="mb-4" loading="lazy" />
            <div className="loader"></div>
          </div>
        ) : (
          searchProducts.map((product: any) => {
            return (
              <ProductCard
                key={product.href}
                name={product.name}
                href={product.href}
                discount={product.discount}
                image={product.image}
                price={product.price}
                unit={product.unit}
                specialOffer={product.specialOffer}
              />
            );
          })
        )}
      </div>
    </section>
  );
}
