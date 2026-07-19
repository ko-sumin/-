import express from "express";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// JSON parsing middleware
app.use(express.json());

// API health endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", mode: process.env.NODE_ENV || "development" });
});

// Detailed Korean city mapping dictionary for robust weather search translations
const koreanCityEnglishMap: { [key: string]: { en: string; country: string } } = {
  "서울": { en: "Seoul", country: "South Korea" },
  "인천": { en: "Incheon", country: "South Korea" },
  "대전": { en: "Daejeon", country: "South Korea" },
  "대구": { en: "Daegu", country: "South Korea" },
  "부산": { en: "Busan", country: "South Korea" },
  "광주": { en: "Gwangju", country: "South Korea" },
  "울산": { en: "Ulsan", country: "South Korea" },
  "세종": { en: "Sejong", country: "South Korea" },
  "제주": { en: "Jeju", country: "South Korea" },
  "강릉": { en: "Gangneung", country: "South Korea" },
  "수원": { en: "Suwon", country: "South Korea" },
  "고양": { en: "Goyang", country: "South Korea" },
  "성남": { en: "Seongnam", country: "South Korea" },
  "용인": { en: "Yongin", country: "South Korea" },
  "부천": { en: "Bucheon", country: "South Korea" },
  "안산": { en: "Ansan", country: "South Korea" },
  "안양": { en: "Anyang", country: "South Korea" },
  "화성": { en: "Hwaseong", country: "South Korea" },
  "평택": { en: "Pyeongtaek", country: "South Korea" },
  "시흥": { en: "Siheung", country: "South Korea" },
  "파주": { en: "Paju", country: "South Korea" },
  "김포": { en: "Gimpo", country: "South Korea" },
  "광명": { en: "Gwangmyeong", country: "South Korea" },
  "군포": { en: "Gunpo", country: "South Korea" },
  "이천": { en: "Icheon", country: "South Korea" },
  "오산": { en: "Osan", country: "South Korea" },
  "하남": { en: "Hanam", country: "South Korea" },
  "양주": { en: "Yangju", country: "South Korea" },
  "구리": { en: "Guri", country: "South Korea" },
  "안성": { en: "Anseong", country: "South Korea" },
  "포천": { en: "Pocheon", country: "South Korea" },
  "의왕": { en: "Uiwang", country: "South Korea" },
  "여주": { en: "Yeoju", country: "South Korea" },
  "동두천": { en: "Dongducheon", country: "South Korea" },
  "과천": { en: "Gwacheon", country: "South Korea" },
  "원주": { en: "Wonju", country: "South Korea" },
  "춘천": { en: "Chuncheon", country: "South Korea" },
  "속초": { en: "Sokcho", country: "South Korea" },
  "삼척": { en: "Samcheok", country: "South Korea" },
  "동해": { en: "Donghae", country: "South Korea" },
  "태백": { en: "Taebaek", country: "South Korea" },
  "청주": { en: "Cheongju", country: "South Korea" },
  "충주": { en: "Chungju", country: "South Korea" },
  "제천": { en: "Jecheon", country: "South Korea" },
  "천안": { en: "Cheonan", country: "South Korea" },
  "아산": { en: "Asan", country: "South Korea" },
  "서산": { en: "Seosan", country: "South Korea" },
  "당진": { en: "Dangjin", country: "South Korea" },
  "공주": { en: "Gongju", country: "South Korea" },
  "논산": { en: "Nonsan", country: "South Korea" },
  "보령": { en: "Boryeong", country: "South Korea" },
  "전주": { en: "Jeonju", country: "South Korea" },
  "익산": { en: "Iksan", country: "South Korea" },
  "군산": { en: "Gunsan", country: "South Korea" },
  "정읍": { en: "Jeongeup", country: "South Korea" },
  "김제": { en: "Gimje", country: "South Korea" },
  "남원": { en: "Namwon", country: "South Korea" },
  "여수": { en: "Yeosu", country: "South Korea" },
  "순천": { en: "Suncheon", country: "South Korea" },
  "목포": { en: "Mokpo", country: "South Korea" },
  "광양": { en: "Gwangyang", country: "South Korea" },
  "나주": { en: "Naju", country: "South Korea" },
  "포항": { en: "Pohang", country: "South Korea" },
  "구미": { en: "Gumi", country: "South Korea" },
  "경산": { en: "Gyeongsan", country: "South Korea" },
  "경주": { en: "Gyeongju", country: "South Korea" },
  "안동": { en: "Andong", country: "South Korea" },
  "김천": { en: "Gimcheon", country: "South Korea" },
  "영주": { en: "Yeongju", country: "South Korea" },
  "상주": { en: "Sangju", country: "South Korea" },
  "영천": { en: "Yeongcheon", country: "South Korea" },
  "문경": { en: "Mungyeong", country: "South Korea" },
  "창원": { en: "Changwon", country: "South Korea" },
  "김해": { en: "Gimhae", country: "South Korea" },
  "양산": { en: "Yangsan", country: "South Korea" },
  "진주": { en: "Jinju", country: "South Korea" },
  "거제": { en: "Geoje", country: "South Korea" },
  "통영": { en: "Tongyeong", country: "South Korea" },
  "사천": { en: "Sacheon", country: "South Korea" },
  "밀양": { en: "Miryang", country: "South Korea" },
  "도쿄": { en: "Tokyo", country: "Japan" },
  "tokyo": { en: "Tokyo", country: "Japan" },
  "뉴욕": { en: "New York", country: "USA" },
  "new york": { en: "New York", country: "USA" },
  "newyork": { en: "New York", country: "USA" }
};

// Subdistrict parent city fallback mapping to prevent 400 Bad Requests on localized sub-entities
const subDistrictParentMap: { [key: string]: string } = {
  "gangnam": "Seoul, South Korea", "강남구": "Seoul, South Korea",
  "mapo": "Seoul, South Korea", "마포구": "Seoul, South Korea",
  "seocho": "Seoul, South Korea", "서초구": "Seoul, South Korea",
  "jongno": "Seoul, South Korea", "종로구": "Seoul, South Korea",
  "yongsan": "Seoul, South Korea", "용산구": "Seoul, South Korea",
  "songpa": "Seoul, South Korea", "송파구": "Seoul, South Korea",
  "yeouido": "Seoul, South Korea", "여의도동": "Seoul, South Korea",
  
  "haeundae": "Busan, South Korea", "해운대구": "Busan, South Korea",
  "busanjin": "Busan, South Korea", "부산진구": "Busan, South Korea",
  "dongnae": "Busan, South Korea", "동래구": "Busan, South Korea",
  "suyeong": "Busan, South Korea", "수영구": "Busan, South Korea",
  "saha": "Busan, South Korea", "사하구": "Busan, South Korea",
  "gijang": "Busan, South Korea", "기장군": "Busan, South Korea",
  
  "seogwipo": "Jeju, South Korea", "서귀포시": "Jeju, South Korea",
  "aewol": "Jeju, South Korea", "애월읍": "Jeju, South Korea",
  "hallasan": "Jeju, South Korea", "한라산": "Jeju, South Korea",
  "gujwa": "Jeju, South Korea", "구좌읍": "Jeju, South Korea",
  "seongsan": "Jeju, South Korea", "성산읍": "Jeju, South Korea",
  
  "gyeongpo": "Gangneung, South Korea", "경포동": "Gangneung, South Korea",
  "jumunjin": "Gangneung, South Korea", "주문진읍": "Gangneung, South Korea",
  "chodang": "Gangneung, South Korea", "초당동": "Gangneung, South Korea",
  "gyo-dong": "Gangneung, South Korea", "교동": "Gangneung, South Korea",
  "seongsan-myeon": "Gangneung, South Korea", "성산면": "Gangneung, South Korea",
  "anmok": "Gangneung, South Korea", "안목해변": "Gangneung, South Korea",

  "shinjuku": "Tokyo, Japan", "신주쿠": "Tokyo, Japan",
  "shibuya": "Tokyo, Japan", "시부야": "Tokyo, Japan",
  "ginza": "Tokyo, Japan", "긴자": "Tokyo, Japan",
  "akihabara": "Tokyo, Japan", "아키하바라": "Tokyo, Japan",
  "roppongi": "Tokyo, Japan", "롯폰기": "Tokyo, Japan",
  
  "manhattan": "New York, USA", "맨해튼": "New York, USA",
  "brooklyn": "New York, USA", "브루클린": "New York, USA",
  "queens": "New York, USA", "퀸즈": "New York, USA",
  "bronx": "New York, USA", "브롱스": "New York, USA",
  "staten island": "New York, USA", "스태튼아일랜드": "New York, USA"
};

// Weather API route
app.get("/api/weather", async (req, res) => {
  let query = (req.query.q as string) || "Seoul";
  const days = (req.query.days as string) || "3";
  let apiKey = process.env.WEATHER_API_KEY;

  // Auto-strip surrounding quotes or spaces from the key if present
  if (apiKey) {
    apiKey = apiKey.trim().replace(/^['"`]|['"`]$/g, "");
  }

  // Check if API key is configured
  if (!apiKey || apiKey === "YOUR_WEATHER_API_KEY" || apiKey === "") {
    return res.status(200).json({
      success: false,
      error: "WEATHER_API_KEY_MISSING",
      message: "WeatherAPI.com API Key가 설정되지 않았습니다. .env 파일이나 Secrets 패널에서 WEATHER_API_KEY를 등록해주세요."
    });
  }

  const lowerQuery = query.toLowerCase().trim();

  // Robustly resolve sub-districts and general Korean names to valid English queries
  if (subDistrictParentMap[lowerQuery]) {
    query = subDistrictParentMap[lowerQuery];
  } else {
    for (const [kr, detail] of Object.entries(koreanCityEnglishMap)) {
      if (lowerQuery.includes(kr)) {
        query = `${detail.en}, ${detail.country}`;
        break;
      }
    }
  }

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

    return res.json({
      success: true,
      data: data
    });
  } catch (err: any) {
    console.error("Error fetching from WeatherAPI:", err);
    return res.status(500).json({
      success: false,
      error: "SERVER_ERROR",
      message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
    });
  }
});

// Search Autocomplete route
app.get("/api/weather/search", async (req, res) => {
  let query = req.query.q as string;
  let apiKey = process.env.WEATHER_API_KEY;

  if (!query) {
    return res.json([]);
  }

  if (apiKey) {
    apiKey = apiKey.trim().replace(/^['"`]|['"`]$/g, "");
  }

  if (!apiKey || apiKey === "YOUR_WEATHER_API_KEY" || apiKey === "") {
    return res.json([]);
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
      return res.json([]);
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

    return res.json(data);
  } catch (err) {
    console.error("Error fetching search autocomplete:", err);
    return res.json([]);
  }
});

// Configure static file serving or development Vite middleware
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  // Lazy-load Vite dev server only for local non-Vercel development
  const vitePromise = import("vite").then(({ createServer }) =>
    createServer({
      server: { middlewareMode: true },
      appType: "spa",
    })
  );

  app.use(async (req, res, next) => {
    try {
      const vite = await vitePromise;
      vite.middlewares(req, res, next);
    } catch (err) {
      next(err);
    }
  });
} else {
  // Server static files in Cloud Run or standalone production container environments
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Export app as the default module so Vercel Serverless handles it
export default app;

// Listen only when running in a local process or a continuous server (e.g. Cloud Run), avoiding blocking Vercel
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[WeatherApp] Server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}
