const money = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  trailingZeroDisplay: "stripIfInteger",
});

/** Formats a euro amount for the French UI, e.g. "85 €" or "139,50 €". */
export function formatMoney(amount: number): string {
  return money.format(amount);
}
