import { GoogleGenerativeAI } from "@google/generative-ai";

/* ---------- INIT ---------- */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* ---------- BIGINT SAFE SERIALIZER ---------- */
function safeSerialize(data) {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? Number(value) : value
    )
  );
}

/* ---------- MAIN FUNCTION ---------- */
export async function getHealthSuggestions(sensorData) {
  if (!sensorData || sensorData.length === 0) return null;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite",
    });

    /* ---------- CLEAN DATA ---------- */
    const cleanData = safeSerialize(sensorData);

    /* ---------- EXTRACT TEMPERATURES ---------- */
    const temps = cleanData
      .map(d => d.bodytemp)
      .filter(v => typeof v === "number" && !isNaN(v));

    if (!temps.length) {
      return "No temperature data available.";
    }

    /* ---------- COMPUTE STATS ---------- */
    const count = temps.length;
    const avg = temps.reduce((a, b) => a + b, 0) / count;
    const max = Math.max(...temps);
    const min = Math.min(...temps);

    /* ---------- OPTIONAL TREND DETECTION ---------- */
    let trend = "stable";
    if (temps.length >= 2) {
      const diff = temps[temps.length - 1] - temps[0];
      if (diff > 0.3) trend = "rising";
      else if (diff < -0.3) trend = "falling";
    }

    /* ---------- SUMMARY OBJECT ---------- */
    const summary = {
      samples: count,
      average_temp_c: Number(avg.toFixed(2)),
      highest_temp_c: max,
      lowest_temp_c: min,
      trend
    };

    /* ---------- PROMPT ---------- */
    const prompt = `
You are a medical health monitoring assistant.

Analyze this patient temperature summary.

DATA SUMMARY:
${JSON.stringify(summary, null, 2)}

IMPORTANT RULES:
- Do NOT list raw readings.
- Do NOT repeat numbers unnecessarily.
- Provide concise clinical interpretation.

Respond in MARKDOWN:

## Temperature Analysis
Explain what the data means medically.

## Abnormal Findings
Describe any concern.

## Health Risk Level
Low / Moderate / High with reason.

## Recommendation
Clear practical guidance.
`;

    /* ---------- GEMINI ---------- */
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return text?.trim();

  } catch (err) {
    console.error("Gemini error:", err);
    return null;
  }
}