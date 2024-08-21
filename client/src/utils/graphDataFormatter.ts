import dateFormatter from "./dateFormatter";

function graphDataFormatter(price_history: number[] | undefined, date_history: string[] | undefined) {
  if (!price_history || !date_history) {
    return []; // Return an empty array or handle the undefined case as needed
  }
  let data = [];
  for(let i = 0; i < price_history.length; i++){
    data.push({
      price_history: price_history[i],
      date_history: dateFormatter(date_history[i])
    })
  }
  return data;
}
export default graphDataFormatter