import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  MapPin, 
  Wind, 
  Droplets, 
  Sun, 
  Sunset, 
  Eye, 
  Thermometer, 
  Compass, 
  Activity, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  X, 
  RotateCcw,
  Navigation,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Cloud,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { WeatherData, SearchSuggestion } from "./types";
import { getMockWeatherData, MOCK_CITIES, MOCK_SUB_DISTRICTS } from "./mockData";

export default function App() {
  // State managers
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCity, setActiveCity] = useState("Seoul");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<"C" | "F">("C");
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<"current" | "hourly" | "daily" | "details">("current");
  const [selectedRegion, setSelectedRegion] = useState("Seoul");
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Synchronize parent region when fetched weather data changes
  useEffect(() => {
    if (weatherData) {
      const cityName = weatherData.location.name.toLowerCase();
      const regionName = weatherData.location.region.toLowerCase();
      for (const [region, districts] of Object.entries(MOCK_SUB_DISTRICTS)) {
        const matchesSubDistrict = districts.some(d => 
          d.name.toLowerCase() === cityName || 
          d.koreanName.toLowerCase() === cityName
        );
        const matchesParent = region.toLowerCase() === cityName || region.toLowerCase() === regionName;

        if (matchesSubDistrict || matchesParent) {
          setSelectedRegion(region);
          break;
        }
      }
    }
  }, [weatherData]);

  // Load initial search history and default weather
  useEffect(() => {
    const saved = localStorage.getItem("weather_recent_searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Fetch weather data whenever activeCity changes
  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/weather?q=${encodeURIComponent(activeCity)}`);
        const result = await response.json();

        if (result.success && result.data) {
          setWeatherData(result.data);
          setIsDemoMode(false);
        } else if (result.error === "WEATHER_API_KEY_MISSING") {
          // Gracefully fallback to mock data
          const mockData = getMockWeatherData(activeCity);
          setWeatherData(mockData);
          setIsDemoMode(true);
        } else {
          setError(result.message || "날씨 정보를 불러오는 데 실패했습니다.");
          // Still fallback to mock data so the app never shows a blank error screen
          const mockData = getMockWeatherData(activeCity);
          setWeatherData(mockData);
          setIsDemoMode(true);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        // Fallback to mock data on network error
        const mockData = getMockWeatherData(activeCity);
        setWeatherData(mockData);
        setIsDemoMode(true);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [activeCity]);

  // Fetch search suggestions (autocomplete) as user types
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch(`/api/weather/search?q=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
        }
      } catch (e) {
        console.error("Autocomplete error:", e);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search execution
  const handleSearchSubmit = (cityToSearch: string) => {
    const trimmed = cityToSearch.trim();
    if (!trimmed) return;

    setActiveCity(trimmed);
    setSearchQuery("");
    setShowDropdown(false);

    // Save to search history
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 5); // Keep last 5 searches
      localStorage.setItem("weather_recent_searches", JSON.stringify(updated));
      return updated;
    });
  };

  const removeHistoryItem = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== item);
      localStorage.setItem("weather_recent_searches", JSON.stringify(updated));
      return updated;
    });
  };

  const clearAllHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem("weather_recent_searches");
  };

  // Temperature units converter
  const formatTemp = (celsius: number) => {
    if (unit === "C") {
      return `${Math.round(celsius)}°C`;
    } else {
      const fahrenheit = (celsius * 9) / 5 + 32;
      return `${Math.round(fahrenheit)}°F`;
    }
  };

  // City display name localizer supporting sub-districts and parent cities
  const getDisplayCityName = () => {
    if (!weatherData) return "";
    
    const activeLower = activeCity.toLowerCase().trim();
    
    // 1. Check if the activeCity is a known subdistrict, and return its Korean name
    for (const [region, districts] of Object.entries(MOCK_SUB_DISTRICTS)) {
      const match = districts.find(d => 
        d.name.toLowerCase() === activeLower || 
        d.koreanName.toLowerCase() === activeLower
      );
      if (match) {
        return match.koreanName;
      }
    }

    // 2. Otherwise map the main cities from weatherData.location.name
    const name = weatherData.location.name;
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes("seoul")) return "서울";
    if (nameLower.includes("busan")) return "부산";
    if (nameLower.includes("jeju")) return "제주";
    if (nameLower.includes("gangneung")) return "강릉";
    if (nameLower.includes("tokyo")) return "도쿄";
    if (nameLower.includes("new york")) return "뉴욕";
    
    return name;
  };

  // Dynamic backdrops depending on the weather conditions and day/night
  const getDynamicTheme = () => {
    if (!weatherData) {
      return {
        bg: "from-slate-900 via-indigo-950 to-zinc-950",
        accent: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
        text: "text-slate-100",
        cardBg: "bg-slate-900/40 backdrop-blur-md border border-slate-800/60",
        accentColor: "text-indigo-400"
      };
    }

    const conditionText = weatherData.current.condition.text;
    const conditionLower = conditionText.toLowerCase();
    const isDay = weatherData.current.is_day === 1;

    if (!isDay) {
      // Night themes
      if (conditionLower.includes("clear") || conditionText.includes("맑음") || conditionText.includes("쾌청")) {
        return {
          bg: "from-slate-950 via-slate-900 to-indigo-950",
          accent: "bg-yellow-400/10 text-yellow-200 border-yellow-400/20",
          text: "text-slate-100",
          cardBg: "bg-slate-900/40 backdrop-blur-md border border-slate-800/60",
          accentColor: "text-yellow-400"
        };
      }
      if (conditionLower.includes("rain") || conditionLower.includes("drizzle") || conditionLower.includes("shower") || conditionLower.includes("thunder") || conditionText.includes("비") || conditionText.includes("소나기") || conditionText.includes("천둥")) {
        return {
          bg: "from-zinc-950 via-indigo-950 to-slate-950",
          accent: "bg-blue-400/15 text-blue-300 border-blue-400/20",
          text: "text-slate-100",
          cardBg: "bg-slate-950/50 backdrop-blur-md border border-slate-800/50",
          accentColor: "text-blue-400"
        };
      }
      if (conditionLower.includes("snow") || conditionLower.includes("sleet") || conditionLower.includes("ice") || conditionText.includes("눈") || conditionText.includes("진눈깨비")) {
        return {
          bg: "from-slate-950 via-blue-950 to-zinc-900",
          accent: "bg-cyan-400/15 text-cyan-200 border-cyan-400/25",
          text: "text-slate-100",
          cardBg: "bg-white/5 backdrop-blur-md border border-white/10",
          accentColor: "text-cyan-400"
        };
      }
      return {
        bg: "from-slate-900 via-indigo-950 to-zinc-950",
        accent: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
        text: "text-slate-100",
        cardBg: "bg-slate-900/40 backdrop-blur-md border border-slate-800/60",
        accentColor: "text-indigo-400"
      };
    }

    // Day themes
    if (conditionLower.includes("sunny") || conditionLower.includes("clear") || conditionText.includes("맑음") || conditionText.includes("쾌청")) {
      return {
        bg: "from-amber-400 via-orange-400 to-yellow-300",
        accent: "bg-white/35 text-slate-900 border-white/40",
        text: "text-slate-900",
        cardBg: "bg-white/30 backdrop-blur-md border border-white/35 shadow-lg",
        accentColor: "text-amber-800"
      };
    }

    if (conditionLower.includes("partly") || conditionText.includes("대체로 맑음")) {
      return {
        bg: "from-sky-400 via-sky-500 to-blue-600",
        accent: "bg-white/20 text-white border-white/25",
        text: "text-white",
        cardBg: "bg-white/10 backdrop-blur-md border border-white/15 shadow-lg",
        accentColor: "text-yellow-300"
      };
    }

    if (conditionLower.includes("rain") || conditionLower.includes("drizzle") || conditionLower.includes("shower") || conditionText.includes("비") || conditionText.includes("소나기")) {
      return {
        bg: "from-blue-600 via-cyan-800 to-slate-900",
        accent: "bg-blue-400/25 text-blue-200 border-blue-400/30",
        text: "text-slate-100",
        cardBg: "bg-slate-950/30 backdrop-blur-md border border-slate-800/40 shadow-lg",
        accentColor: "text-blue-300"
      };
    }

    if (conditionLower.includes("thunder") || conditionLower.includes("lightning") || conditionText.includes("천둥")) {
      return {
        bg: "from-indigo-900 via-purple-900 to-slate-950",
        accent: "bg-purple-400/25 text-purple-200 border-purple-400/30",
        text: "text-slate-100",
        cardBg: "bg-purple-950/20 backdrop-blur-md border border-purple-800/30 shadow-lg",
        accentColor: "text-yellow-400"
      };
    }

    if (conditionLower.includes("snow") || conditionLower.includes("sleet") || conditionLower.includes("ice") || conditionText.includes("눈") || conditionText.includes("진눈깨비")) {
      return {
        bg: "from-sky-100 via-indigo-100 to-blue-200",
        accent: "bg-indigo-400/20 text-indigo-800 border-indigo-400/30",
        text: "text-slate-800",
        cardBg: "bg-white/40 backdrop-blur-md border border-white/50 shadow-lg",
        accentColor: "text-indigo-600"
      };
    }

    if (conditionLower.includes("mist") || conditionLower.includes("fog") || conditionLower.includes("cloudy") || conditionLower.includes("overcast") || conditionLower.includes("dust") || conditionLower.includes("haze") || conditionText.includes("안개") || conditionText.includes("흐림") || conditionText.includes("먼지") || conditionText.includes("황사")) {
      return {
        bg: "from-slate-400 via-zinc-500 to-neutral-600",
        accent: "bg-zinc-300/30 text-white border-zinc-300/40",
        text: "text-white",
        cardBg: "bg-black/15 backdrop-blur-md border border-white/10 shadow-lg",
        accentColor: "text-zinc-200"
      };
    }

    // Default Cloudy
    return {
      bg: "from-slate-500 via-sky-600 to-indigo-700",
      accent: "bg-white/20 text-white border-white/25",
      text: "text-white",
      cardBg: "bg-white/10 backdrop-blur-md border border-white/15",
      accentColor: "text-sky-200"
    };
  };

  const theme = getDynamicTheme();

  // Helper to format Date string to Korean friendly format
  const getKoreanDate = (dateStr: string) => {
    try {
      const days = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
      const date = new Date(dateStr);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const dayOfWeek = days[date.getDay()];
      return `${month}월 ${day}일 (${dayOfWeek})`;
    } catch (e) {
      return dateStr;
    }
  };

  // Helper to check what day of the week a date is (compared to today)
  const getDayLabel = (dateStr: string, index: number) => {
    if (index === 0) return "오늘";
    if (index === 1) return "내일";
    if (index === 2) return "모레";
    
    try {
      const days = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
      const date = new Date(dateStr);
      return days[date.getDay()];
    } catch (e) {
      return dateStr;
    }
  };

  // Formats AQI index to Korean descriptors
  const getAqiDescription = (epaIndex: number) => {
    switch (epaIndex) {
      case 1: return { text: "좋음", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" };
      case 2: return { text: "보통", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
      case 3: return { text: "민감군 위험", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" };
      case 4: return { text: "나쁨", color: "bg-rose-500/20 text-rose-400 border-rose-500/30" };
      case 5: return { text: "매우 나쁨", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" };
      case 6: return { text: "위험", color: "bg-red-500/20 text-red-400 border-red-500/30" };
      default: return { text: "보통", color: "bg-slate-500/20 text-slate-400 border-slate-500/30" };
    }
  };

  // Formats UV index to Korean descriptors & safety advice
  const getUvInfo = (uv: number) => {
    if (uv <= 2) return { label: "낮음", advice: "야외 활동에 큰 지장 없음" };
    if (uv <= 5) return { label: "보통", advice: "모자나 자외선 차단제 권장" };
    if (uv <= 7) return { label: "높음", advice: "햇볕 노출 최소화, 긴 옷 착용" };
    if (uv <= 10) return { label: "매우 높음", advice: "오전 10시~오후 3시 야외 자제" };
    return { label: "위험", advice: "실내 머무르기 권장" };
  };

  return (
    <div id="weather-app" className={`min-h-screen bg-gradient-to-br ${theme.bg} ${theme.text} font-sans transition-all duration-700 ease-in-out pb-16 px-4 md:px-8 pt-4`}>
      {/* Max container */}
      <div className="max-w-6xl mx-auto space-y-5">
        
        {/* Header bar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight font-display flex items-center gap-2">
              <Sun className="h-8 w-8 text-amber-300 animate-spin-slow" />
              오늘의 날씨
            </h1>
            <p className="text-xs opacity-75 font-mono">
              실시간 Weather API 날씨 조회 서비스
            </p>
          </div>

          {/* Configuration Banner / Status inside Header */}
          <div className="flex items-center gap-3">
            {/* Units Selector */}
            <div className="bg-white/10 rounded-full p-1 flex items-center border border-white/10">
              <button 
                id="unit-c-btn"
                onClick={() => setUnit("C")}
                className={`px-3 py-1 text-sm font-semibold rounded-full transition-all ${unit === "C" ? "bg-white text-slate-900 shadow-md" : "hover:bg-white/5"}`}
              >
                °C
              </button>
              <button 
                id="unit-f-btn"
                onClick={() => setUnit("F")}
                className={`px-3 py-1 text-sm font-semibold rounded-full transition-all ${unit === "F" ? "bg-white text-slate-900 shadow-md" : "hover:bg-white/5"}`}
              >
                °F
              </button>
            </div>

            {/* Mode Indicator */}
            {isDemoMode ? (
              <span id="demo-indicator" className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 animate-pulse">
                <AlertTriangle className="h-3.5 w-3.5" />
                데모 모드
              </span>
            ) : (
              <span id="live-indicator" className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5" />
                실시간 데이터
              </span>
            )}
          </div>
        </header>

        {/* Demo Mode Guide Banner */}
        {isDemoMode && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-950/40 backdrop-blur-md border border-amber-500/20 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <div className="bg-amber-500/20 p-2 rounded-lg text-amber-400 mt-0.5 md:mt-0">
                <Info className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-amber-300">Weather API Key를 설정해 주세요!</h4>
                <p className="text-xs text-amber-200/80 leading-relaxed">
                  현재는 고품질 데모 가상 날씨 데이터로 조회되고 있습니다. 실제 실시간 날씨 정보를 확인하려면 <br className="hidden md:inline" />
                  <strong>.env.example</strong>을 참고하여 <strong>WEATHER_API_KEY</strong>를 Secrets/환경 변수에 등록해 주세요.
                </p>
              </div>
            </div>
            <a 
              href="https://www.weatherapi.com/" 
              target="_blank" 
              rel="noreferrer"
              className="text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl transition shadow-lg shrink-0"
            >
              API Key 무료 발급받기
            </a>
          </motion.div>
        )}

        {/* Search Bar Input (Full width, extremely sleek) */}
        <section className="relative" ref={dropdownRef}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 opacity-60" />
            <input
              id="weather-search-input"
              type="text"
              placeholder="도시명 또는 동네 이름(영어 또는 한글)을 검색해 보세요... (예: 서울, 강남구, 해운대구, 애월읍, London)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchSubmit(searchQuery);
                }
              }}
              className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/10 focus:border-white/25 rounded-2xl py-3.5 pl-12 pr-16 text-sm outline-none placeholder:text-white/40 transition font-sans shadow-inner text-white"
            />
            <button
              id="search-btn"
              onClick={() => handleSearchSubmit(searchQuery)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-white text-slate-900 hover:bg-slate-100 font-semibold px-4 py-1.5 rounded-xl text-xs transition"
            >
              검색
            </button>
          </div>

          {/* Dropdown Suggestions & History */}
          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute z-50 top-full mt-2 w-full bg-slate-900/95 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl p-3 text-slate-100 overflow-hidden"
              >
                {/* Realtime API Suggestions */}
                {suggestions.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[11px] font-semibold tracking-wider text-slate-400 px-2.5 py-1 uppercase">추천 검색어</p>
                    <div className="space-y-1 mt-1">
                      {suggestions.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSearchSubmit(item.name)}
                          className="w-full text-left px-3 py-2.5 hover:bg-white/5 rounded-xl flex items-center justify-between text-xs transition group"
                        >
                          <span className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-sky-400 group-hover:scale-110 transition" />
                            <span className="font-semibold">{item.name}</span>
                            {item.region && <span className="opacity-50">, {item.region}</span>}
                          </span>
                          <span className="opacity-40 text-[10px] uppercase font-mono">{item.country}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Searches */}
                <div>
                  <div className="flex items-center justify-between px-2.5 py-1">
                    <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">최근 검색 기록</p>
                    {recentSearches.length > 0 && (
                      <button
                        id="clear-history-btn"
                        onClick={clearAllHistory}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-medium hover:underline flex items-center gap-1"
                      >
                        <RotateCcw className="h-3 w-3" />
                        기록 초기화
                      </button>
                    )}
                  </div>

                  {recentSearches.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mt-1.5">
                      {recentSearches.map((item, index) => (
                        <div
                          key={index}
                          onClick={() => handleSearchSubmit(item)}
                          className="flex items-center justify-between px-3 py-2 hover:bg-white/5 rounded-xl cursor-pointer group text-xs transition text-white"
                        >
                          <span className="flex items-center gap-2 font-medium">
                            <Clock className="h-3.5 w-3.5 text-slate-400 group-hover:text-white transition" />
                            {item}
                          </span>
                          <button
                            id={`remove-history-${index}`}
                            onClick={(e) => removeHistoryItem(e, item)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-rose-400 transition"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-4 italic">최근 검색 기록이 없습니다.</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Region & Sub-district (구/동) Selector Section */}
        <section className={`${theme.cardBg} rounded-3xl p-5 shadow-xl space-y-4`}>
          {/* Main Preset Regions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider opacity-85 flex items-center gap-1.5 text-white">
              <MapPin className="h-4 w-4" />
              지역 선택
            </span>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {MOCK_CITIES.map((city) => {
                const isActive = selectedRegion.toLowerCase() === city.name.toLowerCase();
                return (
                  <button
                    key={city.id}
                    onClick={() => {
                      setSelectedRegion(city.name);
                      setActiveCity(city.name); // Fetch parent city weather instantly
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                      isActive
                        ? "bg-white text-slate-900 border-white shadow-md scale-105"
                        : "bg-white/5 hover:bg-white/10 border-white/10 text-white"
                    }`}
                  >
                    {city.koreanName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub-district (구/동) Selector */}
          {MOCK_SUB_DISTRICTS[selectedRegion] && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider opacity-75 block text-white/90">
                세부 구/동 선택 ({selectedRegion === "Seoul" ? "서울" : 
                                 selectedRegion === "Busan" ? "부산" :
                                 selectedRegion === "Jeju" ? "제주" :
                                 selectedRegion === "Gangneung" ? "강릉" :
                                 selectedRegion === "Tokyo" ? "도쿄" :
                                 selectedRegion === "New York" ? "뉴욕" : selectedRegion})
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => setActiveCity(selectedRegion)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border cursor-pointer ${
                    activeCity.toLowerCase() === selectedRegion.toLowerCase()
                      ? "bg-white/20 border-white text-white font-bold scale-105 shadow"
                      : "bg-white/5 hover:bg-white/10 border-white/5 text-white"
                  }`}
                >
                  전체
                </button>
                {MOCK_SUB_DISTRICTS[selectedRegion].map((subDistrict) => {
                  const isCurrentActive = activeCity.toLowerCase() === subDistrict.name.toLowerCase() || 
                                          activeCity.toLowerCase() === subDistrict.koreanName.toLowerCase();
                  return (
                    <button
                      key={subDistrict.name}
                      onClick={() => setActiveCity(subDistrict.name)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border cursor-pointer ${
                        isCurrentActive
                          ? "bg-white/25 border-white text-white font-bold scale-105 shadow"
                          : "bg-white/5 hover:bg-white/10 border-white/5 text-white"
                      }`}
                    >
                      {subDistrict.koreanName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Loading Overlay */}
        {loading && !weatherData && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="h-10 w-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            <p className="text-sm opacity-85 animate-pulse">날씨 정보를 조회하고 있습니다...</p>
          </div>
        )}

        {/* Main Dashboard Layout */}
        {weatherData && (
          <div className="space-y-6">
            
            {/* 1. Super Clean Weather Hero (Header Card) */}
            <motion.div 
              id="weather-hero-card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${theme.cardBg} rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl text-center md:text-left`}
            >
              {/* Weather icon big backdrop glow */}
              <div className="absolute -right-12 -top-12 h-48 w-48 opacity-25 blur-3xl bg-white rounded-full pointer-events-none"></div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                {/* Location and primary status */}
                <div className="space-y-2">
                  <div className="flex items-center justify-center md:justify-start gap-1.5 opacity-80 text-xs font-mono font-bold tracking-wide uppercase">
                    <MapPin className="h-3.5 w-3.5 text-rose-400" />
                    <span>{weatherData.location.country}</span>
                    <span>•</span>
                    <span>{weatherData.location.region}</span>
                  </div>
                  
                  <h2 className="text-4xl font-extrabold tracking-tight font-display">
                    {getDisplayCityName()}
                  </h2>
                  
                  <p className="text-xs opacity-75">
                    {getKoreanDate(weatherData.location.localtime.split(" ")[0])} 기준 
                    <span className="font-mono ml-2 bg-white/10 px-2 py-0.5 rounded-lg">{weatherData.location.localtime.split(" ")[1]}</span>
                  </p>
                </div>

                {/* Primary Temperature representation */}
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-end">
                  <img 
                    src={weatherData.current.condition.icon} 
                    alt={weatherData.current.condition.text}
                    className="h-20 w-20 object-contain filter drop-shadow-[0_4px_10px_rgba(255,255,255,0.25)]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-center sm:text-left">
                    <div className="text-6xl font-black font-display tracking-tighter leading-none">
                      {formatTemp(weatherData.current.temp_c)}
                    </div>
                    <div className="flex items-center gap-2 mt-1 justify-center sm:justify-start">
                      <span className="text-sm font-bold bg-white/15 px-2.5 py-0.5 rounded-lg">{weatherData.current.condition.text}</span>
                      <span className="text-xs opacity-80">
                        {formatTemp(weatherData.forecast.forecastday[0].day.mintemp_c)} / {formatTemp(weatherData.forecast.forecastday[0].day.maxtemp_c)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 2. Menu Navigation Tabs Bar */}
            <div className="flex items-center justify-start overflow-x-auto gap-2 p-1.5 bg-black/20 backdrop-blur-md rounded-2xl border border-white/5 no-scrollbar">
              <button
                id="tab-current"
                onClick={() => setActiveTab("current")}
                className={`flex-1 min-w-[100px] py-3 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "current" 
                    ? "bg-white text-slate-900 shadow-md font-bold" 
                    : "hover:bg-white/5 text-white/70 hover:text-white"
                }`}
              >
                <Activity className="h-4 w-4" />
                오늘의 요약
              </button>
              <button
                id="tab-hourly"
                onClick={() => setActiveTab("hourly")}
                className={`flex-1 min-w-[100px] py-3 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "hourly" 
                    ? "bg-white text-slate-900 shadow-md font-bold" 
                    : "hover:bg-white/5 text-white/70 hover:text-white"
                }`}
              >
                <Clock className="h-4 w-4" />
                시간별 예보
              </button>
              <button
                id="tab-daily"
                onClick={() => setActiveTab("daily")}
                className={`flex-1 min-w-[100px] py-3 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "daily" 
                    ? "bg-white text-slate-900 shadow-md font-bold" 
                    : "hover:bg-white/5 text-white/70 hover:text-white"
                }`}
              >
                <Calendar className="h-4 w-4" />
                3일간 예보
              </button>
              <button
                id="tab-details"
                onClick={() => setActiveTab("details")}
                className={`flex-1 min-w-[100px] py-3 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "details" 
                    ? "bg-white text-slate-900 shadow-md font-bold" 
                    : "hover:bg-white/5 text-white/70 hover:text-white"
                }`}
              >
                <Wind className="h-4 w-4" />
                상세 날씨지표
              </button>
            </div>

            {/* 3. Conditional Tab Contents */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                {/* TAB 1: Today Summary (Essential Factors) */}
                {activeTab === "current" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 1. 기온 및 체감온도 */}
                    <div className={`${theme.cardBg} rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-md text-white`}>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-80">
                        <Thermometer className="h-4 w-4" />
                        <span>기온 & 체감 온도</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-3xl font-black">{formatTemp(weatherData.current.temp_c)}</p>
                        <p className="text-xs opacity-75">체감온도: <span className="font-bold">{formatTemp(weatherData.current.feelslike_c)}</span></p>
                      </div>
                      <div className="text-[10px] opacity-60 border-t border-white/5 pt-2">
                        최저 {formatTemp(weatherData.forecast.forecastday[0].day.mintemp_c)} / 최고 {formatTemp(weatherData.forecast.forecastday[0].day.maxtemp_c)}
                      </div>
                    </div>

                    {/* 2. 강수량 및 강수확률 */}
                    <div className={`${theme.cardBg} rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-md text-white`}>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-80">
                        <Droplets className="h-4 w-4" />
                        <span>실시간 강수량</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-3xl font-black">
                          {weatherData.current.precip_mm} <span className="text-xs font-bold">mm</span>
                        </p>
                        <p className="text-xs opacity-75">오늘 강수확률: <span className="font-bold">{weatherData.forecast.forecastday[0].day.daily_chance_of_rain}%</span></p>
                      </div>
                      <div className="text-[10px] opacity-60 border-t border-white/5 pt-2">
                        {weatherData.forecast.forecastday[0].day.daily_will_it_rain === 1 ? "오늘 비 예정 있음" : "오늘 비 예정 없음"}
                      </div>
                    </div>

                    {/* 3. 미세먼지 실시간 정보 */}
                    <div className={`${theme.cardBg} rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-md text-white`}>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-80">
                        <Activity className="h-4 w-4" />
                        <span>미세먼지 실시간 정보</span>
                      </div>
                      {weatherData.current.air_quality ? (
                        <div className="space-y-1.5">
                          <p className="text-2xl font-extrabold">
                            {weatherData.current.air_quality.pm2_5.toFixed(0)} <span className="text-xs font-normal opacity-70">㎍/㎥</span>
                          </p>
                          {(() => {
                            const epa = weatherData.current.air_quality["us-epa-index"];
                            const aqi = getAqiDescription(epa);
                            return (
                              <span className={`text-[10px] font-bold border rounded-lg px-2 py-0.5 inline-block ${aqi.color}`}>
                                대기질: {aqi.text}
                              </span>
                            );
                          })()}
                        </div>
                      ) : (
                        <p className="text-xs opacity-60">미세먼지 데이터 없음</p>
                      )}
                      <div className="text-[10px] opacity-60 border-t border-white/5 pt-2">
                        초미세먼지(PM2.5) 측정 기준
                      </div>
                    </div>

                    {/* 4. 실시간 날짜 및 시간 */}
                    <div className={`${theme.cardBg} rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-md text-white`}>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-80">
                        <Clock className="h-4 w-4" />
                        <span>실시간 기준 일시</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold truncate">
                          {getKoreanDate(weatherData.location.localtime.split(" ")[0])}
                        </p>
                        <p className="text-xs opacity-75">
                          조회 시각: <span className="font-mono bg-white/10 px-2 py-0.5 rounded-md font-bold">{weatherData.location.localtime.split(" ")[1]}</span>
                        </p>
                      </div>
                      <div className="text-[10px] opacity-60 border-t border-white/5 pt-2">
                        타임존: {weatherData.location.tz_id}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: Hourly slider */}
                {activeTab === "hourly" && (
                  <div className={`${theme.cardBg} rounded-2xl p-5 flex flex-col space-y-4 shadow-xl`}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold tracking-tight uppercase text-white/70 flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        시간별 기온 추이 (오늘)
                      </h3>
                      <span className="text-[10px] opacity-60 font-mono">← 좌우로 가볍게 밀어서 확인 →</span>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar pt-1">
                      {weatherData.forecast.forecastday[0].hour.map((hr, idx) => {
                        const currentHour = new Date().getHours();
                        const hrHour = parseInt(hr.time.split(" ")[1].split(":")[0]);
                        const isPast = hrHour < currentHour;

                        return (
                          <div 
                            key={idx} 
                            className={`flex flex-col items-center justify-between p-3.5 rounded-2xl min-w-[75px] text-center space-y-3 transition border ${
                              hrHour === currentHour 
                                ? "bg-white text-slate-900 border-white font-bold scale-105 shadow-md" 
                                : isPast 
                                  ? "opacity-35 hover:opacity-60 border-transparent bg-white/2" 
                                  : "bg-white/5 border-white/5 hover:bg-white/10"
                            }`}
                          >
                            <span className="text-[11px] font-bold block">
                              {hrHour === currentHour ? "지금" : `${hrHour}시`}
                            </span>
                            <img 
                              src={hr.condition.icon} 
                              alt={hr.condition.text} 
                              className="h-8 w-8 object-contain"
                              referrerPolicy="no-referrer"
                            />
                            <span className="text-xs font-extrabold">{formatTemp(hr.temp_c)}</span>
                            {hr.chance_of_rain > 20 ? (
                              <span className="text-[9px] text-sky-400 font-black flex items-center justify-center gap-0.5">
                                <Droplets className="h-2.5 w-2.5" />
                                {hr.chance_of_rain}%
                              </span>
                            ) : (
                              <span className="text-[9px] opacity-40">-</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 3: 3-Day predictions */}
                {activeTab === "daily" && (
                  <div className={`${theme.cardBg} rounded-2xl p-5 flex flex-col space-y-4 shadow-xl`}>
                    <h3 className="text-xs font-bold tracking-tight uppercase text-white/70 flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      향후 3일간 중기 예보 전망
                    </h3>

                    <div className="space-y-3.5">
                      {weatherData.forecast.forecastday.map((day, idx) => {
                        const temps = weatherData.forecast.forecastday.map(d => [d.day.mintemp_c, d.day.maxtemp_c]).flat();
                        const globalMin = Math.min(...temps);
                        const globalMax = Math.max(...temps);
                        const range = globalMax - globalMin;

                        const minPercent = ((day.day.mintemp_c - globalMin) / range) * 100;
                        const maxPercent = ((day.day.maxtemp_c - globalMin) / range) * 100;

                        return (
                          <div key={idx} className="grid grid-cols-12 gap-2 items-center border-b border-white/5 pb-3 last:border-0 last:pb-0">
                            {/* Day Label */}
                            <span className="col-span-3 text-xs font-bold">{getDayLabel(day.date, idx)}</span>
                            
                            {/* Condition Icon + Label */}
                            <span className="col-span-4 flex items-center gap-1.5 text-xs">
                              <img 
                                src={day.day.condition.icon} 
                                alt={day.day.condition.text} 
                                className="h-7 w-7 object-contain shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <span className="truncate max-w-[85px] opacity-95 font-medium">{day.day.condition.text}</span>
                            </span>

                            {/* Low Temp */}
                            <span className="col-span-1.5 text-right text-xs opacity-75 font-mono">{formatTemp(day.day.mintemp_c)}</span>

                            {/* Visual Bar range */}
                            <div className="col-span-2 px-2 flex items-center">
                              <div className="w-full bg-white/10 h-1.5 rounded-full relative overflow-hidden">
                                <div 
                                  className="absolute bg-gradient-to-r from-teal-400 to-amber-300 h-full rounded-full"
                                  style={{
                                    left: `${minPercent}%`,
                                    width: `${maxPercent - minPercent}%`
                                  }}
                                ></div>
                              </div>
                            </div>

                            {/* High Temp */}
                            <span className="col-span-1.5 text-right text-xs font-bold font-mono">{formatTemp(day.day.maxtemp_c)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 4: Detail Metrics */}
                {activeTab === "details" && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    {/* Detail 1: UV Index */}
                    <div className={`${theme.cardBg} rounded-2xl p-4 flex flex-col justify-between space-y-4 shadow-md`}>
                      <span className="text-[11px] font-bold text-white/60 flex items-center gap-1.5 uppercase tracking-wider">
                        <Sun className="h-3.5 w-3.5" />
                        자외선 지수
                      </span>
                      <div>
                        <h3 className="text-3xl font-extrabold tracking-tight font-display">{weatherData.current.uv}</h3>
                        <p className="text-xs font-extrabold mt-1 text-amber-300">{getUvInfo(weatherData.current.uv).label}</p>
                      </div>
                      <p className="text-[10px] opacity-75 leading-snug">{getUvInfo(weatherData.current.uv).advice}</p>
                    </div>

                    {/* Detail 2: Wind direction */}
                    <div className={`${theme.cardBg} rounded-2xl p-4 flex flex-col justify-between space-y-4 shadow-md`}>
                      <span className="text-[11px] font-bold text-white/60 flex items-center gap-1.5 uppercase tracking-wider">
                        <Wind className="h-3.5 w-3.5" />
                        바람 세기 & 풍향
                      </span>
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <h3 className="text-2xl font-extrabold tracking-tight font-display">
                            {weatherData.current.wind_kph} <span className="text-xs font-normal">km/h</span>
                          </h3>
                          <p className="text-xs font-extrabold mt-1 text-sky-300">{weatherData.current.wind_dir} 풍향</p>
                        </div>
                        <div 
                          className="h-9 w-9 rounded-full border border-white/20 bg-white/5 flex items-center justify-center shrink-0 shadow-inner"
                          style={{ transform: `rotate(${weatherData.current.wind_degree}deg)` }}
                        >
                          <Navigation className="h-3.5 w-3.5 text-sky-400 fill-sky-400" />
                        </div>
                      </div>
                      <p className="text-[10px] opacity-75 leading-tight">순간 돌풍 속도: {weatherData.current.gust_kph} km/h</p>
                    </div>

                    {/* Detail 3: Humidity */}
                    <div className={`${theme.cardBg} rounded-2xl p-4 flex flex-col justify-between space-y-4 shadow-md`}>
                      <span className="text-[11px] font-bold text-white/60 flex items-center gap-1.5 uppercase tracking-wider">
                        <Droplets className="h-3.5 w-3.5" />
                        습도
                      </span>
                      <div>
                        <h3 className="text-3xl font-extrabold tracking-tight font-display">{weatherData.current.humidity}%</h3>
                        <p className="text-xs font-bold mt-1 text-emerald-300">
                          {weatherData.current.humidity < 40 ? "건조함" : weatherData.current.humidity < 70 ? "쾌적함" : "습함"}
                        </p>
                      </div>
                      <p className="text-[10px] opacity-75 leading-tight">현재 이슬점 온도는 {formatTemp(weatherData.current.feelslike_c - 4.5)} 수준입니다.</p>
                    </div>

                    {/* Detail 4: Sun position */}
                    <div className={`${theme.cardBg} rounded-2xl p-4 flex flex-col justify-between space-y-4 shadow-md`}>
                      <span className="text-[11px] font-bold text-white/60 flex items-center gap-1.5 uppercase tracking-wider">
                        <Sunset className="h-3.5 w-3.5" />
                        일출 & 일몰 시각
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-left">
                        <div className="space-y-0.5">
                          <span className="text-[9px] opacity-75 block font-bold">일출</span>
                          <span className="text-xs font-bold">{weatherData.forecast.forecastday[0].astro.sunrise}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] opacity-75 block font-bold">일몰</span>
                          <span className="text-xs font-bold">{weatherData.forecast.forecastday[0].astro.sunset}</span>
                        </div>
                      </div>
                      <p className="text-[10px] opacity-75 truncate">달 형상: {weatherData.forecast.forecastday[0].astro.moon_phase}</p>
                    </div>

                  </div>
                )}
              </motion.div>
            </AnimatePresence>

          </div>
        )}

      </div>
    </div>
  );
}
