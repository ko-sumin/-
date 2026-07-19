import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing middleware
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV || "development" });
  });

  // Proxy route for WeatherAPI.com
  app.get("/api/weather", async (req, res) => {
    let query = (req.query.q as string) || "Seoul";
    const days = (req.query.days as string) || "3";
    const apiKey = process.env.WEATHER_API_KEY;

    // Check if API key is configured
    if (!apiKey || apiKey === "YOUR_WEATHER_API_KEY" || apiKey === "") {
      return res.status(200).json({
        success: false,
        error: "WEATHER_API_KEY_MISSING",
        message: "WeatherAPI.com API Key가 설정되지 않았습니다. .env 파일이나 Secrets 패널에서 WEATHER_API_KEY를 등록해주세요."
      });
    }

    // Standardize query to prevent incorrect mapping (e.g. Jeju mapping to Jeju, Maharashtra, India)
    const lowerQuery = query.toLowerCase().trim();
    if (
      lowerQuery.includes("jeju") || 
      lowerQuery.includes("제주") || 
      lowerQuery.includes("jeju island") || 
      lowerQuery.includes("jeju-do") ||
      lowerQuery.includes("jeju-si") ||
      lowerQuery.includes("제주시")
    ) {
      query = "Jeju, South Korea";
    } else if (lowerQuery.includes("seoul") || lowerQuery.includes("서울")) {
      query = "Seoul, South Korea";
    } else if (lowerQuery.includes("busan") || lowerQuery.includes("부산")) {
      query = "Busan, South Korea";
    } else if (lowerQuery.includes("gangneung") || lowerQuery.includes("강릉")) {
      query = "Gangneung, South Korea";
    } else {
      // Map other subdistricts to their parent city to prevent 400 Bad Request on WeatherAPI
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
        "anmok": "Gangneung, South Korea", "안목해변": "Gangneung, South Korea"
      };

      if (subDistrictParentMap[lowerQuery]) {
        query = subDistrictParentMap[lowerQuery];
      }
    }

    try {
      // Fetch weather current and forecast with Korean language support
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

      // Localize returned region/country for major cities
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

  // Search Autocomplete proxy
  app.get("/api/weather/search", async (req, res) => {
    let query = req.query.q as string;
    const apiKey = process.env.WEATHER_API_KEY;

    if (!query) {
      return res.json([]);
    }

    if (!apiKey || apiKey === "YOUR_WEATHER_API_KEY" || apiKey === "") {
      return res.json([]); // No suggestions in demo mode
    }

    const lowerQuery = query.toLowerCase().trim();
    if (
      lowerQuery === "jeju" || 
      lowerQuery === "제주" || 
      lowerQuery === "제주도" || 
      lowerQuery === "jeju island" || 
      lowerQuery === "jeju-do" ||
      lowerQuery === "jeju-si" ||
      lowerQuery === "제주시"
    ) {
      query = "Jeju, South Korea";
    } else if (lowerQuery === "seoul" || lowerQuery === "서울") {
      query = "Seoul, South Korea";
    } else if (lowerQuery === "busan" || lowerQuery === "부산") {
      query = "Busan, South Korea";
    } else if (lowerQuery === "gangneung" || lowerQuery === "강릉") {
      query = "Gangneung, South Korea";
    }

    try {
      const apiUrl = `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${encodeURIComponent(query)}`;
      const response = await fetch(apiUrl);
      let data = await response.json();

      if (!response.ok) {
        return res.json([]);
      }

      // Filter and localize results
      if (Array.isArray(data)) {
        data = data.filter((item: any) => {
          // Exclude "Jeju" in Maharashtra, India to ensure only Korean Jeju is suggested
          if (item.name?.toLowerCase() === "jeju" && item.country?.toLowerCase() === "india") {
            return false;
          }
          return true;
        });

        // Translate matching results nicely
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
          return item;
        });
      }

      return res.json(data);
    } catch (err) {
      console.error("Error fetching search autocomplete:", err);
      return res.json([]);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[WeatherApp] Server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
