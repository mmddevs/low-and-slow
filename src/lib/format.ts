const money = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "USD",
  currencyDisplay: "narrowSymbol",
});

/** Formats a USD amount for the French UI, e.g. "149,00 $". */
export function formatMoney(amount: number): string {
  return money.format(amount);
}
