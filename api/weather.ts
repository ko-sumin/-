import type { VercelRequest, VercelResponse } from "@vercel/node";
import { normalizeWeatherQuery, cleanApiKey } from "./_utils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(455).json({
      success: false,
      error: "METHOD_NOT_ALLOWED",
      message: "GET 요청만 허용됩니다."
    });
  }

  let query = (req.query.q as string) || "Seoul";
  const days = (req.query.days as string) || "3";
  let apiKey = process.env.WEATHER_API_KEY;

  // Clean and normalize API Key
  apiKey = cleanApiKey(apiKey);

  // Check if API Key exists
  if (!apiKey || apiKey === "YOUR_WEATHER_API_KEY" || apiKey === "") {
    return res.status(200).json({
      success: false,
      error: "WEATHER_API_KEY_MISSING",
      message: "WeatherAPI.com API Key가 설정되지 않았습니다. Vercel 환경변수(WEATHER_API_KEY)를 설정해주세요."
    });
  }

  // Normalize the search query for Korean locations and subdistricts
  query = normalizeWeatherQuery(query);

  try {
    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(query)}&days=${days}&aqi=yes&alerts=yes&lang=ko`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: "WEATHER_API_ERROR",
        message: data.error?.message || "날씨 정보를 가져오는 중 오류가 발생했습니다."
      });
    }

    // Localize returned response details (region/country names) for display consistency
    if (data && data.location) {
      const nameLower = data.location.name.toLowerCase();
      const countryLower = data.location.country.toLowerCase();
      
      if (nameLower.includes("jeju") && countryLower.includes("korea")) {
        data.location.name = "Jeju";
        data.location.region = "제주도";
        data.location.country = "대한민국";
      } else if (nameLower.includes("seoul") && countryLower.includes("korea")) {
        data.location.name = "Seoul";
        data.location.region = "서울특별시";
        data.location.country = "대한민국";
      } else if (nameLower.includes("busan") && countryLower.includes("korea")) {
        data.location.name = "Busan";
        data.location.region = "부산광역시";
        data.location.country = "대한민국";
      } else if (nameLower.includes("gangneung") && countryLower.includes("korea")) {
        data.location.name = "Gangneung";
        data.location.region = "강원도";
        data.location.country = "대한민국";
      } else if (nameLower.includes("tokyo") && (countryLower.includes("japan") || countryLower.includes("일본"))) {
        data.location.name = "Tokyo";
        data.location.region = "도쿄";
        data.location.country = "일본";
      } else if ((nameLower.includes("new york") || nameLower.includes("newyork")) && (countryLower.includes("usa") || countryLower.includes("united states") || countryLower.includes("미국"))) {
        data.location.name = "New York";
        data.location.region = "뉴욕";
        data.location.country = "미국";
      }
    }

    // CORS headers for security and safe caching
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=30");

    return res.status(200).json({
      success: true,
      data: data
    });
  } catch (err: any) {
    console.error("Vercel Serverless Error (Weather API):", err);
    return res.status(500).json({
      success: false,
      error: "SERVER_ERROR",
      message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
    });
  }
}
