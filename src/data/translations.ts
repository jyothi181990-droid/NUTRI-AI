import { LanguageCode } from '../types/nutrition';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
];

export interface UIStrings {
  tagline: string;
  nav: {
    home: string;
    scanner: string;
    nutrition: string;
    recipes: string;
    assistant: string;
    database: string;
    safety: string;
    dashboard: string;
    favourites: string;
    settings: string;
  };
  searchPlaceholder: string;
  soundOn: string;
  soundOff: string;
  heroTitle: string;
  heroSubtitle: string;
  scanFoodBtn: string;
  askAiBtn: string;
  safetyBanner: string;
}

export const UI_TRANSLATIONS: Record<LanguageCode, UIStrings> = {
  en: {
    tagline: 'EAT SMART • LIVE HEALTHY',
    nav: {
      home: 'Home',
      scanner: 'Food Scanner',
      nutrition: 'Nutrition',
      recipes: 'Recipe Studio',
      assistant: 'AI Assistant',
      database: 'Food Database',
      safety: 'Food Safety',
      dashboard: 'My Dashboard',
      favourites: 'Favourites',
      settings: 'Settings',
    },
    searchPlaceholder: 'Search foods in English, Telugu, Hindi, Tamil...',
    soundOn: 'Sound On',
    soundOff: 'Sound Off',
    heroTitle: 'Global & Indian Food Intelligence',
    heroSubtitle:
      'Inspect complete 20-nutrient composition, scan meals and packaged labels, explore regional recipes, and learn evidence-based food safety.',
    scanFoodBtn: 'Open Food Scanner',
    askAiBtn: 'Ask NutriAI Assistant',
    safetyBanner:
      'Visual analysis cannot detect hidden bacteria, toxins, or contamination. Always follow safe food handling and expiry guidance.',
  },
  te: {
    tagline: 'తెలివిగా తినండి • ఆరోగ్యంగా జీవించండి',
    nav: {
      home: 'హోమ్',
      scanner: 'ఫుడ్ స్కానర్',
      nutrition: 'పోషకాహారం',
      recipes: 'రెసిపీ స్టూడియో',
      assistant: 'AI సహాయకుడు',
      database: 'ఆహార డేటాబేస్',
      safety: 'ఆహార భద్రత',
      dashboard: 'నా డ్యాష్‌బోర్డ్',
      favourites: 'ఇష్టమైనవి',
      settings: 'సెట్టింగ్‌లు',
    },
    searchPlaceholder: 'తెలుగు, ఇంగ్లీష్ లేదా హిందీలో ఆహారం వెతకండి...',
    soundOn: 'ధ్వని ఆన్',
    soundOff: 'ధ్వని ఆఫ్',
    heroTitle: 'భారతీయ & ప్రపంచ ఆహార పోషక విజ్ఞానం',
    heroSubtitle:
      '20 పోషకాల పూర్తి వివరాలు చూడండి, ఆహారం మరియు ప్యాకెట్ లేబుల్స్ స్కాన్ చేయండి, తెలుగు మరియు ప్రపంచ వంటకాలను తెలుసుకోండి.',
    scanFoodBtn: 'ఫుడ్ స్కానర్ తెరవండి',
    askAiBtn: 'NutriAI ని అడగండి',
    safetyBanner:
      'ఫోటో ద్వారా దాగి ఉన్న బ్యాక్టీరియా లేదా విషపదార్థాలను గుర్తించలేము. సురక్షిత ఆహార నియమాలు పాటించండి.',
  },
  hi: {
    tagline: 'समझदारी से खाएं • स्वस्थ रहें',
    nav: {
      home: 'होम',
      scanner: 'फूड स्कैनर',
      nutrition: 'पोषण',
      recipes: 'रेसिपी स्टूडियो',
      assistant: 'AI सहायक',
      database: 'खाद्य डेटाबेस',
      safety: 'खाद्य सुरक्षा',
      dashboard: 'मेरा डैशबोर्ड',
      favourites: 'पसंदीदा',
      settings: 'सेटिंग्स',
    },
    searchPlaceholder: 'हिंदी, अंग्रेजी या क्षेत्रीय नाम से खोजें...',
    soundOn: 'ध्वनि चालू',
    soundOff: 'ध्वनि बंद',
    heroTitle: 'भारतीय और वैश्विक पोषण बुद्धिमत्ता',
    heroSubtitle:
      '20 पोषक तत्वों का पूरा विश्लेषण देखें, भोजन और फूड लेबल स्कैन करें, और भारतीय व अंतर्राष्ट्रीय व्यंजन खोजें।',
    scanFoodBtn: 'फूड स्कैनर खोलें',
    askAiBtn: 'NutriAI से पूछें',
    safetyBanner:
      'फोटो से छिपे हुए बैक्टीरिया या विषाक्त पदार्थों का पता नहीं लगाया जा सकता। हमेशा सुरक्षित खाद्य हैंडलिंग अपनाएं।',
  },
  ta: {
    tagline: 'புத்திசாலித்தனமாக உண்ணுங்கள் • ஆரோக்கியமாக வாழுங்கள்',
    nav: {
      home: 'முகப்பு',
      scanner: 'உணவு ஸ்கேனர்',
      nutrition: 'ஊட்டச்சத்து',
      recipes: 'சமையல் ஸ்டுடியோ',
      assistant: 'AI உதவியாளர்',
      database: 'உணவு தரவுத்தளம்',
      safety: 'உணவு பாதுகாப்பு',
      dashboard: 'என் டாஷ்போர்டு',
      favourites: 'பிடித்தவை',
      settings: 'அமைப்புகள்',
    },
    searchPlaceholder: 'தமிழ் அல்லது ஆங்கிலத்தில் உணவுகளைத் தேடுங்கள்...',
    soundOn: 'ஒலி ஆன்',
    soundOff: 'ஒலி ஆஃப்',
    heroTitle: 'இந்திய & உலகளாவிய உணவு நுண்ணறிவு',
    heroSubtitle:
      '20 ஊட்டச்சத்து விவரங்களை ஆராயுங்கள், உணவு மற்றும் லேபிள்களை ஸ்கேன் செய்யுங்கள், பாரம்பரிய சமையல் குறிப்புகளைக் காணுங்கள்.',
    scanFoodBtn: 'உணவு ஸ்கேனர் திற',
    askAiBtn: 'NutriAI-யிடம் கேளுங்கள்',
    safetyBanner:
      'புகைப்படங்கள் மூலம் கண்ணுக்குத் தெரியாத பாக்டீரியாக்களைக் கண்டறிய முடியாது. உணவுப் பாதுகாப்பு வழிகாட்டிகளைப் பின்பற்றவும்.',
  },
  kn: {
    tagline: 'ಬುದ್ಧಿವಂತಿಕೆಯಿಂದ ತಿನ್ನಿ • ಆರೋಗ್ಯವಾಗಿ ಬದುಕಿ',
    nav: {
      home: 'ಮುಖಪುಟ',
      scanner: 'ಆಹಾರ ಸ್ಕ್ಯಾನರ್',
      nutrition: 'ಪೋಷಣೆ',
      recipes: 'ಪಾಕವಿಧಾನ ಸ್ಟುಡಿಯೋ',
      assistant: 'AI ಸಹಾಯಕ',
      database: 'ಆಹಾರ ಡೇಟಾಬೇಸ್',
      safety: 'ಆಹಾರ ಸುರಕ್ಷತೆ',
      dashboard: 'ನನ್ನ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      favourites: 'ಮೆಚ್ಚಿನವುಗಳು',
      settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    },
    searchPlaceholder: 'ಕನ್ನಡ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಆಹಾರ ಹುಡುಕಿ...',
    soundOn: 'ಧ್ವನಿ ಆನ್',
    soundOff: 'ಧ್ವನಿ ಆಫ್',
    heroTitle: 'ಭಾರತೀಯ ಮತ್ತು ಜಾಗತಿಕ ಆಹಾರ ಪೋಷಣೆ',
    heroSubtitle:
      '20 ಪೋಷಕಾಂಶಗಳ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ, ಆಹಾರ ಮತ್ತು ಪ್ಯಾಕೆಟ್ ಲೇಬಲ್‌ಗಳನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.',
    scanFoodBtn: 'ಸ್ಕ್ಯಾನರ್ ತೆರೆಯಿರಿ',
    askAiBtn: 'NutriAI ಕೇಳಿ',
    safetyBanner:
      'ಫೋಟೋ ವಿಶ್ಲೇಷಣೆಯಿಂದ ಕಾಣದ ಬ್ಯಾಕ್ಟೀರಿಯಾ ಅಥವಾ ವಿಷಕಾರಿ ಅಂಶಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಲು ಸಾಧ್ಯವಿಲ್ಲ.',
  },
  ml: {
    tagline: 'അറിവോടെ കഴിക്കൂ • ആരോഗ്യത്തോടെ ജീവിക്കൂ',
    nav: {
      home: 'ഹോം',
      scanner: 'ഫുഡ് സ്കാനർ',
      nutrition: 'പോഷകാഹാരം',
      recipes: 'റെസിപ്പി സ്റ്റുഡിയോ',
      assistant: 'AI സഹായി',
      database: 'ഭക്ഷ്യ ഡാറ്റാബേസ്',
      safety: 'ഭക്ഷ്യ സുരക്ഷ',
      dashboard: 'എന്റെ ഡാഷ്‌ബോർഡ്',
      favourites: 'പ്രിയപ്പെട്ടവ',
      settings: 'ക്രമീകരണങ്ങൾ',
    },
    searchPlaceholder: 'മലയാളത്തിലോ ഇംഗ്ലീഷിലോ തിരയുക...',
    soundOn: 'ശബ്ദം ഓൺ',
    soundOff: 'ശബ്ദം ഓഫ്',
    heroTitle: 'ഇന്ത്യൻ & ആഗോള ഭക്ഷ്യ പോഷണ വിജ്ഞാനം',
    heroSubtitle:
      '20 പോഷക ഘടകങ്ങൾ പരിശോധിക്കുക, ഭക്ഷണവും ലേബലുകളും സ്കാൻ ചെയ്യുക.',
    scanFoodBtn: 'സ്കാനർ തുറക്കുക',
    askAiBtn: 'NutriAI-യോട് ചോദിക്കുക',
    safetyBanner:
      'ഫോട്ടോകളിലൂടെ ഒളിഞ്ഞിരിക്കുന്ന ബാക്ടീരിയകളെ കണ്ടെത്താൻ കഴിയില്ല. ഭക്ഷ്യ സുരക്ഷാ നിർദ്ദേശങ്ങൾ പാലിക്കുക.',
  },
  mr: {
    tagline: 'हुशारीने खा • निरोगी राहा',
    nav: {
      home: 'मुख्यपृष्ठ',
      scanner: 'फूड स्कॅनर',
      nutrition: 'पोषण',
      recipes: 'रेसिपी स्टुडिओ',
      assistant: 'AI सहाय्यक',
      database: 'अन्न डेटाबेस',
      safety: 'अन्न सुरक्षा',
      dashboard: 'माझा डॅशबोर्ड',
      favourites: 'आवडते',
      settings: 'सेटिंग्ज',
    },
    searchPlaceholder: 'मराठी किंवा इंग्रजीत अन्न शोधा...',
    soundOn: 'आवाज सुरू',
    soundOff: 'आवाज बंद',
    heroTitle: 'भारतीय आणि जागतिक अन्न पोषण विज्ञान',
    heroSubtitle:
      '२० पोषक तत्वांचे विश्लेषण पहा, अन्न व पॅकेट लेबल्स स्कॅन करा आणि पाककृती शोधा.',
    scanFoodBtn: 'स्कॅनर उघडा',
    askAiBtn: 'NutriAI ला विचारा',
    safetyBanner:
      'फोटोवरून अदृश्य जिवाणू किंवा विषारी घटक ओळखता येत नाहीत. नेहमी अन्न सुरक्षितता पाळा.',
  },
  bn: {
    tagline: 'বুদ্ধিমত্তার সাথে খান • সুস্থ থাকুন',
    nav: {
      home: 'হোম',
      scanner: 'ফুড স্ক্যানার',
      nutrition: 'পুষ্টি',
      recipes: 'রেসিপি স্টুডিও',
      assistant: 'AI সহায়ক',
      database: 'খাদ্য ডাটাবেস',
      safety: 'খাদ্য নিরাপত্তা',
      dashboard: 'আমার ড্যাশবোর্ড',
      favourites: 'পছন্দসমূহ',
      settings: 'সেটিংস',
    },
    searchPlaceholder: 'বাংলা বা ইংরেজিতে খাবার খুঁজুন...',
    soundOn: 'শব্দ চালু',
    soundOff: 'শব্দ বন্ধ',
    heroTitle: 'ভারতীয় ও বৈশ্বিক পুষ্টি বিজ্ঞান',
    heroSubtitle:
      '২০টি পুষ্টি উপাদানের তথ্য দেখুন, খাবার ও প্যাকেটের লেবেল স্ক্যান করুন।',
    scanFoodBtn: 'ফুড স্ক্যানার খুলুন',
    askAiBtn: 'NutriAI-কে জিজ্ঞাসা করুন',
    safetyBanner:
      'ছবি দেখে লুকানো ব্যাকটেরিয়া বা বিষাক্ত পদার্থ শনাক্ত করা সম্ভব নয়।',
  },
  gu: {
    tagline: 'સમજદારીથી ખાઓ • સ્વસ્થ રહો',
    nav: {
      home: 'હોમ',
      scanner: 'ફૂડ સ્કેનર',
      nutrition: 'પોષણ',
      recipes: 'રેસીપી સ્ટુડિયો',
      assistant: 'AI સહાયક',
      database: 'ખોરાક ડેટાબેઝ',
      safety: 'ખોરાક સુરક્ષા',
      dashboard: 'મારું ડેશબોર્ડ',
      favourites: 'મનપસંદ',
      settings: 'સેટિંગ્સ',
    },
    searchPlaceholder: 'ગુજરાતી અથવા અંગ્રેજીમાં ખોરાક શોધો...',
    soundOn: 'અવાજ ચાલુ',
    soundOff: 'અવાજ બંધ',
    heroTitle: 'ભારતીય અને વૈશ્વિક પોષણ વિજ્ઞાન',
    heroSubtitle:
      '૨૦ પોષક તત્વોની સંપૂર્ણ વિગતો જુઓ, ખોરાક અને લેબલ્સ સ્કેન કરો.',
    scanFoodBtn: 'સ્કેનર ખોલો',
    askAiBtn: 'NutriAI ને પૂછો',
    safetyBanner:
      'ફોટા દ્વારા છુપાયેલા બેક્ટેરિયા કે ઝેરી તત્વો ઓળખી શકાતા નથી.',
  },
  pa: {
    tagline: 'ਸਮਝਦਾਰੀ ਨਾਲ ਖਾਓ • ਸਿਹਤਮੰਦ ਰਹੋ',
    nav: {
      home: 'ਹੋਮ',
      scanner: 'ਫੂਡ ਸਕੈਨਰ',
      nutrition: 'ਪੋਸ਼ਣ',
      recipes: 'ਰੈਸਿਪੀ ਸਟੂਡੀਓ',
      assistant: 'AI ਸਹਾਇਕ',
      database: 'ਭੋਜਨ ਡਾਟਾਬੇਸ',
      safety: 'ਭੋਜਨ ਸੁਰੱਖਿਆ',
      dashboard: 'ਮੇਰਾ ਡੈਸ਼ਬੋਰਡ',
      favourites: 'ਮਨਪਸੰਦ',
      settings: 'ਸੈਟਿੰਗਾਂ',
    },
    searchPlaceholder: 'ਪੰਜਾਬੀ ਜਾਂ ਅੰਗਰੇਜ਼ੀ ਵਿੱਚ ਭੋਜਨ ਖੋਜੋ...',
    soundOn: 'ਆਵਾਜ਼ ਚਾਲੂ',
    soundOff: 'ਆਵਾਜ਼ ਬੰਦ',
    heroTitle: 'ਭਾਰਤੀ ਅਤੇ ਵਿਸ਼ਵ ਭੋਜਨ ਪੋਸ਼ਣ ਵਿਗਿਆਨ',
    heroSubtitle:
      '20 ਪੋਸ਼ਕ ਤੱਤਾਂ ਦੀ ਪੂਰੀ ਜਾਣਕਾਰੀ ਵੇਖੋ, ਭੋਜਨ ਅਤੇ ਲੇਬਲ ਸਕੈਨ ਕਰੋ।',
    scanFoodBtn: 'ਫੂਡ ਸਕੈਨਰ ਖੋਲ੍ਹੋ',
    askAiBtn: 'NutriAI ਨੂੰ ਪੁੱਛੋ',
    safetyBanner:
      'ਫੋਟੋਆਂ ਰਾਹੀਂ ਲੁਕੇ ਹੋਏ ਬੈਕਟੀਰੀਆ ਜਾਂ ਜ਼ਹਿਰੀਲੇ ਤੱਤਾਂ ਦਾ ਪਤਾ ਨਹੀਂ ਲਗਾਇਆ ਜਾ ਸਕਦਾ।',
  },
};
