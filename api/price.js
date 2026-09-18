// The App Store prices in the visitor's own currency. Vercel gives us the
// country from the edge (x-vercel-ip-country); we map it to the tier Apple
// charges there. No IP address is stored or logged.
const TIERS = {
  DKK: { sym: "kr", month: "59 kr", year: "399 kr", per: "33 kr" },
  SEK: { sym: "kr", month: "89 kr", year: "599 kr", per: "50 kr" },
  NOK: { sym: "kr", month: "89 kr", year: "599 kr", per: "50 kr" },
  EUR: { sym: "€", month: "€7,99", year: "€54,99", per: "€4,58" },
  GBP: { sym: "£", month: "£6.99", year: "£47.99", per: "£4.00" },
  USD: { sym: "$", month: "$7.99", year: "$54.99", per: "$4.58" },
  CAD: { sym: "$", month: "CA$10.99", year: "CA$74.99", per: "CA$6.25" },
  AUD: { sym: "$", month: "A$11.99", year: "A$79.99", per: "A$6.67" },
  CHF: { sym: "CHF", month: "CHF 7.50", year: "CHF 49.00", per: "CHF 4.08" },
  PLN: { sym: "zł", month: "34,99 zł", year: "239,99 zł", per: "20,00 zł" },
  JPY: { sym: "¥", month: "¥1,200", year: "¥8,000", per: "¥667" },
};
const COUNTRY = {
  DK: "DKK", SE: "SEK", NO: "NOK", GB: "GBP", US: "USD", CA: "CAD", AU: "AUD", NZ: "AUD",
  CH: "CHF", PL: "PLN", JP: "JPY",
  DE: "EUR", FR: "EUR", NL: "EUR", ES: "EUR", IT: "EUR", IE: "EUR", BE: "EUR", AT: "EUR",
  FI: "EUR", PT: "EUR", GR: "EUR", LU: "EUR", SK: "EUR", SI: "EUR", EE: "EUR", LV: "EUR",
  LT: "EUR", CY: "EUR", MT: "EUR", HR: "EUR",
};

module.exports = (req, res) => {
  const country = (req.headers["x-vercel-ip-country"] || "DK").toUpperCase();
  const code = COUNTRY[country] || "EUR";
  const tier = TIERS[code] || TIERS.EUR;
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.status(200).json({ country, currency: code, ...tier });
};
