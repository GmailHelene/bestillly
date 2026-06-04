// Pris for Bestilly, én kilde til sannhet for prisvisning.
// Vi markedsfører månedspris (149 kr/mnd), men fakturerer årlig
// (149 × 12 = 1788 kr) inntil Stripe/abonnement er på plass.
export const MONTHLY_PRICE_NOK = 149;
export const ANNUAL_PRICE_NOK = MONTHLY_PRICE_NOK * 12; // 1788 kr
