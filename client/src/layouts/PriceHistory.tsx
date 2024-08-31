import {
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import priceFormatter from "../utils/priceFormatter";
import { useMemo } from "react";
type PriceHistoryProps = {
  isLoading: boolean;
  updatePrice: () => void;
  isAuthenticated: boolean;
  data: { price_history: number; date_history: string }[];
};

export default function PriceHistory({
  isLoading,
  updatePrice,
  isAuthenticated = false,
  data = [],
}: PriceHistoryProps) {
  const minPrice = useMemo(
    () =>
      data.reduce((a, b) => {
        return {
          price_history: Math.min(a.price_history, b.price_history),
          date_history: "",
        };
      }),
    [data],
  );
  const averagePrice = useMemo(() => {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i].price_history;
    }
    return sum / data.length;
  }, [data]);

  const content = isLoading ? (
    <div className="relative flex-grow w-full md:w-1/3 space-y-4 md:p-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-[300px]" />
    </div>
  ) : (
    data.length > 0 && (
      <div className="relative flex-grow w-full md:w-1/3 border-2 rounded-md pt-4 md:px-4">
        <div className="flex justify-between mr-6 mb-6">
          <h1 className="text-2xl mb-4">Price History</h1>
          <Button onClick={updatePrice}>Run Scrape</Button>
        </div>
        <div>
          <ResponsiveContainer width="99%" height={250}>
            <AreaChart
              width={730}
              height={250}
              data={data}
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1E88E5" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#1E88E5" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date_history" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="price_history"
                stroke="#1E88E5"
                fillOpacity={1}
                fill="url(#colorUv)"
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className=" text-[#848484] text-xl flex justify-between m-6">
            <h2>
              Lowest Price:
              <div className="text-black">
                {priceFormatter(minPrice.price_history)} đ
              </div>
            </h2>
            <h2>
              Average Price:
              <div className="text-black">{priceFormatter(averagePrice)} đ</div>
            </h2>
          </div>
        </div>
      </div>
    )
  );

  return isAuthenticated && content;
}
