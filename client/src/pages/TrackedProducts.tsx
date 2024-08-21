import { useGetTrackedProductsQuery } from "../redux/slice/userApiSlice";
import ProductCard from "../components/ProductCard";
import { ProductCardProp } from "../utils/constants";
import Notfound from "../assets/not_found.svg";type TrackedProductsProps = {
  data: ProductCardProp[];
  isLoading: boolean;
  isSuccess: boolean;
};
export default function TrackedProducts() {
  const { data, isLoading, isSuccess }: TrackedProductsProps =
    useGetTrackedProductsQuery({}, { refetchOnMountOrArgChange: true });
  return (
    <section className="px-4 md:px-20 mb-4 my-10 relative">
      <h2 className="text-xl md:text-3xl font-bold mb-6">Tracked Products</h2>

      {isLoading && <div className="loader" />}
      {data?.length === 0 || data === undefined ? (
        <div className="w-[300px] h-[300px] flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-1/2 bg-slate-300 p-10 rounded-xl">
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
                />
              );
            })}
        </div>
      )}
    </section>
  );
}
