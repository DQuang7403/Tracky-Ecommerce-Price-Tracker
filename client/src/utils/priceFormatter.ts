
function priceFormatter(price: number) {
  return new Intl.NumberFormat("en-US").format(price);
}

export default priceFormatter