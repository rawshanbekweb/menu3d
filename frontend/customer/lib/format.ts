export function formatPrice(price: string): string {
  const value = Math.round(parseFloat(price));
  if (Number.isNaN(value)) return price;
  return `${value.toLocaleString("uz-UZ")} so'm`;
}
