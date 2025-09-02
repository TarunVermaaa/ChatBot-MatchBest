import { type Message } from "ai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  detectWebsite,
  createWebsiteContext,
  logDetectionDetails,
} from "@/lib/website-detection";

// Initialize Gemini client
const genAI = new GoogleGenerativeAI("AIzaSyBBFkz39YByphNIBsrWuv3GO83jogelLHQ");

export async function POST(req: Request) {
  try {
    const {
      messages,
      websiteId,
      lang,
    }: { messages: Message[]; websiteId?: string; lang?: string } =
      await req.json();

    // Check if API key is available
    const GEMINI_API_KEY = "AIzaSyBBFkz39YByphNIBsrWuv3GO83jogelLHQ";
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set");
      return Response.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Create website context
    const websiteInfo = await detectWebsite(req, websiteId);
    logDetectionDetails(req, websiteInfo, websiteId);
    const {
      systemPrompt,
      websiteData,
      websiteInfo: detectedInfo,
    } = await createWebsiteContext(websiteInfo);

    console.log(
      `Making request to Gemini for ${detectedInfo.name} with ${messages.length} messages`
    );

    // Language detection and instruction
    let languageInstruction = "";
    if (lang === "hi") {
      languageInstruction = "\nReply in Hindi (Hinglish is also acceptable).";
    } else if (lang === "tl") {
      languageInstruction = "\nReply in Tagalog.";
    }

    // Prepare the final system prompt with website-specific data and language preference
    const fullSystemPrompt = `${systemPrompt}\n\n## Website Data\n${websiteData}${languageInstruction}`;

    console.log(
      `Making streaming request to Gemini for ${detectedInfo.name}...`
    );

    // Get the model with system instruction (only set once)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: fullSystemPrompt,
    });

    // Convert messages to Gemini format with conversation history
    const conversationHistory = messages.map((message) => ({
      role: message.role === "user" ? "user" : "model",
      parts: [{ text: message.content }],
    }));

    // Start chat with history for context continuity
    const chat = model.startChat({
      history: conversationHistory.slice(0, -1), // All messages except the last one
    });

    // Get the last user message
    const lastUserMessage = messages[messages.length - 1]?.content || "";

    // Generate streaming response with maintained context
    const result = await chat.sendMessageStream(lastUserMessage);

    // Create a readable stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            controller.enqueue(new TextEncoder().encode(chunkText));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error in chat API route:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return Response.json(
      {
        error: "Failed to process chat request",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
