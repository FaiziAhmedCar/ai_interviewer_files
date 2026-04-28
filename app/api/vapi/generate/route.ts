import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getRandomInterviewCover } from "@/lib/utils";
import { db } from "@/firebase/admin";
export async function GET() {
  return Response.json(
    { success: true, data: "Hello from VAPI" },
    { status: 200 }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Vapi Tool Call Body:", body);

    const { type, role, level, techstack, amount, userid } = body.message?.toolCalls?.[0]?.function?.arguments || body;

    if (!role || !type || !level || !userid || !amount) {
      console.error("Missing fields:", { role, type, level, userid, amount });
      return Response.json(
        { success: false, error: "Missing required fields" },
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
    } catch (_parseError) {
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
