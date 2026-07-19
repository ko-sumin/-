// Detailed Korean city mapping dictionary for robust weather search translations
export const koreanCityEnglishMap: { [key: string]: { en: string; country: string } } = {
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
export const subDistrictParentMap: { [key: string]: string } = {
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

// Common weather query normalizer helper
export function normalizeWeatherQuery(query: string): string {
  const lowerQuery = query.toLowerCase().trim();
  
  if (subDistrictParentMap[lowerQuery]) {
    return subDistrictParentMap[lowerQuery];
  }
  
  for (const [kr, detail] of Object.entries(koreanCityEnglishMap)) {
    if (lowerQuery.includes(kr)) {
      return `${detail.en}, ${detail.country}`;
    }
  }
  
  return query;
}

// Common weather API key cleanser helper
export function cleanApiKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  return key.trim().replace(/^['"`]|['"`]$/g, "");
}
