import { useGetTrackedProductsQuery } from "../redux/slice/userApiSlice";
import ProductCard from "../components/ProductCard";
import { ProductCardProp } from "../utils/constants";
import Notfound from "../assets/not_found.svg";
type TrackedProductsProps = {
  data: ProductCardProp[];
  isLoading: boolean;
  isSuccess: boolean;
};
export default function TrackedProducts() {
  const { data, isLoading, isSuccess }: TrackedProductsProps =
    useGetTrackedProductsQuery({}, { refetchOnMountOrArgChange: true });
  return (
    <section className="px-4 md:px-20 mb-4 my-10 relative h-[calc(100vh-128px)]">
      <h2 className="text-xl md:text-3xl font-bold mb-6">Tracked Products</h2>

      {isLoading && (
        <div className="absolute top-1/2 left-1/2 translate-x-1/2 translate-y-1/2">
          <div className="loader" />
        </div>
      )}
      {(data?.length === 0 || data === undefined) && !isLoading ? (
        <div className="w-[300px] h-[340px] flex flex-col items-center justify-center absolute mt-4 left-1/2 -translate-x-1/2 bg-slate-300 p-10 rounded-xl">
          <img src={Notfound} alt="" loading="lazy" />
          <h2 className="text-lg font-semibold mt-4">No products found</h2>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4 items-center justify-center md:justify-normal">
          {isSuccess &&
            data.map((product) => {
              return (
                <ProductCard
                  key={product._id}
                  name={product.name}
                  href={product.href}
                  discount={product.discount}
                  image={product.image}
                  price={product.price}
                  unit={product.unit}
                  specialOffer={product.specialOffer}
                  site={product.site}
                />
              );
            })}
        </div>
      )}
    </section>
  );
}
