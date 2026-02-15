import { askHealthQuestion } from "../../../../lib/ai-health-chat";


export async function POST(req) {
    console.log("i think i came here")
  const body = await req.json();

  console.log("CHAT REQUEST BODY:", body);

  const { question, patient } = body;

//   console.log("PATIENT DATA:", patient);

  const reply = await askHealthQuestion(question, patient);
//   console.log("This is the reply \n"+reply)

  return Response.json({ reply });
}