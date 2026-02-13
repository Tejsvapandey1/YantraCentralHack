import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* ---------- BIGINT SAFE SERIALIZER ---------- */

function safeSerialize(data) {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? Number(value) : value
    )
  );
}

export async function getHealthSuggestions(sensorData) {
  if (!sensorData || sensorData.length === 0) return null;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const cleanData = safeSerialize(sensorData);

    const prompt = `
Analyze this health sensor data.

Data:
${JSON.stringify(cleanData, null, 2)}

Provide:
- abnormal values
- health risk
- suggestion
Keep it short.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return response.text();

  } catch (err) {
    console.error("Gemini error:", err);
    return null;
  }
}