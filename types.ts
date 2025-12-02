

export enum AppView {
  WELCOME = 'WELCOME',
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  HOME = 'HOME',
  HOROSCOPE = 'HOROSCOPE',
  KUNDLI = 'KUNDLI',
  COMPATIBILITY = 'COMPATIBILITY',
  CHAT = 'CHAT',
  FIND_RASHI = 'FIND_RASHI',
  SETTINGS = 'SETTINGS',
  PROFILE = 'PROFILE',
  PRIVACY = 'PRIVACY',
  NUMEROLOGY = 'NUMEROLOGY',
}

export enum Language {
  ENGLISH = 'English',
  HINDI = 'Hindi',
  MARATHI = 'Marathi',
  TAMIL = 'Tamil',
  TELUGU = 'Telugu',
  GUJARATI = 'Gujarati',
  KANNADA = 'Kannada',
  MALAYALAM = 'Malayalam',
  BENGALI = 'Bengali',
  PUNJABI = 'Punjabi',
  ODIA = 'Odia',
}

export enum HoroscopeTimeframe {
  TODAY = 'TODAY',
  TOMORROW = 'TOMORROW',
  WEEKLY = 'WEEKLY'
}

export interface ZodiacSign {
  name: string;
  symbol: string;
  dates: string;
  element: string;
  icon: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface TranslationKeys {
  welcome: string;
  selectLanguage: string;
  continue: string;
  home: string;
  horoscope: string;
  kundli: string;
  compatibility: string;
  chat: string;
  settings: string;
  findRashi: string;
  dailyInsight: string;
  luckyColor: string;
  luckyNumber: string;
  luckyNumberLabel?: string; // Optional if needed for backwards compat, though strictly should match
  mood: string;
  askAstro: string;
  birthDetails: string;
  name: string;
  dob: string;
  tob: string;
  pob: string;
  generate: string;
  partner: string;
  analyze: string;
  chatPlaceholder: string;
  loading: string;
  loadingSubtitle: string;
  zodiac: {
    aries: string;
    taurus: string;
    gemini: string;
    cancer: string;
    leo: string;
    virgo: string;
    libra: string;
    scorpio: string;
    sagittarius: string;
    capricorn: string;
    aquarius: string;
    pisces: string;
  };
  settingsTitle: string;
  notifications: string;
  enableAlerts: string;
  selectSign: string;
  saveChanges: string;
  viewDetails: string;
  timeframes: {
    today: string;
    tomorrow: string;
    weekly: string;
  };
  features: {
    zodiacSigns: string;
    kundliDesc: string;
    matchDesc: string;
  };
  profile: string;
  bio: string;
  editProfile: string;
  cancel: string;
  // Match Page Keys
  matchTitle: string;
  matchSubtitle: string;
  yourDetails: string;
  partnerDetails: string;
  gender: string;
  male: string;
  female: string;
  other: string;
  relType: string;
  relTypes: {
    love: string;
    marriage: string;
    friendship: string;
    general: string;
  };
  checkMatch: string;
  matchScore: string;
  strengths: string;
  challenges: string;
  advice: string;
  emotional: string;
  communication: string;
  longTerm: string;
  share: string;
  privacyPolicy: string;
  // Auth Keys
  login: string;
  signup: string;
  email: string;
  password: string;
  forgotPassword: string;
  dontHaveAccount: string;
  alreadyHaveAccount: string;
  continueWithGoogle: string;
  logout: string;
  welcomeBack: string;
  createAccount: string;
  numerology: string;
  comingSoon: string;
}