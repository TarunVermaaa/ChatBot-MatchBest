import { type CoreMessage, streamText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
  detectWebsite,
  createWebsiteContext,
  logDetectionDetails,
} from "@/lib/website-detection";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  try {
    const {
      messages,
      websiteId,
      lang,
    }: { messages: CoreMessage[]; websiteId?: string; lang?: string } =
      await req.json();

    // Check if API key is available
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("OPENROUTER_API_KEY is not set");
      return Response.json(
        { error: "OPENROUTER_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Detect which website this request is coming from
    // Pass websiteId from request body to detection function
    const websiteConfig = detectWebsite(req, websiteId);

    // Log detection details for debugging
    logDetectionDetails(req, websiteConfig, websiteId);

    // Create website-specific context
    const { systemPrompt, websiteData, websiteInfo } =
      await createWebsiteContext(websiteConfig);

    console.log(
      `Making request to OpenRouter for ${websiteInfo.name} with ${messages.length} messages`
    );

    // Prepare the full system prompt with website data
    const fullSystemPrompt = `${systemPrompt}

## Website Data and Information

${websiteData}

## Important Instructions
- You are specifically representing ${websiteInfo.name}
- Only provide information about ${websiteInfo.name} services and offerings
- If asked about other companies or services, politely redirect to ${websiteInfo.name}
- Use the website data provided above to answer questions accurately
- Always stay in character as a ${websiteInfo.name} representative`;

    // Handle language preference
    let languageInstruction = "";
    if (lang === "bn") {
      languageInstruction = "\nReply in Bengali.";
    } else if (lang === "tl") {
      languageInstruction = "\nReply in Tagalog.";
    }

    // Prepare the final system prompt with website-specific data and language preference
    const finalSystemPrompt = `${fullSystemPrompt}${languageInstruction}`;

    const result = await streamText({
      model: openrouter("meta-llama/llama-3.3-70b-instruct"),
      system: finalSystemPrompt,
      messages,
    });

    return result.toDataStreamResponse();
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
