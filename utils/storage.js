import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Keys ────────────────────────────────────────────────────────────────────
const SETTINGS_KEY = 'nutrichat_settings';
const getDayKey = (dateStr) => `nutrichat_day_${dateStr}`;

// ─── Default Settings ─────────────────────────────────────────────────────────
export const DEFAULT_SETTINGS = {
  calorieGoal: 1800,
  proteinGoal: 110,   // grams
  carbGoal: 175,      // grams
  fatGoal: 60,        // grams
  mode: 'cut',        // 'cut' | 'maintain' | 'bulk'
};

// ─── Settings ─────────────────────────────────────────────────────────────────
export async function getSettings() {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings) {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// ─── Day Data ─────────────────────────────────────────────────────────────────
// Structure per day:
// {
//   messages: [ { id, role: 'user'|'assistant', text, timestamp, data?: { calories, protein, carbs, fat, burned } } ],
//   totals: { calories, protein, carbs, fat, burned }
// }

export async function getDayData(dateStr) {
  try {
    const raw = await AsyncStorage.getItem(getDayKey(dateStr));
    return raw
      ? JSON.parse(raw)
      : { messages: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0, burned: 0 } };
  } catch {
    return { messages: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0, burned: 0 } };
  }
}

export async function saveDayData(dateStr, data) {
  await AsyncStorage.setItem(getDayKey(dateStr), JSON.stringify(data));
}

export async function addMessage(dateStr, message, nutritionData = null) {
  const day = await getDayData(dateStr);
  const msg = {
    id: Date.now().toString(),
    role: message.role,
    text: message.text,
    timestamp: new Date().toISOString(),
    data: nutritionData,
  };
  day.messages.push(msg);

  // Accumulate totals if nutrition data present
  if (nutritionData) {
    day.totals.calories += nutritionData.calories || 0;
    day.totals.protein += nutritionData.protein || 0;
    day.totals.carbs += nutritionData.carbs || 0;
    day.totals.fat += nutritionData.fat || 0;
    day.totals.burned += nutritionData.burned || 0;
  }

  await saveDayData(dateStr, day);
  return day;
}

// ─── Date Helpers ─────────────────────────────────────────────────────────────
export function getTodayStr() {
  return formatDateStr(new Date());
}

export function formatDateStr(date) {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

export function getWeekDates(centerDate = new Date()) {
  // Returns 7 dates: 3 before, today, 3 after
  const dates = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(centerDate);
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
}

export function getMonthDates(year, month) {
  // Returns all dates for a given month
  const dates = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    dates.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

export function getDayLabel(date) {
  return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
}

export function getDateNum(date) {
  return date.getDate();
}

// Check if a day has any logs
export async function getDaysWithLogs(dates) {
  const results = {};
  for (const d of dates) {
    const str = formatDateStr(d);
    const data = await getDayData(str);
    results[str] = data.messages.length > 0;
  }
  return results;
}
