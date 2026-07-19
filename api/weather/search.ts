import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cleanApiKey, koreanCityEnglishMap } from "../_utils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(455).json({
      success: false,
      error: "METHOD_NOT_ALLOWED",
      message: "GET 요청만 허용됩니다."
    });
  }

  let query = req.query.q as string;
  let apiKey = process.env.WEATHER_API_KEY;

  if (!query) {
    return res.status(200).json([]);
  }

  // Clean and normalize API Key
  apiKey = cleanApiKey(apiKey);

  if (!apiKey || apiKey === "YOUR_WEATHER_API_KEY" || apiKey === "") {
    return res.status(200).json([]);
  }

  const lowerQuery = query.toLowerCase().trim();

  // Match exact Korean translations before autocompleting via API
  if (koreanCityEnglishMap[lowerQuery]) {
    query = `${koreanCityEnglishMap[lowerQuery].en}, ${koreanCityEnglishMap[lowerQuery].country}`;
  }

  try {
    const apiUrl = `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${encodeURIComponent(query)}`;
    const response = await fetch(apiUrl);
    let data = await response.json();

    if (!response.ok) {
      return res.status(200).json([]);
    }

    // Filter out duplicate or incorrect regions and localize response names
    if (Array.isArray(data)) {
      data = data.filter((item: any) => {
        if (item.name?.toLowerCase() === "jeju" && item.country?.toLowerCase() === "india") {
          return false;
        }
        return true;
      });

      data = data.map((item: any) => {
        const itemLower = item.name?.toLowerCase() || "";
        const countryLower = item.country?.toLowerCase() || "";
        
        if (itemLower.includes("jeju") && countryLower.includes("korea")) {
          return { ...item, name: "제주 (Jeju)", region: "제주도", country: "대한민국" };
        }
        if (itemLower.includes("seoul") && countryLower.includes("korea")) {
          return { ...item, name: "서울 (Seoul)", region: "서울특별시", country: "대한민국" };
        }
        if (itemLower.includes("busan") && countryLower.includes("korea")) {
          return { ...item, name: "부산 (Busan)", region: "부산광역시", country: "대한민국" };
        }
        if (itemLower.includes("gangneung") && countryLower.includes("korea")) {
          return { ...item, name: "강릉 (Gangneung)", region: "강원도", country: "대한민국" };
        }
        if (itemLower.includes("tokyo") && (countryLower.includes("japan") || countryLower.includes("일본"))) {
          return { ...item, name: "도쿄 (Tokyo)", region: "도쿄", country: "일본" };
        }
        if ((itemLower.includes("new york") || itemLower.includes("newyork")) && (countryLower.includes("usa") || countryLower.includes("united states") || countryLower.includes("미국"))) {
          return { ...item, name: "뉴욕 (New York)", region: "뉴욕", country: "미국" };
        }
        return item;
      });
    }

    // CORS headers for security and safe caching
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=30");

    return res.status(200).json(data);
  } catch (err) {
    console.error("Vercel Serverless Error (Search Autocomplete):", err);
    return res.status(200).json([]);
  }
}
