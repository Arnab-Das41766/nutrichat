// ─── Groq API Client ──────────────────────────────────────────────────────────
import Constants from 'expo-constants';

const GROQ_API_KEY = Constants.expoConfig?.extra?.groqApiKey || process.env.EXPO_PUBLIC_GROQ_API_KEY || '';
const GROQ_MODEL = 'llama3-70b-8192';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are NutriChat, a personal health assistant for Arnab. You help him track meals and exercise.

When Arnab describes food he ate, extract:
- Total calories (kcal)
- Protein (grams)
- Carbs (grams)  
- Fat (grams)
- Type: "meal"

When Arnab describes exercise (like "walked 6km", "played football for 1 hour"), extract:
- Calories burned (kcal) — estimate based on his weight of 115kg
- Type: "exercise"

Always respond in this JSON format ONLY, no extra text:
{
  "reply": "your friendly conversational response here",
  "type": "meal" | "exercise" | "none",
  "calories": number or 0,
  "protein": number or 0,
  "carbs": number or 0,
  "fat": number or 0,
  "burned": number or 0
}

For exercise calorie burn, use Arnab's weight of 115kg for calculations.
Be encouraging, friendly, and concise. Use Indian food knowledge well (roti, dal, sabzi, rice, chai etc).
If the message is not about food or exercise (like a question or greeting), set type to "none" and all numbers to 0.`;

export async function sendToGroq(messages, userMessage) {
  const conversationHistory = messages
    .filter(m => m.role !== 'system')
    .slice(-10) // last 10 messages for context
    .map(m => ({ role: m.role, content: m.text }));

  conversationHistory.push({ role: 'user', content: userMessage });

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...conversationHistory,
      ],
      temperature: 0.4,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error: ${err}`);
  }

  const data = await response.json();
  const raw = data.choices[0].message.content.trim();

  // Parse JSON response
  try {
    // Strip markdown code blocks if present
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return {
      reply: parsed.reply || "Got it!",
      nutritionData: {
        type: parsed.type || 'none',
        calories: Number(parsed.calories) || 0,
        protein: Number(parsed.protein) || 0,
        carbs: Number(parsed.carbs) || 0,
        fat: Number(parsed.fat) || 0,
        burned: Number(parsed.burned) || 0,
      }
    };
  } catch {
    // Fallback if JSON parse fails
    return {
      reply: raw,
      nutritionData: { type: 'none', calories: 0, protein: 0, carbs: 0, fat: 0, burned: 0 }
    };
  }
}
