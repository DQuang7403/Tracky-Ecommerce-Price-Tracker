import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { ProductCardProp } from "../utils/constants";
import { Skeleton } from "./ui/skeleton";
import priceFormatter from "../utils/priceFormatter";

export default function ProductCard({
  isLoading,
  name,
  price,
  href,
  discount,
  specialOffer,
  image,
  unit,
  site,
}: ProductCardProp) {
  const content = isLoading ? (
    <Card className="w-[300px] relative h-[400px] flex flex-col p-4">
      <Skeleton className="w-full aspect-[4/3] rounded-xl" />
      <Skeleton className="h-8 w-[250px] mt-4" />
      <div className="space-y-2 mt-6">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
      <div className="flex gap-4  items-center">
        <Skeleton className="h-10 w-[100px] mt-4" />
        <Skeleton className="h-10 w-[100px] mt-4" />
      </div>
    </Card>
  ) : (
    <Card className="max-w-[300px] relative h-[460px] flex flex-col">
      {!discount ||
        (discount !== null && (
          <div className="absolute top-5 left-5 bg-[#DB4444] px-2 py-1 rounded-lg text-white font-semibold text-sm">
            {discount} %
          </div>
        ))}
      <CardHeader>
        <img src={`${image}`} className="w-52 h-52 mx-auto" />
        <CardTitle>{`${name}`}</CardTitle>
        <CardDescription>
          Price: <strong>{priceFormatter(price)} đ</strong>
        </CardDescription>
        {site !== null && (
          <CardDescription>
            Site: <strong>{site}</strong>
          </CardDescription>
        )}
        {unit !== null && <CardDescription>Unit: {unit}</CardDescription>}
      </CardHeader>
      <CardContent className="text-sm">
        <p className="line-clamp-1">
          Special Offer: {specialOffer ? specialOffer : "No offer"}
        </p>
      </CardContent>
      <CardFooter className="flex gap-4 mt-auto items-center">
        <Link to={href || "/"} target="_blank">
          <Button>Buy product</Button>
        </Link>
        <Link
          to={`/product/${encodeURIComponent(name as string)}`}
          state={{
            href: href,
            image: image,
            discount: discount,
            unit: unit,
            site: site,
          }}
        >
          <Button>Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
  return <>{content}</>;
}
