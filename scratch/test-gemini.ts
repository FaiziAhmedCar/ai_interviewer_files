
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import dotenv from "dotenv";

dotenv.config();

async function test() {
  try {
    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: "Say hello",
    });
    console.log("Response:", text);
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
