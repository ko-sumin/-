import { WeatherData } from "./types";

// Helper to generate dates relative to today
const getDateString = (offsetDays: number): { date: string, epoch: number } => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const dateStr = d.toISOString().split("T")[0];
  const epoch = Math.floor(d.getTime() / 1000);
  return { date: dateStr, epoch };
};

export const MOCK_CITIES = [
  { id: 1, name: "Seoul", koreanName: "서울", region: "Seoul", country: "South Korea" },
  { id: 2, name: "Busan", koreanName: "부산", region: "Busan", country: "South Korea" },
  { id: 3, name: "Jeju", koreanName: "제주", region: "Jeju", country: "South Korea" },
  { id: 4, name: "Gangneung", koreanName: "강릉", region: "Gangwon", country: "South Korea" },
  { id: 5, name: "Tokyo", koreanName: "도쿄", region: "Tokyo", country: "Japan" },
  { id: 6, name: "New York", koreanName: "뉴욕", region: "New York", country: "United States" },
];

const generateHourlyForecast = (baseTemp: number, conditionCode: number, conditionText: string, iconUrl: string): any[] => {
  const hours = [];
  const currentHour = new Date().getHours();
  
  for (let h = 0; h < 24; h++) {
    // Temperature changes over the course of a day (colder in morning/night, warmer in afternoon)
    const factor = -Math.cos(((h - 4) * Math.PI) / 12); // peak at 16:00 (4 PM)
    const tempOffset = factor * 4; // max range +/- 4 degrees
    const temp = Math.round((baseTemp + tempOffset) * 10) / 10;
    
    // Slight condition variation
    let hourlyText = conditionText;
    let hourlyIcon = iconUrl;
    if (h < 6 || h > 19) {
      if (conditionText === "맑음") {
        hourlyText = "맑음 (밤)";
        hourlyIcon = "//cdn.weatherapi.com/weather/64x64/night/113.png";
      }
    }

    const timeStr = `${h.toString().padStart(2, "0")}:00`;
    const d = new Date();
    d.setHours(h, 0, 0, 0);

    hours.push({
      time_epoch: Math.floor(d.getTime() / 1000),
      time: `${d.toISOString().split("T")[0]} ${timeStr}`,
      temp_c: temp,
      temp_f: Math.round((temp * 9/5 + 32) * 10) / 10,
      is_day: h >= 6 && h < 19 ? 1 : 0,
      condition: {
        text: hourlyText,
        icon: hourlyIcon,
        code: conditionCode,
      },
      wind_mph: Math.round((5 + Math.random() * 5) * 10) / 10,
      wind_kph: Math.round((8 + Math.random() * 8) * 10) / 10,
      wind_degree: 180,
      wind_dir: "S",
      pressure_mb: 1012.0,
      pressure_in: 29.9,
      precip_mm: conditionText.includes("비") ? 1.5 : 0.0,
      precip_in: conditionText.includes("비") ? 0.06 : 0.0,
      humidity: Math.round(55 + (factor * -15)), // Less humid in peak heat, more humid at night
      cloud: conditionText.includes("맑음") ? 10 : 75,
      feelslike_c: temp + (conditionText.includes("비") ? -1 : 1),
      feelslike_f: (temp + (conditionText.includes("비") ? -1 : 1)) * 9/5 + 32,
      windchill_c: temp,
      windchill_f: temp * 9/5 + 32,
      heatindex_c: temp,
      heatindex_f: temp * 9/5 + 32,
      dewpoint_c: temp - 5,
      dewpoint_f: (temp - 5) * 9/5 + 32,
      will_it_rain: conditionText.includes("비") ? 1 : 0,
      chance_of_rain: conditionText.includes("비") ? 80 : 10,
      will_it_snow: conditionText.includes("눈") ? 1 : 0,
      chance_of_snow: conditionText.includes("눈") ? 70 : 0,
      vis_km: 10.0,
      vis_miles: 6.0,
      gust_mph: 12.0,
      gust_kph: 19.3,
      uv: Math.max(1, Math.round(6 * factor)),
    });
  }
  return hours;
};

export const createMockDataForCity = (
  cityName: string,
  regionName: string,
  countryName: string,
  baseTemp: number,
  conditionText: string,
  conditionCode: number,
  iconUrl: string,
  humidity: number = 65,
  windKph: number = 12.5,
  uvIndex: number = 5,
  pm25: number = 24
): WeatherData => {
  const day0 = getDateString(0);
  const day1 = getDateString(1);
  const day2 = getDateString(2);

  return {
    location: {
      name: cityName,
      region: regionName,
      country: countryName,
      lat: 37.5665,
      lon: 126.978,
      tz_id: "Asia/Seoul",
      localtime_epoch: Math.floor(Date.now() / 1000),
      localtime: new Date().toISOString().replace("T", " ").substring(0, 16),
    },
    current: {
      last_updated_epoch: Math.floor(Date.now() / 1000),
      last_updated: new Date().toISOString().replace("T", " ").substring(0, 16),
      temp_c: baseTemp,
      temp_f: Math.round((baseTemp * 9/5 + 32) * 10) / 10,
      is_day: new Date().getHours() >= 6 && new Date().getHours() < 19 ? 1 : 0,
      condition: {
        text: conditionText,
        icon: iconUrl,
        code: conditionCode,
      },
      wind_mph: Math.round((windKph / 1.609) * 10) / 10,
      wind_kph: windKph,
      wind_degree: 190,
      wind_dir: "SSW",
      pressure_mb: 1011.0,
      pressure_in: 29.85,
      precip_mm: conditionText.includes("비") ? 2.3 : 0.0,
      precip_in: conditionText.includes("비") ? 0.09 : 0.0,
      humidity: humidity,
      cloud: conditionText.includes("맑음") ? 15 : 80,
      feelslike_c: baseTemp + 1.2,
      feelslike_f: (baseTemp + 1.2) * 9/5 + 32,
      vis_km: 10.0,
      vis_miles: 6.0,
      uv: uvIndex,
      gust_mph: Math.round((windKph * 1.3 / 1.609) * 10) / 10,
      gust_kph: Math.round(windKph * 1.3 * 10) / 10,
      air_quality: {
        co: 270.4,
        no2: 12.3,
        o3: 42.1,
        so2: 2.1,
        pm2_5: pm25,
        pm10: Math.round(pm25 * 1.5),
        "us-epa-index": pm25 <= 12 ? 1 : pm25 <= 35 ? 2 : 3,
        "gb-defra-index": pm25 <= 11 ? 1 : pm25 <= 23 ? 2 : 3,
      },
    },
    forecast: {
      forecastday: [
        {
          date: day0.date,
          date_epoch: day0.epoch,
          day: {
            maxtemp_c: baseTemp + 4.2,
            maxtemp_f: (baseTemp + 4.2) * 9/5 + 32,
            mintemp_c: baseTemp - 3.8,
            mintemp_f: (baseTemp - 3.8) * 9/5 + 32,
            avgtemp_c: baseTemp,
            avgtemp_f: baseTemp * 9/5 + 32,
            maxwind_mph: Math.round((windKph * 1.2 / 1.609) * 10) / 10,
            maxwind_kph: Math.round(windKph * 1.2 * 10) / 10,
            totalprecip_mm: conditionText.includes("비") ? 5.2 : 0.0,
            totalprecip_in: conditionText.includes("비") ? 0.2 : 0.0,
            totalsnow_cm: conditionText.includes("눈") ? 3.0 : 0.0,
            avgvis_km: 10.0,
            avgvis_miles: 6.0,
            avghumidity: humidity,
            daily_will_it_rain: conditionText.includes("비") ? 1 : 0,
            daily_chance_of_rain: conditionText.includes("비") ? 85 : 15,
            daily_will_it_snow: conditionText.includes("눈") ? 1 : 0,
            daily_chance_of_snow: conditionText.includes("눈") ? 75 : 0,
            condition: {
              text: conditionText,
              icon: iconUrl,
              code: conditionCode,
            },
            uv: uvIndex,
          },
          astro: {
            sunrise: "05:24 AM",
            sunset: "07:48 PM",
            moonrise: "08:12 PM",
            moonset: "04:32 AM",
            moon_phase: "Waning Gibbous",
            moon_illumination: 75,
            is_moon_up: 1,
            is_sun_up: 0,
          },
          hour: generateHourlyForecast(baseTemp, conditionCode, conditionText, iconUrl),
        },
        {
          date: day1.date,
          date_epoch: day1.epoch,
          day: {
            maxtemp_c: baseTemp + 5.5,
            maxtemp_f: (baseTemp + 5.5) * 9/5 + 32,
            mintemp_c: baseTemp - 2.5,
            mintemp_f: (baseTemp - 2.5) * 9/5 + 32,
            avgtemp_c: baseTemp + 1,
            avgtemp_f: (baseTemp + 1) * 9/5 + 32,
            maxwind_mph: 9.5,
            maxwind_kph: 15.3,
            totalprecip_mm: 0.0,
            totalprecip_in: 0.0,
            totalsnow_cm: 0.0,
            avgvis_km: 10.0,
            avgvis_miles: 6.0,
            avghumidity: 55,
            daily_will_it_rain: 0,
            daily_chance_of_rain: 10,
            daily_will_it_snow: 0,
            daily_chance_of_snow: 0,
            condition: {
              text: "대체로 맑음",
              icon: "//cdn.weatherapi.com/weather/64x64/day/116.png",
              code: 1003,
            },
            uv: uvIndex + 1,
          },
          astro: {
            sunrise: "05:25 AM",
            sunset: "07:47 PM",
            moonrise: "09:05 PM",
            moonset: "05:40 AM",
            moon_phase: "Third Quarter",
            moon_illumination: 50,
            is_moon_up: 1,
            is_sun_up: 0,
          },
          hour: generateHourlyForecast(baseTemp + 1, 1003, "대체로 맑음", "//cdn.weatherapi.com/weather/64x64/day/116.png"),
        },
        {
          date: day2.date,
          date_epoch: day2.epoch,
          day: {
            maxtemp_c: baseTemp + 3.1,
            maxtemp_f: (baseTemp + 3.1) * 9/5 + 32,
            mintemp_c: baseTemp - 4.1,
            mintemp_f: (baseTemp - 4.1) * 9/5 + 32,
            avgtemp_c: baseTemp - 1,
            avgtemp_f: (baseTemp - 1) * 9/5 + 32,
            maxwind_mph: 15.0,
            maxwind_kph: 24.1,
            totalprecip_mm: 8.5,
            totalprecip_in: 0.33,
            totalsnow_cm: 0.0,
            avgvis_km: 8.0,
            avgvis_miles: 5.0,
            avghumidity: 85,
            daily_will_it_rain: 1,
            daily_chance_of_rain: 90,
            daily_will_it_snow: 0,
            daily_chance_of_snow: 0,
            condition: {
              text: "비",
              icon: "//cdn.weatherapi.com/weather/64x64/day/302.png",
              code: 1189,
            },
            uv: Math.max(1, uvIndex - 3),
          },
          astro: {
            sunrise: "05:26 AM",
            sunset: "07:46 PM",
            moonrise: "09:50 PM",
            moonset: "06:51 AM",
            moon_phase: "Waning Crescent",
            moon_illumination: 25,
            is_moon_up: 0,
            is_sun_up: 0,
          },
          hour: generateHourlyForecast(baseTemp - 1, 1189, "비", "//cdn.weatherapi.com/weather/64x64/day/302.png"),
        },
      ],
    },
  };
};

export const MOCK_SUB_DISTRICTS: { [key: string]: { name: string; koreanName: string; }[] } = {
  "Seoul": [
    { name: "Gangnam", koreanName: "강남구" },
    { name: "Mapo", koreanName: "마포구" },
    { name: "Seocho", koreanName: "서초구" },
    { name: "Jongno", koreanName: "종로구" },
    { name: "Yongsan", koreanName: "용산구" },
    { name: "Songpa", koreanName: "송파구" },
    { name: "Yeouido", koreanName: "여의도동" }
  ],
  "Busan": [
    { name: "Haeundae", koreanName: "해운대구" },
    { name: "Busanjin", koreanName: "부산진구" },
    { name: "Dongnae", koreanName: "동래구" },
    { name: "Suyeong", koreanName: "수영구" },
    { name: "Saha", koreanName: "사하구" },
    { name: "Gijang", koreanName: "기장군" }
  ],
  "Jeju": [
    { name: "Jeju-si", koreanName: "제주시" },
    { name: "Seogwipo", koreanName: "서귀포시" },
    { name: "Aewol", koreanName: "애월읍" },
    { name: "Hallasan", koreanName: "한라산" },
    { name: "Gujwa", koreanName: "구좌읍" },
    { name: "Seongsan", koreanName: "성산읍" }
  ],
  "Gangneung": [
    { name: "Gyeongpo", koreanName: "경포동" },
    { name: "Jumunjin", koreanName: "주문진읍" },
    { name: "Chodang", koreanName: "초당동" },
    { name: "Gyo-dong", koreanName: "교동" },
    { name: "Seongsan-myeon", koreanName: "성산면" },
    { name: "Anmok", koreanName: "안목해변" }
  ],
  "Tokyo": [
    { name: "Shinjuku", koreanName: "신주쿠" },
    { name: "Shibuya", koreanName: "시부야" },
    { name: "Ginza", koreanName: "긴자" },
    { name: "Akihabara", koreanName: "아키하바라" },
    { name: "Roppongi", koreanName: "롯폰기" }
  ],
  "New York": [
    { name: "Manhattan", koreanName: "맨해튼" },
    { name: "Brooklyn", koreanName: "브루클린" },
    { name: "Queens", koreanName: "퀸즈" },
    { name: "Bronx", koreanName: "브롱스" },
    { name: "Staten Island", koreanName: "스태튼아일랜드" }
  ]
};

const MOCK_DATA_STORE: { [key: string]: WeatherData } = {
  seoul: createMockDataForCity(
    "Seoul", "Seoul", "South Korea",
    26.8, "구름 많음", 1006, "//cdn.weatherapi.com/weather/64x64/day/119.png",
    70, 14.5, 6, 28
  ),
  busan: createMockDataForCity(
    "Busan", "Busan", "South Korea",
    25.2, "맑음", 1000, "//cdn.weatherapi.com/weather/64x64/day/113.png",
    65, 18.0, 8, 14
  ),
  jeju: createMockDataForCity(
    "Jeju", "Jeju", "South Korea",
    24.5, "비", 1189, "//cdn.weatherapi.com/weather/64x64/day/302.png",
    90, 22.4, 3, 11
  ),
  gangneung: createMockDataForCity(
    "Gangneung", "Gangwon", "South Korea",
    28.1, "맑음", 1000, "//cdn.weatherapi.com/weather/64x64/day/113.png",
    50, 11.2, 7, 19
  ),
  tokyo: createMockDataForCity(
    "Tokyo", "Tokyo", "Japan",
    29.4, "대체로 맑음", 1003, "//cdn.weatherapi.com/weather/64x64/day/116.png",
    62, 9.8, 8, 35
  ),
  newyork: createMockDataForCity(
    "New York", "New York", "United States",
    22.1, "안개", 1030, "//cdn.weatherapi.com/weather/64x64/day/143.png",
    88, 10.5, 4, 48
  ),
};

export const getMockWeatherData = (query: string): WeatherData => {
  const q = query.toLowerCase().replace(/\s+/g, "");
  
  // Check if query is a sub-district of our preset cities
  for (const parentCity of Object.keys(MOCK_SUB_DISTRICTS)) {
    const subDistricts = MOCK_SUB_DISTRICTS[parentCity];
    const match = subDistricts.find(sd => 
      sd.name.toLowerCase() === q || 
      sd.koreanName.toLowerCase() === q ||
      q.includes(sd.name.toLowerCase()) || 
      q.includes(sd.koreanName.toLowerCase())
    );

    if (match) {
      // Retrieve the base weather data for parent city
      const parentKey = parentCity.toLowerCase().replace(/\s+/g, "");
      const parentData = MOCK_DATA_STORE[parentKey] || MOCK_DATA_STORE.seoul;
      
      // Generate a slight random variation based on the sub-district's name length or characters
      const charSum = match.name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const tempDiff = ((charSum % 7) - 3) * 0.4; // +/- 1.2 degrees variation
      const humidityDiff = ((charSum % 5) - 2) * 3; // +/- 6% humidity variation
      const pm25Diff = (charSum % 9) - 4; // +/- 4 pm2.5 variation

      const baseTemp = Math.round((parentData.current.temp_c + tempDiff) * 10) / 10;
      const humidity = Math.min(100, Math.max(0, parentData.current.humidity + humidityDiff));
      const pm25 = Math.max(1, parentData.current.air_quality!.pm2_5 + pm25Diff);

      // Create dynamic cloned weather data with parent details, but custom location name
      return createMockDataForCity(
        match.koreanName, // Use sub-district as city name
        parentData.location.region,
        parentData.location.country,
        baseTemp,
        parentData.current.condition.text,
        parentData.current.condition.code,
        parentData.current.condition.icon,
        humidity,
        parentData.current.wind_kph,
        parentData.current.uv,
        pm25
      );
    }
  }

  // Try direct matches in English or Korean
  if (q.includes("seoul") || q.includes("서울")) return MOCK_DATA_STORE.seoul;
  if (q.includes("busan") || q.includes("부산")) return MOCK_DATA_STORE.busan;
  if (q.includes("jeju") || q.includes("제주")) return MOCK_DATA_STORE.jeju;
  if (q.includes("gangneung") || q.includes("강릉")) return MOCK_DATA_STORE.gangneung;
  if (q.includes("tokyo") || q.includes("도쿄")) return MOCK_DATA_STORE.tokyo;
  if (q.includes("newyork") || q.includes("뉴욕")) return MOCK_DATA_STORE.newyork;

  // For any other search, generate a dynamic responsive mock dataset so the search doesn't fail!
  // Determine standard characteristics based on search term
  const charSum = q.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const baseTemp = Math.round((15 + (charSum % 20)) * 10) / 10; // 15C to 35C range
  const humidity = 40 + (charSum % 50); // 40% to 90%
  const windKph = 5 + (charSum % 25); // 5 to 30 kph
  const uvIndex = 1 + (charSum % 10); // 1 to 10
  const pm25 = 5 + (charSum % 80); // 5 to 85

  const conditionChoices = [
    { text: "맑음", code: 1000, icon: "//cdn.weatherapi.com/weather/64x64/day/113.png" },
    { text: "대체로 맑음", code: 1003, icon: "//cdn.weatherapi.com/weather/64x64/day/116.png" },
    { text: "구름 많음", code: 1006, icon: "//cdn.weatherapi.com/weather/64x64/day/119.png" },
    { text: "흐림", code: 1009, icon: "//cdn.weatherapi.com/weather/64x64/day/122.png" },
    { text: "소나기", code: 1183, icon: "//cdn.weatherapi.com/weather/64x64/day/296.png" },
    { text: "비", code: 1189, icon: "//cdn.weatherapi.com/weather/64x64/day/302.png" },
    { text: "천둥번개를 동반한 비", code: 1276, icon: "//cdn.weatherapi.com/weather/64x64/day/389.png" },
  ];
  const choice = conditionChoices[charSum % conditionChoices.length];

  // Capitalize query for display name
  const capitalizedName = query.charAt(0).toUpperCase() + query.slice(1);

  return createMockDataForCity(
    capitalizedName,
    capitalizedName + " Region",
    "Worldwide (Demo)",
    baseTemp,
    choice.text,
    choice.code,
    choice.icon,
    humidity,
    windKph,
    uvIndex,
    pm25
  );
};
