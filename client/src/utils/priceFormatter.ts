
function priceFormatter(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export default priceFormatter