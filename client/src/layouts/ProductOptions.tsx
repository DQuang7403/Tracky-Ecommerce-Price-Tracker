import { useState } from "react";

import { Input } from "../components/ui/input";
import { useUpdateTargetPriceMutation } from "../redux/slice/userApiSlice";
import { toast } from "../components/ui/use-toast";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { setSelectedProduct } from "../redux/productSlice";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";

type ScheduledScrapeProps = {
  isLoading: boolean;
  productDetails: any;
};
export default function ScheduledScrape({
  isLoading,
  productDetails,
}: ScheduledScrapeProps) {
  const dispatch = useAppDispatch();

  const [targetPrice, setTargetPrice] = useState<number>(0);
  const [autoUpdateTargetPrice, setAutoUpdateTargetPrice] = useState<boolean>(
    productDetails.autoUpdateTargetPrice,
  );
  const [updateTargetPrice] = useUpdateTargetPriceMutation();
  const seletedProduct = useAppSelector((state) => state.products.product);
  const onSubmitTargetPrice = async () => {
    try {
      const res = await updateTargetPrice({
        name: productDetails.name,
        targetPrice: targetPrice,
        autoUpdateTargetPrice: autoUpdateTargetPrice,
      });

      if (res.data !== null || res.data !== undefined) {
        dispatch(
          setSelectedProduct({
            ...seletedProduct,
            targetPrice: res?.data.targetPrice,
            autoUpdateTargetPrice: res?.data.autoUpdateTargetPrice,
          }),
        );
        toast({
          variant: "success",
          title: "Tracked Information Updated",
          description: "Tracked Information Updated Successfully",
        });
      }
    } catch (error: any) {
      console.log(error);
    }
  };
  const content = isLoading ? (
    <div className="w-full md:w-1/3 relative mt-6 md:mt-0 border-2 p-4 rounded-md flex  flex-col space-y-3">
      <Skeleton className="h-8 w-[250px]" />
      <Skeleton className="h-5 w-[350px]" />
      <Skeleton className="h-5 w-[350px]" />
      <Skeleton className="h-10 w-full" />
    </div>
  ) : (
    <div className="w-full md:w-1/3 relative mt-6 md:mt-0 border-2 p-4 rounded-md flex  flex-col space-y-3">
      <h3 className="text-lg font-bold mb-2">Target Price</h3>
      <p className="text-gray-500 mb-4">Set your target price</p>
      <Input
        type="number"
        defaultValue={seletedProduct?.targetPrice}
        onChange={(e) => setTargetPrice(parseInt(e.target.value, 10))}
      />
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="automaticTracking"
          id=""
          defaultChecked={autoUpdateTargetPrice}
          onChange={() => setAutoUpdateTargetPrice(!autoUpdateTargetPrice)}
        />
        <label htmlFor="automaticTracking">Automatic Tracking</label>
      </div>
      <p className="text-gray-500">
        <span className="text-red-500">* </span>We will update your price
        automatically base on your settings in the profile configuration
      </p>
      <Button onClick={onSubmitTargetPrice} className="">
        Update
      </Button>
    </div>
  );
  return <>{content}</>;
}
