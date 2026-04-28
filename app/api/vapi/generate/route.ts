import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { getRandomInterviewCover } from "@/lib/utils";
import { db } from "@/firebase/admin";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function GET() {
  return Response.json(
    { success: true, data: "Hello from VAPI" },
    { status: 200 }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Vapi Tool Call Body:", JSON.stringify(body, null, 2));

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error("GOOGLE_GENERATIVE_AI_API_KEY is not set in environment variables");
      return Response.json(
        { success: false, error: "AI Configuration error" },
        { status: 500 }
      );
    }

    let args = body.message?.toolCalls?.[0]?.function?.arguments || body;
    
    // Handle stringified arguments if necessary
    if (typeof args === "string") {
      try {
        args = JSON.parse(args);
      } catch (_e) {
        console.error("Failed to parse arguments string:", args);
      }
    }

    const { type, role, level, techstack, amount, userid } = args;

    if (!role || !type || !level || !userid || !amount) {
      console.error("Missing fields in args:", { role, type, level, userid, amount });
      return Response.json(
        { success: false, error: "Missing required fields", received: { role, type, level, userid, amount } },
        { status: 400 }
      );
    }

    const { text: questionsResponse } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioral and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted as a clean JSON array of strings.
        Example: ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3
    `,
    });

    console.log("Gemini Response:", questionsResponse);

    // Clean the response in case Gemini includes markdown blocks
    const cleanedResponse = questionsResponse.replace(/```json|```/g, "").trim();
    let questions;
    try {
      questions = JSON.parse(cleanedResponse);
    } catch {
      console.error("Failed to parse Gemini response:", cleanedResponse);
      throw new Error("Invalid format returned from AI model");
    }

    const interview = {
      role: role,
      type: type,
      level: level,
      techstack: typeof techstack === "string" ? techstack.split(",") : Array.isArray(techstack) ? techstack : [],
      questions: questions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);
    console.log("Interview created successfully");

    return Response.json({ 
      results: [{
        toolCallId: body.message?.toolCalls?.[0]?.id,
        result: "Interview generated and saved successfully. You can now tell the user that the interview is ready and they should go to the dashboard."
      }]
    }, { status: 200 });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Generation Error:", error);
    return Response.json(
      { success: false, error: err.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
