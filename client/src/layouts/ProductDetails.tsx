import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import priceFormatter from "../utils/priceFormatter";

export default function ProductDetails({
  isLoading,
  productDetails,
  state,
}: any) {
  const loadingStateContent = (
    <Card className="divide-y h-[500px] relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="loader"></div>
      </div>
      <CardHeader>
        <Skeleton className="h-10 rounded-xl" />
        <CardDescription className="py-2 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2 pt-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </CardContent>
      <Skeleton className="h-10 w-[100px] ml-4" />
    </Card>
  );
  const OverviewContent = isLoading ? (
    loadingStateContent
  ) : (
    <Card className="divide-y h-[500px] relative">
      <CardHeader>
        <CardTitle>{productDetails.name}</CardTitle>
        <CardDescription className="py-2">
          <h3>Current Price: {priceFormatter(productDetails.price)}</h3>
          <h3>Availability: {productDetails.available}</h3>
          <h3>Unit: {state.unit}</h3>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2 pt-4 ">
        <h2 className="font-semibold">Offers</h2>
        <ul className="list-disc mx-4">
          {productDetails.specialOffer && (
            <li>
              <b>Special</b>: {productDetails.specialOffer}
            </li>
          )}
          {productDetails.transportOffer && (
            <li>
              <b>Transport</b>: {productDetails.transportOffer}
            </li>
          )}
          {<li>Discount: {state.discount || 0} %</li>}
        </ul>
      </CardContent>
      <Link to={state.href} className="mt-4 ml-4 absolute bottom-4">
        <Button>Buy now</Button>
      </Link>
    </Card>
  );
  const DescriptionContent = isLoading ? (
    loadingStateContent
  ) : (
    <div>
      {productDetails?.description && (
        <Card className="max-h-[500px] overflow-y-scroll">
          <CardHeader>
            <CardTitle>{productDetails?.description[0]}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {productDetails?.description.map(
              (detail: string, index: number) => {
                return index !== 0 && <p key={index}>{detail}</p>;
              },
            )}
            {productDetails?.description.length === 0 && (
              <h2 className="font-semibold">
                This product don't have any description
              </h2>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
  return (
    <>
      <Tabs defaultValue="overview" className="w-full lg:w-1/2 flex-grow">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="description">Description</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">{OverviewContent}</TabsContent>
        <TabsContent value="description">{DescriptionContent}</TabsContent>
      </Tabs>
    </>
  );
}
