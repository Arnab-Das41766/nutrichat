# NutriChat 🥗

Your personal AI calorie & macro tracker. Chat to log meals and workouts. All data stays on-device.

---

## Setup (one-time)

### 1. Install Expo CLI
```bash
npm install -g expo-cli
# OR use npx (no global install needed)
```

### 2. Install dependencies
```bash
cd NutriChat
npm install
```

### 3. Add your Groq API key
Open `utils/groq.js` and replace:
```js
const GROQ_API_KEY = 'YOUR_GROQ_API_KEY_HERE';
```
Get your free key at: https://console.groq.com

### 4. Run the app
```bash
npx expo start
```

This opens Expo Dev Tools in your browser. Then:
- **Android phone**: Install "Expo Go" from Play Store → scan the QR code
- **Android emulator**: Press `a` in terminal (needs Android Studio + emulator set up)

---

## Features

| Feature | How to use |
|---|---|
| **Log a meal** | Type: "2 rotis with dal and sabzi for lunch" |
| **Log exercise** | Type: "walked 6km this morning" or "played football 1hr" |
| **View past days** | Swipe the date strip at top |
| **Green day indicator** | A dot appears on days you've logged |
| **Calorie summary** | 3 boxes: Remaining / Consumed / Burned |
| **Macro tracker** | Protein, Carbs, Fat bars update automatically |
| **Change goals** | Tap ⚙️ → select Cut/Maintain/Bulk or set custom macros |

---

## How calorie remaining works

```
Remaining = Goal - Consumed + Burned
```

So if your goal is 1800, you ate 1400 kcal and burned 500 kcal:
```
Remaining = 1800 - 1400 + 500 = 900 kcal
```

---

## Build APK (to install without Expo Go)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account (free)
eas login

# Build APK for Android
eas build -p android --profile preview
```

This gives you an `.apk` file you can sideload directly onto your phone.

---

## Your default goals (can change in app)

| Mode | Calories | Protein | Carbs | Fat |
|---|---|---|---|---|
| ✂️ Cutting | 1800 kcal | 110g | 175g | 60g |
| ⚖️ Maintain | 2200 kcal | 100g | 220g | 70g |
| 💪 Bulking | 2700 kcal | 140g | 300g | 80g |

---

## Tech Stack

- **React Native + Expo** — cross-platform mobile
- **Groq API** (llama3-70b) — free, fast AI
- **AsyncStorage** — all data stored locally on your phone, no server
- **No database, no backend, no cost**
