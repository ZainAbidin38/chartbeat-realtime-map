// Helper to fetch live country-level user data from Chartbeat
const API_KEY = "6d0776e3d8035b56610117583df5517b"
const SITE = "abc7.com";

export async function fetchChartbeatUserData(host: string = "abc7.com"): Promise<Record<string, number>> {
  const res = await fetch(`https://dashapi.chartbeat.com/live/top_geo/v1/?apikey=${API_KEY}&host=${host}`);
  const data = await res.json();

  // Country ISO codes like "US" => "United States"
  const isoToCountryName: Record<string, string> = {
    US: "United States",
    GB: "United Kingdom",
    DE: "Germany",
    CA: "Canada",
    AU: "Australia",
    FR: "France",
    JP: "Japan",
    BR: "Brazil",
    PK: "Pakistan",
    NL: "Netherlands",
    SE: "Sweden",
    CH: "Switzerland",
    SG: "Singapore",
    KR: "South Korea",
    MX: "Mexico",
    TW: "Taiwan",
    // Add more mappings as needed
  };

  const userData: Record<string, number> = {};

  for (const [isoCode, count] of Object.entries(data.geo?.countries || {})) {
    const countryName = isoToCountryName[isoCode];
    if (countryName) {
      userData[countryName] = count as number;
    }
  }

  return userData;
}
