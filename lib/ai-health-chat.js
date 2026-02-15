import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* -------- CHAT WITH PATIENT DATA -------- */

export async function askHealthQuestion(question, latestVitals) {
  if (!question) return "Please ask a question.";

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite",
    });

    const prompt = `
You are a medical monitoring assistant.

Latest patient vitals:
Heart rate: ${latestVitals.heartrate}
SpO2: ${latestVitals.spo2}
Body temperature: ${latestVitals.bodytemp}
Environment pressure: ${latestVitals.env_pressure}
Steps: ${latestVitals.stepcount}

User question:
${question}

Give a clear medical explanation in simple language.
If values are dangerous, clearly warn.
Do not give diagnosis. Only guidance.
`;

    const result = await model.generateContent(prompt);
    console.log(result.response.text);
    return result.response.text();
  } catch (err) {
    console.error("Gemini chat error:", err);
    return "Unable to answer right now.";
  }
}
